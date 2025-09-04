import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import authRoute from "./Routes/auth.js";
import flightRoute from "./Routes/flights.js";
import bookingRoute from "./Routes/booking.js";
import ticketRoute from "./Routes/tickets.js";
import multer from "multer";
import * as Jimp from "jimp";              // ✅ Correct ESM import
import QrCode from "qrcode-reader";
import { google } from "googleapis";

dotenv.config();

const app = express();

const corsOptions = {
  origin: true,
};
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Middleware
app.use(express.json());
app.use(cors(corsOptions));

// Test API
app.get("/", (req, res) => {
  res.send("api is working");
});

const GOOGLE_CLIENT_ID =
  "22378356786-7lc62harj5csrpfhl3s20d1vha70f24q.apps.googleusercontent.com";
const GOOGLE_SECRET_KEY = "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";

mongoose.set("strictQuery", false);
const connectDB = async () => {
  try {
    console.log("🔍 Debugging MongoDB connection...");
    console.log("MONGO_URL from env:", process.env.MONGO_URL);
    await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected`);
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};

/* ========== QR CODE DECODING ENDPOINT ========== */
app.post("/api/v1/decode-qr", upload.single("image"), async (req, res) => {
  try {
    const imageData = req.file.buffer;
    const qrData = await decodeQRFromImage(imageData);
    if (qrData) {
      res.json({ status: true, data: qrData });
    } else {
      res.status(404).json({ status: false, message: "No QR code detected" });
    }
  } catch (error) {
    console.error("Error decoding QR code:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

/* ========== GOOGLE AUTH ========== */
app.post("/api/v1/create-tokens", async (req, res) => {
  try {
    console.log("Request body:", req.body);
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        status: false,
        message: "Authorization code is required",
      });
    }

    console.log("Received authorization code:", code);

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_SECRET_KEY,
      "http://localhost:5173"
    );

    try {
      const { tokens } = await oauth2Client.getToken(code);

      console.log("Tokens received from Google:", {
        access_token: tokens.access_token ? "✓ Present" : "✗ Missing",
        refresh_token: tokens.refresh_token ? "✓ Present" : "✗ Missing",
        scope: tokens.scope,
        expires_in: tokens.expiry_date,
      });

      oauth2Client.setCredentials(tokens);

      res.json({
        status: true,
        data: {
          access_token: tokens.access_token,
          refresh_token: tokens.refresh_token,
          expires_in: tokens.expiry_date,
          scope: tokens.scope,
          token_type: tokens.token_type || "Bearer",
          message: "Tokens generated successfully",
        },
      });
    } catch (tokenError) {
      console.error("Error exchanging code for tokens:", tokenError);

      if (tokenError.code === 400) {
        return res.status(400).json({
          status: false,
          message: "Invalid authorization code or code already used",
        });
      }

      return res.status(500).json({
        status: false,
        message: "Failed to exchange authorization code for tokens",
      });
    }
  } catch (error) {
    console.error("Error in token generation:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

/* ========== GOOGLE CALENDAR ========== */
app.get("/api/v1/get-calendar-events", async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: false,
        message: "Start date and end date are required",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_SECRET_KEY,
      "http://localhost:5173"
    );

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const response = await calendar.events.list({
      calendarId: "primary",
      timeMin: startDate,
      timeMax: endDate,
      singleEvents: true,
      orderBy: "startTime",
    });

    const events = response.data.items || [];

    res.json({
      status: true,
      data: events,
      message: "Calendar events retrieved successfully",
    });
  } catch (error) {
    console.error("Error in fetching calendar events:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

app.post("/api/v1/create-calendar-event", async (req, res) => {
  try {
    console.log("Creating calendar event with body:", req.body);

    const { summary, description, startDateTime, endDateTime, location } =
      req.body;

    if (!summary || !startDateTime || !endDateTime) {
      return res.status(400).json({
        status: false,
        message: "Summary, start time, and end time are required",
      });
    }

    const oauth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_SECRET_KEY,
      "http://localhost:5173"
    );

    console.log("REFRESH_TOKEN:", process.env.REFRESH_TOKEN);

    oauth2Client.setCredentials({
      refresh_token: process.env.REFRESH_TOKEN,
    });

    const calendar = google.calendar({ version: "v3", auth: oauth2Client });

    const event = {
      summary,
      description: description || "",
      location: location || "",
      start: {
        dateTime: startDateTime,
        timeZone: "America/Los_Angeles",
      },
      end: {
        dateTime: endDateTime,
        timeZone: "America/Los_Angeles",
      },
      colorId: "4",
    };

    const response = await calendar.events.insert({
      calendarId: "primary",
      resource: event,
    });

    res.json({
      status: true,
      data: {
        eventId: response.data.id,
        eventLink: response.data.htmlLink,
        summary: response.data.summary,
        start: response.data.start,
        end: response.data.end,
        message: "Calendar event created successfully",
      },
    });
  } catch (error) {
    console.error("Error in calendar event creation:", error);
    res.status(500).json({
      status: false,
      message: "Internal server error",
    });
  }
});

/* ========== HELPER FUNCTION: QR DECODER ========== */
async function decodeQRFromImage(imageData) {
  try {
    const image = await Jimp.read(imageData);

    return new Promise((resolve) => {
      const qr = new QrCode();
      qr.callback = (err, value) => {
        if (err) return resolve(null);
        resolve(value?.result || null);
      };
      qr.decode(image.bitmap);
    });
  } catch (error) {
    console.error("Error decoding QR code from image:", error);
    throw error;
  }
}

/* ========== ROUTES ========== */
app.use("/api/v1/auth", authRoute);
app.use("/api/v1/flights", flightRoute);
app.use("/api/v1/bookings", bookingRoute);
app.use("/api/v1/tickets", ticketRoute);

/* ========== START SERVER ========== */
app.listen(5001, () => {
  connectDB();
  console.log("🚀 Server is running on port 5001");
});
