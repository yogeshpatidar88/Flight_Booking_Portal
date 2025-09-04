import React, { useEffect, useState, useContext } from "react";
import axios from "axios";
import { BACKENDURL } from "../Config/Config";
import { useNavigate, Link } from "react-router-dom";
import { TbEdit } from "react-icons/tb";
import uploadImageToCloudinary from "../utils/uploadImageToCloudinary";
import { authContext } from "../context/authContext";
import { toast } from "react-toastify";

const Profile = () => {
  const { dispatch } = useContext(authContext);

  const [userData, setUserData] = useState({});
  const [tickets, setTickets] = useState([]);
  const [userName, setUserName] = useState("");
  const [profilePic, setProfilePic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");

    axios
      .get(BACKENDURL + "/api/v1/auth/getUser", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((response) => {
        setUserData(response.data.user);
        setTickets(response.data.tickets);
        setUserName(response.data.user.name);
      })
      .catch((error) => {
        console.error("Error fetching user data:", error);
      });
  }, [navigate]);

  const handleLogout = () => {
    dispatch({ type: "LOGOUT" });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageData = await uploadImageToCloudinary(file);
        setProfilePic(imageData.secure_url);
      } catch (error) {
        console.error("Error uploading image:", error);
      }
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      let updatedData = { name: userName };

      if (profilePic) {
        const imageData = await uploadImageToCloudinary(profilePic);
        updatedData.profilePic = imageData.secure_url;
      }

      const response = await axios.put(
        BACKENDURL + "/api/v1/auth/updateUser",
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("Profile updated successfully");
      setUserData(response.data.user);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  return (
    <div className="px-6 md:px-12 py-10">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-6">
        {/* Header */}
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">My Profile</h1>

        {/* Profile Image */}
        <div className="w-32 h-32 rounded-full overflow-hidden relative mx-auto group">
          <img
            src={profilePic || userData.profilePic}
            alt="Profile"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50 flex justify-center items-center opacity-0 group-hover:opacity-100 transition">
            <label htmlFor="profile-pic-upload" className="cursor-pointer">
              <TbEdit className="text-white text-4xl" />
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* User Info */}
        <div className="mt-6 space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">User Name</label>
            <input
              type="text"
              value={userName}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-blue-400"
              onChange={(e) => setUserName(e.target.value)}
            />
          </div>
          <p className="text-sm text-gray-600">
            <span className="font-medium">Email:</span> {userData.email}
          </p>
        </div>

        {/* Buttons */}
        <div className="flex gap-4 mt-6">
          <button
            onClick={handleProfileUpdate}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Update Profile
          </button>
          <button
            onClick={() => {
              handleLogout();
              navigate("/login");
            }}
            className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition"
          >
            Logout
          </button>
        </div>

        {/* Tickets Section */}
        <div className="mt-10">
          <h2 className="text-xl font-semibold text-gray-700 mb-3">My Tickets</h2>
          {tickets.length > 0 ? (
            <table className="w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-100">
                  <th className="border border-gray-200 px-4 py-2 text-left">Ticket ID</th>
                  <th className="border border-gray-200 px-4 py-2 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {tickets.map((ticket) => (
                  <tr
                    key={ticket._id}
                    className="hover:bg-gray-50 transition"
                  >
                    <td className="border border-gray-200 px-4 py-2">{ticket.uid}</td>
                    <td className="border border-gray-200 px-4 py-2 text-center">
                      <Link
                        to={`/ticket/${ticket.uid}`}
                        className="text-blue-600 hover:underline"
                      >
                        View Ticket
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="text-gray-500 mt-3">No tickets found</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
