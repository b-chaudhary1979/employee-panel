import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import CryptoJS from "crypto-js";
import Support from "../components/support";

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
function encryptToken(ci, aid) {
  const data = JSON.stringify({ ci, aid });
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

function DashboardContent() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
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

  // Only return after all hooks
  if (!ci || !aid) return null;
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }

  return (
    <>
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
        <div
          className="hidden sm:block fixed top-0 left-0 h-full z-40"
          style={{ width: 270 }}
        >
          <SideMenu />
        </div>
        {/* Sidebar for mobile (full screen overlay) */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button
              className="absolute top-4 right-4 z-60 text-3xl text-gray-500"
              aria-label="Close sidebar"
              onClick={handleMobileSidebarClose}
            >
              &times;
            </button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}
        {/* Main content area */}
        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-300"
          style={{ marginLeft: getContentMarginLeft() }}
        >
          {/* Header */}
          <Header
            ref={headerRef}
            onMobileSidebarToggle={handleMobileSidebarToggle}
            mobileSidebarOpen={mobileSidebarOpen}
            username={user?.name || "admin"}
            companyName={user?.company || "company name"}
          />
          <main
            className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-extrabold text-[#7c3aed] mt-8">Dashboard</h1>
              <p className="mt-2 text-gray-500 text-lg">Welcome back! Here's what's happening with your company today.</p>
              {/* Stat Cards Section */}
              <div
                className="w-full"
                style={{
                  overflowX: "auto",
                  paddingBottom: "1rem",
                }}
              >
                <div
                  className="grid gap-6 mt-8"
                  style={{
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    minWidth: 0,
                  }}
                >
                  {/* Total Employees */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/employees?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Employees</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">1,234</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-blue-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Passwords */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/security?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Passwords</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">567</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-pink-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M12 11c0-1.104.896-2 2-2s2 .896 2 2v1h-4v-1zm6 1v-1a6 6 0 10-12 0v1a2 2 0 00-2 2v5a2 2 0 002 2h12a2 2 0 002-2v-5a2 2 0 00-2-2z' /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Products */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/products?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Products</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">89</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-yellow-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M3 7h18M3 12h18M3 17h18' /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Users */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/users-permissions?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Users</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">2,345</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-purple-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a4 4 0 00-3-3.87M9 20H4v-2a4 4 0 013-3.87M16 7a4 4 0 11-8 0 4 4 0 018 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Tasks */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/notes-tasks?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Tasks</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">120</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-green-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Announcements */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/announcements?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Announcements</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">15</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-red-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 13V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0a2 2 0 01-2 2H7a2 2 0 01-2-2m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6' /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  {/* Total Media */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 cursor-pointer group"
                    onClick={() => {
                      if (ci && aid) {
                        const newToken = encryptToken(ci, aid);
                        router.push(`/data?token=${encodeURIComponent(newToken)}`);
                      }
                    }}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Total Media</span>
                        <div className="text-3xl font-extrabold mt-2 text-purple-600">42</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view</span>
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-14 h-14 rounded-lg bg-indigo-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns='http://www.w3.org/2000/svg' className='h-7 w-7 text-white' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M15 10l4.553-2.276A2 2 0 0021 6.382V17.618a2 2 0 01-1.447 1.894L15 17.618M9 10l-4.553-2.276A2 2 0 003 6.382V17.618a2 2 0 001.447 1.894L9 17.618' /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Learn How to Use Section */}
              <div className="w-full rounded-xl bg-gradient-to-r from-[#a259f7] to-[#b78aeb] shadow-md p-8 mt-10 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Learn How to Use the Admin Panel</h2>
                <p className="text-white/90 mb-5 max-w-2xl">
                  Explore the features and capabilities of your admin panel in a safe, interactive environment. Try out different options, see how things work, and become a pro at managing your company!
                </p>
                <button
                  className="px-6 py-2 rounded-full font-semibold text-[#a259f7] bg-white hover:bg-gray-100 shadow transition-colors text-lg"
                  onClick={() => router.push(`/playground${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                >
                  Learn More
                </button>
              </div>

              {/* Terms & Privacy Section */}
              <div className="w-full rounded-xl bg-white border border-gray-100 shadow-md p-8 mt-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#a259f7' }}>Terms & Privacy</h2>
                <p className="text-gray-700 mb-2 max-w-2xl">
                  We value your trust and are committed to protecting your data. Please take a moment to review our Terms of Service and Privacy Policy to understand your rights and responsibilities as an admin panel user.
                </p>
                <p className="text-gray-700 mb-6 max-w-2xl">
                  Staying informed helps you make the most of our platform while ensuring your information is handled with care. Your privacy and security are our top priorities.
                </p>
                <div className="flex gap-4 flex-wrap justify-center">
                  <button
                    className="px-6 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-[#a259f7] to-[#b78aeb] hover:from-[#b78aeb] hover:to-[#a259f7] shadow transition-colors text-lg"
                    onClick={() => router.push(`/terms${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                  >
                    Read Terms
                  </button>
                  <button
                    className="px-6 py-2 rounded-full font-semibold text-[#a259f7] bg-white border border-[#a259f7] hover:bg-[#f5edff] shadow transition-colors text-lg"
                    onClick={() => router.push(`/privacy${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                  >
                    Read Privacy Policy
                  </button>
                </div>
              </div>

              {/* Support Component */}
              <Support />
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function Dashboard() {
  return (
    <SidebarProvider>
      <DashboardContent />
    </SidebarProvider>
  );
}
