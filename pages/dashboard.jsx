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
import EmployeeCard from "../components/EmployeeCard";
import useStoreEmployees from "../hooks/useStoreEmployees";
import useStorePassword from "../hooks/useStorePassword";
import useNotesTasks from "../hooks/useNotesTasks";
import useAnnouncements from "../hooks/useAnnouncements";
import { totalMedia } from "./data";

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
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Fetch data from hooks
  const employeesHook = useStoreEmployees(ci);
  const passwordsHook = useStorePassword(ci, aid);
  const tasksHook = useNotesTasks(ci);
  const announcementsHook = useAnnouncements(ci, aid);

  // Loading and error states
  const isAnyLoading = loading || employeesHook.loading || passwordsHook.loading || tasksHook.loading || announcementsHook.loading;
  const anyError = error || employeesHook.error || passwordsHook.error || tasksHook.error || announcementsHook.error;

  // Real counts
  const totalEmployees = employeesHook.employees?.length || 0;
  const totalPasswords = passwordsHook.passwords?.length || 0;
  const totalTasks = tasksHook.tasks?.length || 0;
  const totalAnnouncements = announcementsHook.announcements?.length || 0;

  // Additional employee-specific stats
  const completedTasks = (tasksHook.tasks || []).filter(t => t.completed === true).length;
  const pendingTasks = (tasksHook.tasks || []).filter(t => t.completed !== true).length;
  const highPriorityTasks = (tasksHook.tasks || []).filter(t => t.priority === 'High' && t.completed !== true).length;
  const overdueTasks = (tasksHook.tasks || []).filter(t => {
    if (t.completed === true || !t.dueDate) return false;
    return new Date(t.dueDate) < new Date();
  }).length;
  const department = user?.department || 'N/A';

  // Mock data for products, users, media
  // Use the real totalMedia from the Data page
  // (If you want to fetch from Firestore in the future, update both places)
  const totalProducts = 89; // TODO: Replace with real data if available
  const totalUsers = 2345;  // TODO: Replace with real data if available
  // const totalMedia = 42;    // TODO: Replace with real data if available

  // Recent activity (latest 3)
  const recentEmployees = (employeesHook.employees || []).slice(-3).reverse();
  const recentTasks = (tasksHook.tasks || []).slice(0, 3);
  const recentAnnouncements = (announcementsHook.announcements || []).slice(0, 3);

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
  if (isAnyLoading) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }
  if (anyError) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader />Error: {anyError}</div>;
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
      {anyError && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            {anyError}
          </div>
        </div>
      )}
      {/* Profile Preview Modal */}
      {profileModalOpen && user && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 relative border-2 border-green-300 animate-fadeIn">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-green-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/70 shadow-md hover:bg-green-100"
              onClick={() => setProfileModalOpen(false)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="flex flex-col items-center mb-6">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-200 via-pink-200 to-green-200 flex items-center justify-center shadow-lg mb-2 overflow-hidden">
                {user.photo ? (
                  <img 
                    src={user.photo.startsWith('data:') ? user.photo : `data:image/jpeg;base64,${user.photo}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <svg className={`w-12 h-12 text-green-500 ${user.photo ? 'hidden' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              </div>
              <h2 className="text-2xl font-extrabold text-green-600 mb-1">Your Profile</h2>
              <span className="text-[#16A34A] text-base font-medium">Employee Details</span>
            </div>
            <div className="space-y-3">
              <div><span className="text-xs text-green-400 font-bold uppercase">Name</span><br/><span className="text-lg text-gray-800 font-bold">{`${user?.firstName || ''} ${user?.lastName || ''}`|| '-'}</span></div>
              <div><span className="text-xs text-green-400 font-bold uppercase">Email</span><br/><span className="text-lg text-gray-800">{user.email || '-'}</span></div>
              <div><span className="text-xs text-green-400 font-bold uppercase">Department</span><br/><span className="text-lg text-gray-800">{user.department || '-'}</span></div>
              <div><span className="text-xs text-green-400 font-bold uppercase">Designation</span><br/><span className="text-lg text-gray-800">{user.role || '-'}</span></div>              <div><span className="text-xs text-green-400 font-bold uppercase">Phone</span><br/><span className="text-lg text-gray-800">{user.phone || '-'}</span></div>
              {user.address && (<div><span className="text-xs text-green-400 font-bold uppercase">Address</span><br/><span className="text-lg text-gray-800">{user.address}</span></div>)}
              {user.joinedAt && (<div><span className="text-xs text-green-400 font-bold uppercase">Joined At</span><br/><span className="text-lg text-gray-800">{new Date(user.joinedAt.seconds ? user.joinedAt.seconds * 1000 : user.joinedAt).toLocaleDateString()}</span></div>)}
            </div>
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
            username={`${user?.firstName || ''} ${user?.lastName || ''}`|| "Employee"}
            companyName={user?.company || "Department"}
          />
          <main
            className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <h1 className="text-4xl font-extrabold mt-8" style={{color: '#45CA8A'}}>Employee Dashboard</h1>
              <p className="mt-2 text-gray-500 text-lg">Welcome back! Here's what's new for you today.</p>
              
              {/* Employee Card */}
              <div className="mt-8 mb-8">
                <EmployeeCard user={{...user, companyId: ci, id: aid, companyName: user?.company || "CyberClipper Solutions LLP"}} />
              </div>

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
                  {/* Your Tasks */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group cursor-pointer"
                    onClick={() => router.push(`/notes-tasks${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Your Tasks</span>
                        <div className="text-3xl font-extrabold mt-2 text-green-600">{totalTasks}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>{totalTasks > 0 ? `${Math.round((completedTasks / totalTasks) * 100)}% completed` : 'No tasks yet'}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Your Department */}
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Your Department</span>
                        <div className="text-2xl font-extrabold mt-2 text-green-600">{department}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>{user?.role || "Team Member"}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg text-green-600 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Your Profile */}
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group cursor-pointer"
                    onClick={() => router.push(`/employeeinfo_edit${token ? `?token=${encodeURIComponent(token)}` : ''}`)}                    
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Your Profile</span>
                        <div className="text-2xl font-extrabold mt-2 text-pink-600">View</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>See your profile details</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-pink-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Task Status Summary */}
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Task Status</span>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-2xl font-extrabold text-green-600">{completedTasks}</div>
                          <span className="text-gray-400">/</span>
                          <div className="text-2xl font-extrabold text-yellow-600">{pendingTasks}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Completed / Pending</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Priority & Overdue Tasks */}
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Priority Tasks</span>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-2xl font-extrabold text-red-600">{highPriorityTasks}</div>
                          <span className="text-gray-400">/</span>
                          <div className="text-2xl font-extrabold text-orange-600">{overdueTasks}</div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>High Priority / Overdue</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-red-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Company Announcements */}
                  <div 
                    className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group cursor-pointer"
                    onClick={() => router.push(`/announcements${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                  >
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Announcements</span>
                        <div className="text-3xl font-extrabold mt-2 text-green-600">{totalAnnouncements}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>Click to view all</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-green-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0a2 2 0 01-2 2H7a2 2 0 01-2-2m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Work Calendar */}
                  <div className="bg-white rounded-2xl shadow p-6 flex flex-col justify-between min-w-[220px] border border-gray-200 transition-transform duration-200 hover:shadow-lg hover:scale-105 group cursor-pointer">
                    <div className="flex items-center justify-between w-full">
                      <div>
                        <span className="text-gray-900 font-semibold text-xl block">Today's Date</span>
                        <div className="text-2xl font-extrabold mt-2 text-indigo-600">{new Date().toLocaleDateString('en-US', {month: 'short', day: 'numeric'})}</div>
                        <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <span>{new Date().toLocaleDateString('en-US', {weekday: 'long', year: 'numeric'})}</span>
                        </div>
                      </div>
                      <div className="ml-4 flex-shrink-0">
                        <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-indigo-500 transition-transform duration-200 group-hover:scale-110 hover:scale-110">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h2a2 2 0 002-2z" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl md:text-4xl font-extrabold text-[#16a34a] mt-10 mb-2">Your Work Summary</h1>
              <p className="text-gray-500 text-xl">Recent tasks and announcements</p>
              
              {/* Recent Activity Section */}
              <div className="w-full flex flex-col gap-8 mt-5">
                {/* Recent Tasks Table */}
                <div className="rounded-xl bg-white border border-gray-100 shadow-md p-4 sm:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2l4-4m5 2a9 9 0 11-18 0a9 9 0 0118 0z" /></svg>
                      Your Recent Tasks
                    </h3>
                    <button 
                      onClick={() => router.push(`/notes-tasks${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      View All
                    </button>
                  </div>
                  
                  {/* Table for lg+ */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Task</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Priority</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Status</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Due Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentTasks.length === 0 ? (
                          <tr><td colSpan={4} className="text-center text-gray-400 py-4">No recent tasks</td></tr>
                        ) : recentTasks.map(task => {
                          const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                          return (
                            <tr key={task.id} className={`hover:bg-green-50 transition ${isOverdue ? 'bg-red-50' : ''}`}>
                              <td className="px-4 py-2 font-semibold text-gray-700 whitespace-nowrap">
                                {task.task}
                                {isOverdue && <span className="ml-2 text-red-500 text-xs">⚠️ Overdue</span>}
                              </td>
                              <td className="px-4 py-2 text-gray-600 whitespace-nowrap">
                                <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                  task.priority === 'High' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority}
                                </span>
                              </td>
                              <td className="px-4 py-2 whitespace-nowrap">
                                <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${task.completed === true ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                  {task.completed === true ? 'Completed' : 'Pending'}
                                </span>
                              </td>
                              <td className={`px-4 py-2 whitespace-nowrap ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                                {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Cards for mobile */}
                  <div className="flex flex-col gap-3 lg:hidden">
                    {recentTasks.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No recent tasks</div>
                    ) : recentTasks.map(task => {
                      const isOverdue = task.dueDate && !task.completed && new Date(task.dueDate) < new Date();
                      return (
                        <div key={task.id} className={`border rounded-lg p-3 sm:p-4 md:p-5 shadow-sm ${
                          isOverdue ? 'border-red-200 bg-red-50' : 'border-green-100 bg-green-50'
                        }`}>
                          <div className="font-semibold text-green-700 text-base sm:text-lg md:text-xl mb-1 flex items-center">
                            {task.task}
                            {isOverdue && <span className="ml-2 text-red-500 text-xs">⚠️ Overdue</span>}
                          </div>
                          <div className="text-xs sm:text-sm md:text-base text-gray-600">
                            <span className="font-semibold">Priority:</span> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs font-semibold ${
                              task.priority === 'High' ? 'bg-red-100 text-red-700' :
                              task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {task.priority}
                            </span>
                          </div>
                          <div className="text-xs sm:text-sm md:text-base text-gray-600"><span className="font-semibold">Status:</span> 
                            <span className={`ml-1 ${task.completed === true ? 'text-green-700' : 'text-yellow-700'} font-medium`}>
                              {task.completed === true ? 'Completed' : 'Pending'}
                            </span>
                          </div>
                          <div className={`text-xs sm:text-sm md:text-base ${isOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'}`}>
                            <span className="font-semibold">Due Date:</span> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : '-'}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                {/* Recent Announcements Table */}
                <div className="rounded-xl bg-white border border-gray-100 shadow-md p-4 sm:p-8">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl sm:text-2xl font-bold text-green-600 flex items-center gap-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-7 sm:w-7 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0a2 2 0 01-2 2H7a2 2 0 01-2-2m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
                      Latest Announcements
                    </h3>
                    <button 
                      onClick={() => router.push(`/announcements${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg font-medium text-sm transition-colors duration-200"
                    >
                      View All
                    </button>
                  </div>
                  
                  {/* Table for lg+ */}
                  <div className="hidden lg:block overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                      <thead>
                        <tr className="bg-green-50">
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Title</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Type</th>
                          <th className="px-4 py-2 text-left font-semibold text-green-700 whitespace-nowrap">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentAnnouncements.length === 0 ? (
                          <tr><td colSpan={3} className="text-center text-gray-400 py-4">No recent announcements</td></tr>
                        ) : recentAnnouncements.map(ann => (
                          <tr key={ann.id} className={`hover:bg-green-50 transition ${announcementsHook.readStatus[ann.id] ? 'opacity-60' : ''}`}>
                            <td className="px-4 py-2 font-semibold text-gray-700 whitespace-nowrap">
                              {ann.title}
                              {!announcementsHook.readStatus[ann.id] && (
                                <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                              )}
                            </td>
                            <td className="px-4 py-2 text-gray-600 capitalize whitespace-nowrap">{ann.type}</td>
                            <td className="px-4 py-2 text-gray-600 whitespace-nowrap">{ann.createdAt ? (ann.createdAt.seconds ? new Date(ann.createdAt.seconds * 1000).toLocaleDateString() : new Date(ann.createdAt).toLocaleDateString()) : '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Cards for mobile */}
                  <div className="flex flex-col gap-3 lg:hidden">
                    {recentAnnouncements.length === 0 ? (
                      <div className="text-center text-gray-400 py-4">No recent announcements</div>
                    ) : recentAnnouncements.map(ann => (
                      <div key={ann.id} className={`border border-green-100 rounded-lg p-3 sm:p-4 md:p-5 shadow-sm bg-green-50 ${announcementsHook.readStatus[ann.id] ? 'opacity-60' : ''}`}>
                        <div className="font-semibold text-green-700 text-base sm:text-lg md:text-xl mb-1 flex items-center">
                          {ann.title}
                          {!announcementsHook.readStatus[ann.id] && (
                            <span className="ml-2 inline-block w-2 h-2 bg-red-500 rounded-full"></span>
                          )}
                        </div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600"><span className="font-semibold">Type:</span> <span className="capitalize">{ann.type}</span></div>
                        <div className="text-xs sm:text-sm md:text-base text-gray-600"><span className="font-semibold">Date:</span> {ann.createdAt ? (ann.createdAt.seconds ? new Date(ann.createdAt.seconds * 1000).toLocaleDateString() : new Date(ann.createdAt).toLocaleDateString()) : '-'}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Quick Actions Section */}
              <div className="w-full rounded-xl bg-gradient-to-r from-[#16a34a] to-[#28BD78] shadow-md p-8 mt-10">
                <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  <button 
                    onClick={() => router.push(`/notes-tasks${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                    className="bg-white/90 hover:bg-white p-4 rounded-lg flex items-center gap-3 transition-colors duration-200 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <span className="font-medium text-gray-800">View Tasks</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/announcements${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                    className="bg-white/90 hover:bg-white p-4 rounded-lg flex items-center gap-3 transition-colors duration-200 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13V7a2 2 0 00-2-2H7a2 2 0 00-2 2v6m14 0a2 2 0 01-2 2H7a2 2 0 01-2-2m14 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2v-6" /></svg>
                    <span className="font-medium text-gray-800">Announcements</span>
                  </button>
                  
                  <button 
                    onClick={() => router.push(`/employeeinfo_edit${token ? `?token=${encodeURIComponent(token)}` : ''}`)}                    
                    className="bg-white/90 hover:bg-white p-4 rounded-lg flex items-center gap-3 transition-colors duration-200 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="font-medium text-gray-800">View Profile</span>
                  </button>
                </div>
              </div>
              
              {/* Learn How to Use Section */}
              <div className="w-full rounded-xl bg-gradient-to-r from-[#28DB78] to-[#16a34a] shadow-md p-8 mt-10 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold text-white mb-2">Learn How to Use the Employee Panel</h2>
                <p className="text-white/90 mb-5 max-w-2xl">
                  Explore the features and capabilities of your employee panel in a safe, interactive environment. Try out different options, see how things work!
                </p>
                <button
                  className="px-6 py-2 rounded-full font-semibold text-[#28DB78] bg-white hover:bg-gray-100 shadow transition-colors text-lg"
                  onClick={() => router.push(`/playground${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                >
                  Learn More
                </button>
              </div>
              {/* Terms & Privacy Section */}
              <div className="w-full rounded-xl bg-white border border-gray-100 shadow-md p-8 mt-8 flex flex-col items-center text-center">
                <h2 className="text-2xl font-bold mb-2" style={{ color: '#16a34a' }}>Terms & Privacy</h2>
                <p className="text-gray-700 mb-2 max-w-2xl">
                  We value your trust and are committed to protecting your data. Please take a moment to review our Terms of Service and Privacy Policy.
                </p>
                <div className="flex gap-4 flex-wrap justify-center mt-4">
                  <button
                    className="px-6 py-2 rounded-full font-semibold text-white bg-gradient-to-r from-[#16a34a] to-[#28BD78] hover:from-[#28BD78] hover:to-[#16a34a] shadow transition-colors text-lg"
                    onClick={() => router.push(`/terms${token ? `?token=${encodeURIComponent(token)}` : ''}`)}
                  >
                    Read Terms
                  </button>
                  <button
                    className="px-6 py-2 rounded-full font-semibold text-[#16a34a] bg-white border border-[#16a34a] hover:bg-[#28BD78] shadow transition-colors text-lg"
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
