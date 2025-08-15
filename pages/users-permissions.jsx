import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import Head from "next/head";
const ENCRYPTION_KEY = "cyberclipperSecretKey123!";
function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import React from "react"; // Added missing import for React.cloneElement

function UsersPermissionsContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({ show: false, message: "" });

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  useEffect(() => {
    if (error) {
      setNotification({ show: true, message: `Error loading user info: ${error}` });
      const timer = setTimeout(() => setNotification({ show: false, message: "" }), 2000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Responsive marginLeft for content (matches header)
  const getContentMarginLeft = () => {
    if (!isHydrated) {
      return 270; // Default to expanded sidebar during SSR
    }
    if (isMobile) {
      return 0;
    }
    return isOpen ? 270 : 64;
  };

  // Dynamically set main content top padding to header height
  useEffect(() => {
    function updateHeaderHeight() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Hamburger handler for mobile
  const handleMobileSidebarToggle = () => setMobileSidebarOpen((v) => !v);
  const handleMobileSidebarClose = () => setMobileSidebarOpen(false);

  // Ensure mobile sidebar is closed by default when switching to mobile view
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setMobileSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Placeholder summary data
  const summary = [
    {
      label: "Total Users",
      value: "12,847",
      change: "+12% vs last month",
      iconBg: "bg-green-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
      ),
      color: "text-green-500"
    },
    {
      label: "Active Users",
      value: "11,203",
      change: "+8% vs last month",
      iconBg: "bg-green-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
      ),
      color: "text-green-500"
    },
    {
      label: "VIP Customers",
      value: "1,247",
      change: "+15% vs last month",
      iconBg: "bg-green-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
      ),
      color: "text-green-500"
    },
    {
      label: "Suspended",
      value: "397",
      change: "-5% vs last month",
      iconBg: "bg-red-500",
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24"><path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v2h20v-2c0-3.3-6.7-5-10-5z" fill="currentColor"/></svg>
      ),
      color: "text-red-500"
    }
  ];
  // Placeholder user data
  const users = [
    {
      initials: "JD",
      name: "John Doe",
      email: "john@example.com",
      role: "Customer",
      joinDate: "2023-12-15",
      orders: 12,
      spent: "$1249.85",
      status: "Active",
      lastLogin: "2024-01-15"
    },
    {
      initials: "JS",
      name: "Jane Smith",
      email: "jane@example.com",
      role: "Customer",
      joinDate: "2023-11-20",
      orders: 8,
      spent: "$895.5",
      status: "Active",
      lastLogin: "2024-01-14"
    }
  ];

  // Only return after all hooks
  if (!ci || !aid) return null;
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }

  return (
    <>
       <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {notification.message}
          </div>
        </div>
      )}
      <div className="bg-[#fbf9f4] min-h-screen flex relative">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block fixed top-0 left-0 h-full z-40" style={{ width: 270 }}>
          <SideMenu />
        </div>
        {/* Sidebar for mobile (full screen overlay) */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button className="absolute top-4 right-4 z-60 text-3xl text-gray-500" aria-label="Close sidebar" onClick={handleMobileSidebarClose}>&times;</button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: getContentMarginLeft() }}>
          {/* Header */}
          <Header ref={headerRef} onMobileSidebarToggle={handleMobileSidebarToggle} mobileSidebarOpen={mobileSidebarOpen} username={user?.name || "admin"} companyName={user?.company || "company name"} />
          <main className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6" style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}>
            <div className="max-w-6xl mx-auto">
              <h1 className="text-3xl font-extrabold text-[#28BD78] mb-1">User Management</h1>
              <p className="text-gray-500 text-lg mb-6">Manage customer accounts and user permissions</p>
              {/* Summary cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                {summary.map((item, idx) => (
                  <div key={item.label} className="bg-white rounded-xl shadow border border-gray-100 p-4 flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${item.iconBg}`}>{React.cloneElement(item.icon, { className: 'w-5 h-5 text-white' })}</div>
                    <div>
                      <div className="text-lg font-bold text-gray-900">{item.value}</div>
                      <div className="text-gray-500 text-sm font-semibold">{item.label}</div>
                      <div className="text-green-600 text-xs font-semibold">{item.change}</div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Search and filter bar */}
              <div className="flex flex-col md:flex-row gap-3 mb-4 items-center bg-white p-3 rounded-xl shadow border border-gray-100">
                <input type="text" placeholder="Search users by name, email, or ID..." className="w-full md:flex-1 px-3 py-2 rounded-lg border text-gray-500 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#16a34a] text-base mb-2 md:mb-0" />
                <div className="flex flex-row w-full md:w-auto gap-2">
                  <select className="flex-1 px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base"><option>All Roles</option></select>
                  <select className="flex-1 px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base"><option>All Status</option></select>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-base text-gray-700 hover:bg-gray-50 whitespace-nowrap"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M3 6h18M3 12h18M3 18h18" stroke="#16a34a" strokeWidth="2" strokeLinecap="round"/></svg>Filter</button>
                </div>
              </div>
              {/* User table */}
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 font-semibold border-b text-xs">
                      <th className="py-3 px-4">USER</th>
                      <th className="py-3 px-4">ROLE</th>
                      <th className="py-3 px-4">JOIN DATE</th>
                      <th className="py-3 px-4">ORDERS</th>
                      <th className="py-3 px-4">TOTAL SPENT</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">LAST LOGIN</th>
                      <th className="py-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user, idx) => (
                      <tr key={user.email} className="border-b hover:bg-gray-50 transition">
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-base">{user.initials}</div>
                          <div>
                            <div className="font-bold text-base text-gray-900">{user.name}</div>
                            <div className="text-gray-400 text-xs">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs font-semibold">{user.role}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{user.joinDate}</td>
                        <td className="py-3 px-4 text-gray-700">{user.orders}</td>
                        <td className="py-3 px-4 font-bold text-gray-900">{user.spent}</td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">{user.status}</span>
                        </td>
                        <td className="py-3 px-4 text-gray-700">{user.lastLogin}</td>
                        <td className="py-3 px-4 flex gap-2 items-center">
                          <button className="text-green-500 hover:text-green-700" title="View"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7zm0 10a3 3 0 100-6 3 3 0 000 6z" stroke="currentColor" strokeWidth="2"/></svg></button>
                          <button className="text-green-500 hover:text-green-700" title="Message"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="currentColor" strokeWidth="2"/></svg></button>
                          <button className="text-green-500 hover:text-green-700" title="Edit"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z" stroke="currentColor" strokeWidth="2"/></svg></button>
                          <button className="text-red-500 hover:text-red-700" title="Suspend"><svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z" stroke="currentColor" strokeWidth="2"/></svg></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function UsersPermissions() {
  return (
    <SidebarProvider>
      <UsersPermissionsContent />
    </SidebarProvider>
  );
}
