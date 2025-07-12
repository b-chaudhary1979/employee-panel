import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
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
import { Fragment } from "react";
import RegisterEmployeeForm from "../components/RegisterEmployeeForm";
import Head from "next/head";
function EmployeesContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Mock employee data
  const [employees, setEmployees] = useState([
    {
      id: "EMP001",
      name: "Alice Johnson",
      email: "alice@company.com",
      role: "Manager",
      status: "Active",
      dateJoined: "2023-01-10",
    },
    {
      id: "EMP002",
      name: "Bob Smith",
      email: "bob@company.com",
      role: "Developer",
      status: "Inactive",
      dateJoined: "2022-11-22",
    },
    {
      id: "EMP003",
      name: "Carol Lee",
      email: "carol@company.com",
      role: "Designer",
      status: "Active",
      dateJoined: "2023-03-05",
    },
    {
      id: "EMP004",
      name: "David Kim",
      email: "david@company.com",
      role: "Support",
      status: "Active",
      dateJoined: "2023-02-18",
    },
  ]);

  // Summary stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter((e) => e.status === "Active").length;
  const inactiveEmployees = employees.filter(
    (e) => e.status === "Inactive"
  ).length;

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        message: `Error loading user info: ${error}`,
      });
      const timer = setTimeout(
        () => setNotification({ show: false, message: "" }),
        2000
      );
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
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {notification.message}
          </div>
        </div>
      )}
      {/* Register Employee Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
              onClick={() => setShowRegisterModal(false)}
            >
              &#8592; Back
            </button>
            <RegisterEmployeeForm />
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
              {/* Page Title and Subtitle */}
              <h1 className="text-3xl font-bold text-[#7c3aed] font-bold">
                Employee Management
              </h1>
              <p className="text-gray-500 mb-6">
                Track and manage your company employees
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-blue-100 p-3 rounded-full">
                    <svg
                      className="w-7 h-7 text-blue-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Total Employees</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {totalEmployees}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-green-100 p-3 rounded-full">
                    <svg
                      className="w-7 h-7 text-green-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Active</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {activeEmployees}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <svg
                      className="w-7 h-7 text-yellow-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12 8v4l3 3"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Inactive</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {inactiveEmployees}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search, Filter, and Generate Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search employees by name, email, or ID..."
                  className="flex-1 border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-500"
                />
                <select className="border border-gray-300 text-gray-500 rounded-lg px-3 py-2 focus:outline-none">
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
                  onClick={() => setShowRegisterModal(true)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Register Employee
                </button>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-xl shadow overflow-x-auto">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Employee ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date Joined
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {employees.map((emp, idx) => (
                      <tr key={emp.id}>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700">
                          {emp.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          <div className="font-bold">{emp.name}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {emp.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {emp.role}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {emp.status === "Active" ? (
                            <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                              Active
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                              Inactive
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {emp.dateJoined}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-3">
                          {/* Edit Icon */}
                          <button
                            className="text-purple-500 hover:text-purple-700"
                            title="Edit Employee"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                              />
                            </svg>
                          </button>
                          {/* Delete Icon */}
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Delete Employee"
                            onClick={() =>
                              setEmployees(
                                employees.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="sm:hidden">
                  {employees.map((emp, idx) => (
                    <div
                      key={emp.id}
                      className="border-b border-gray-200 px-4 py-4 flex flex-col gap-2"
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-blue-700">
                          {emp.id}
                        </span>
                        <div className="flex gap-3">
                          {/* Edit Icon */}
                          <button
                            className="text-purple-500 hover:text-purple-700"
                            title="Edit Employee"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                              />
                            </svg>
                          </button>
                          {/* Delete Icon */}
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Delete Employee"
                            onClick={() =>
                              setEmployees(
                                employees.filter((_, i) => i !== idx)
                              )
                            }
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-gray-500">
                        <span className="font-semibold">Name: </span>
                        {emp.name}
                      </div>
                      <div className="text-gray-500">
                        <span className="font-semibold">Email: </span>
                        {emp.email}
                      </div>
                      <div className="text-gray-500">
                        <span className="font-semibold">Role: </span>
                        {emp.role}
                      </div>
                      <div>
                        {emp.status === "Active" ? (
                          <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Active
                          </span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                            Inactive
                          </span>
                        )}
                      </div>
                      <div className="text-gray-500">
                        <span className="font-semibold">Date Joined: </span>
                        {emp.dateJoined}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function Employees() {
  return (
    <SidebarProvider>
      <EmployeesContent />
    </SidebarProvider>
  );
}
