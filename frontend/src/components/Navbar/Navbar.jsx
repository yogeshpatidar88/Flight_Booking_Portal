import React, { useState, useContext } from "react";
import { RxHamburgerMenu } from "react-icons/rx";
import { Link } from "react-router-dom";
import { authContext } from "../../context/authContext";

function Navbar() {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  const isUserLoggedIn = localStorage.getItem("token") !== "null";

  const { user } = useContext(authContext);
  const [menuOpen, setMenuOpen] = useState(false);

  const userData = JSON.parse(localStorage.getItem("user"));

  const profilePic =
    userData?.profilePic ||
    "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png";

  const toggleMenu = () => setMenuOpen(!menuOpen);

  return (
    <header className="bg-white shadow-md">
      <nav className="flex justify-between items-center max-w-[1400px] mx-auto px-6 py-4">
        {/* Logo */}
        <Link to={"/"}>
          <h1 className="font-bold text-2xl text-gray-800 tracking-wide">
           ABVS AirConnect 🛫
          </h1>
        </Link>

        {/* Nav links (desktop) */}
        <ul className="hidden md:flex gap-10 text-gray-700 font-medium">
          <li>
            <Link to="/search" className="hover:text-blue-600">
              Search Flights
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-600">
              Search Hotels
            </Link>
          </li>
          <li>
            <Link to="#" className="hover:text-blue-600">
              Contact Us
            </Link>
          </li>
        </ul>

        {/* Right side */}
        <div className="flex items-center gap-6">
          {isUserLoggedIn ? (
            <Link to={isAdmin ? "/admin" : "/profile"}>
              <img
                src={profilePic}
                alt="profile"
                className="w-10 h-10 rounded-full border border-gray-300"
              />
            </Link>
          ) : (
            <Link to="/login">
              <button className="bg-blue-500 text-white px-5 py-2 rounded-full hover:bg-blue-600 transition">
                Sign In
              </button>
            </Link>
          )}

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-3xl text-gray-700"
          >
            <RxHamburgerMenu />
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-md">
          <ul className="flex flex-col items-center gap-6 py-6 text-gray-700 font-medium">
            <li>
              <Link to="/search" onClick={toggleMenu}>
                Search Flights
              </Link>
            </li>
            <li>
              <Link to="#" onClick={toggleMenu}>
                Search Hotels
              </Link>
            </li>
            <li>
              <Link to="#" onClick={toggleMenu}>
                Contact Us
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}

export default Navbar;
