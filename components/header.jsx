"use client";

import { useState, useRef, useEffect } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";

const Header = ({ username = "admin" }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleProfileClick = () => {
    // Handle profile navigation
    console.log("Profile clicked");
    setIsDropdownOpen(false);
  };

  const handleLogoutClick = () => {
    // Handle logout
    console.log("Logout clicked");
    setIsDropdownOpen(false);
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 sticky top-0 z-30">
      <div className="flex items-center justify-between">
        {/* Left side - Welcome message */}
        <div className="flex items-center">
          <h1 className="text-lg font-medium text-gray-900">
            Welcome,{" "}
            <span className="text-blue-600 font-semibold">{username}</span>
          </h1>
        </div>

        {/* Right side - Company name and profile */}
        <div className="flex items-center space-x-4">
          {/* Company name */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-gray-800">
              Cyber LMS Solutions
            </h2>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <ChevronDown
                className={`w-4 h-4 text-gray-600 transition-transform duration-200 ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Dropdown menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <button
                  onClick={handleProfileClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
