"use client";

import React, { useState, useRef, useEffect, forwardRef } from "react";
import { User, LogOut, ChevronDown } from "lucide-react";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";

// Refactor Header to use forwardRef
const Header = forwardRef(function Header(
  { onMobileSidebarToggle, mobileSidebarOpen },
  ref
) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );
  const dropdownRef = useRef(null);
  const { isOpen } = useSidebar();
  const router = useRouter();
  const { token } = router.query;
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth < 640 : true
  );

  // Fetch logged-in employee info
  const { user } = useUserInfo();
  const displayUsername = user ? (user.firstName ? `${user.firstName} ${user.lastName || ""}`.trim() : (user.name || "Employee")) : "Employee";
  const displayCompany = user?.company || "Company";

  // Track window width for responsive margin
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Compute left and width for header
  const getHeaderLeft = () => {
    if (windowWidth < 640) return 0;
    return isOpen ? 270 : 64;
  };
  const getHeaderWidth = () => {
    if (windowWidth < 640) return "100%";
    return `calc(100% - ${isOpen ? 270 : 64}px)`;
  };

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

  // Track window width for mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleProfileClick = () => {
    // Navigate to admin info edit page, preserve token if available
    setIsDropdownOpen(false);
    if (token) {
      router.push(`/admininfo_edit?token=${encodeURIComponent(token)}`);
    } else {
      router.push("/admininfo_edit");
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutPopup(true);
    setIsDropdownOpen(false);
  };

  const handleConfirmLogout = () => {
    // Add actual logout logic here if needed
    setShowLogoutPopup(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("logoutSuccess", "1");
    }
    router.push("/auth/login");
  };

  const handleCancelLogout = () => {
    setShowLogoutPopup(false);
  };

  return (
    <header
      ref={ref}
      className="bg-white shadow-sm border-b border-gray-200 px-4 py-3 fixed top-0 z-30 transition-all duration-300"
      style={{ left: getHeaderLeft(), width: getHeaderWidth() }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Welcome message and mobile sidebar toggle */}
        <div className="flex items-center">
          {/* Hamburger for mobile only, JS-based */}
          {isMobile && (
            <button
              type="button"
              className="mr-3 bg-[#a259f7] text-white rounded-full p-2 shadow-lg focus:outline-none"
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={onMobileSidebarToggle}
              aria-label="Open sidebar"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5"
                />
              </svg>
            </button>
          )}
          <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
            Welcome,{" "}
            <span className="text-purple-600 font-semibold">{displayUsername}</span>
          </h1>
        </div>

        {/* Right side - Company name and profile */}
        <div className="flex items-center space-x-4">
          {/* Company name */}
          <div className="hidden md:block">
            <h2 className="text-lg font-semibold text-purple-500">
              {displayCompany}
            </h2>
          </div>

          {/* Profile dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center overflow-hidden">
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
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-blue-500 hover:bg-gray-50 transition-colors duration-150"
                >
                  <User className="w-4 h-4" />
                  <span>Profile</span>
                </button>
                <button
                  onClick={handleLogoutClick}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-left text-red-500 hover:bg-gray-50 transition-colors duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            )}
            {/* Logout Confirmation Popup */}
            {showLogoutPopup && (
              <div className="fixed inset-0 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg shadow-lg p-6 w-80 border border-gray-200 flex flex-col items-center">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">
                    Confirm Logout
                  </h3>
                  <p className="mb-6 text-gray-600">
                    Are you sure you want to logout?
                  </p>
                  <div className="flex space-x-12">
                    <button
                      onClick={handleConfirmLogout}
                      className="px-4 py-2 rounded bg-red-600 text-white font-semibold hover:bg-red-700 transition-colors duration-150"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={handleCancelLogout}
                      className="px-4 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors duration-150"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
