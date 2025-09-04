import React from "react";
import { MdOutlineAirplaneTicket } from "react-icons/md";
import { CiClock2 } from "react-icons/ci";

const TicketContainer = ({ ticketData, bookingsData }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const monthNames = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ];
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  const calcDuration = (departTime, arriveTime) => {
    if (!departTime || !arriveTime) return "Duration not available";

    const [departHour, departMinute] = departTime.split(":").map(Number);
    const [arriveHour, arriveMinute] = arriveTime.split(":").map(Number);

    const departTotal = departHour * 60 + departMinute;
    let arriveTotal = arriveHour * 60 + arriveMinute;

    if (arriveTotal < departTotal) arriveTotal += 24 * 60;

    const durationMinutes = arriveTotal - departTotal;
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="flex flex-col md:flex-row mt-6 shadow-lg rounded-2xl overflow-hidden bg-gradient-to-br from-white to-gray-50 border border-gray-200">
      {/* Left: Flight details */}
      <div className="w-full md:w-[60%] flex flex-col bg-white">
        {/* Header */}
        <div className="flex items-center gap-3 bg-gray-100 py-3 px-5 border-b border-gray-200">
          <img
            src="https://phshirt.com/wp-content/uploads/2022/11/Air-Asia-Logo.png"
            alt="Airline Logo"
            className="w-[70px] h-[35px] object-contain"
          />
          <p className="text-lg font-semibold">{ticketData.airlineName} Airlines</p>
        </div>

        {/* Body */}
        <div className="p-6 flex-1 flex flex-col justify-between">
          {/* Route */}
          <div className="flex justify-between items-center">
            {/* Depart */}
            <div className="text-center">
              <p className="text-lg font-bold">{ticketData.from}</p>
              <p className="text-sm text-gray-500">Depart</p>
              <p className="text-base font-semibold">{ticketData.departTime}</p>
              <p className="text-sm text-gray-600">{formatDate(ticketData.departDate)}</p>
            </div>

            {/* Duration */}
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
              <div className="border-t border-dashed border-blue-400 w-10 lg:w-20"></div>
              <span className="text-xs lg:text-sm px-3 py-1 bg-blue-100 text-blue-600 rounded-full font-medium">
                {calcDuration(ticketData.departTime, ticketData.arriveTime)}
              </span>
              <div className="border-t border-dashed border-blue-400 w-10 lg:w-20"></div>
              <div className="w-3 h-3 rounded-full bg-blue-400"></div>
            </div>

            {/* Arrival */}
            <div className="text-center">
              <p className="text-lg font-bold">{ticketData.to}</p>
              <p className="text-sm text-gray-500">Arrival</p>
              <p className="text-base font-semibold">{ticketData.arriveTime}</p>
              <p className="text-sm text-gray-600">{formatDate(ticketData.arriveDate)}</p>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-6 flex flex-col md:flex-row gap-3">
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg text-gray-700">
              <MdOutlineAirplaneTicket size={18} />
              <p className="text-xs">Show e-ticket + ID during check-in</p>
            </div>
            <div className="flex items-center gap-2 bg-gray-100 p-3 rounded-lg text-gray-700">
              <CiClock2 size={18} />
              <p className="text-xs">Arrive at gate at least 15 mins before boarding</p>
            </div>
          </div>
        </div>
      </div>

      {/* Divider (cut-line) */}
      <div className="hidden md:block border-l-2 border-dashed border-gray-400"></div>
      <div className="block md:hidden border-t-2 border-dashed border-gray-400"></div>

      {/* Right: Passenger details */}
      <div className="w-full md:w-[40%] bg-white flex flex-col">
        {/* Class */}
        <div className="p-4 bg-gray-100 border-b border-gray-200 flex justify-between items-center">
          <p className="text-sm font-semibold text-blue-600">Economy Class</p>
          <span className="text-xs text-gray-500">Boarding Pass</span>
        </div>

        {/* Passenger Info */}
        <div className="p-5 flex-1 flex flex-col gap-4">
          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Name</p>
              <p className="text-sm">{bookingsData.fName} {bookingsData.lName}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Email</p>
              <p className="text-sm">{bookingsData.email}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row justify-between gap-4">
            <div>
              <p className="text-sm font-semibold">Passport Number</p>
              <p className="text-sm">{bookingsData.passportNumber}</p>
            </div>
            <div>
              <p className="text-sm font-semibold">Booking Code</p>
              <p className="text-sm">{bookingsData._id}</p>
            </div>
          </div>

          {/* Seat + QR */}
          <div className="flex justify-between gap-4 mt-4">
            <div className="flex-1 bg-gray-100 rounded-xl p-4 flex flex-col items-center">
              <p className="text-base font-semibold">Seat</p>
              <p className="text-xl font-bold">{bookingsData.seat}</p>
            </div>
            <div className="flex-1 bg-gray-100 rounded-xl p-4 flex items-center justify-center">
              <img
                src={`https://quickchart.io/qr?text=https://abvssystem.web.app/verify-ticket/${bookingsData._id}`}
                alt="QR Code"
                className="w-24 h-24 object-contain"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TicketContainer;
