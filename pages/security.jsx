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
import AddPasswordModal from "../components/AddPasswordModal";


// Helper functions
function getPasswordStrength(password) {
  if (!password) return "Weak";
  if (password.length > 12 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password)) return "Strong";
  if (password.length > 8) return "Medium";
  return "Weak";
}

function SecurityContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({ show: false, message: "", type: "success" });

  // Password manager state
  const [passwords, setPasswords] = useState([
    {
      website: "Gmail",
      username: "john.doe@company.com",
      password: "StrongPass!2024",
      employee: "John Doe",
      category: "Work",
    },
    {
      website: "Office 365",
      username: "jane.smith@company.com",
      password: "Password123",
      employee: "Jane Smith",
      category: "IT",
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [showPasswordIdx, setShowPasswordIdx] = useState(null);
  const [selectedPassword, setSelectedPassword] = useState(null);
  const [showPasswordDetailModal, setShowPasswordDetailModal] = useState(false);
  const [tablePasswordVisible, setTablePasswordVisible] = useState({}); // {idx: boolean}
  const [modalPasswordVisible, setModalPasswordVisible] = useState(false);
  const [editPassword, setEditPassword] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Derived stats
  const totalPasswords = passwords.length;
  const weakPasswords = passwords.filter(p => getPasswordStrength(p.password) === "Weak").length;
  const duplicatePasswords = (() => {
    const seen = {};
    let count = 0;
    passwords.forEach(p => {
      if (seen[p.password]) count++;
      else seen[p.password] = true;
    });
    return count;
  })();

  // For duplicate count per row
  function getDuplicateCount(password) {
    return passwords.filter(p => p.password === password).length - 1;
  }

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
  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  useEffect(() => {
    if (error) {
      setNotification({ show: true, message: `Error loading user info: ${error}`, type: "error" });
    }
  }, [error]);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => setNotification({ show: false, message: "", type: "success" }), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!ci || !aid) return null;
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }

  // Add password handler
  const handleAddPassword = (data) => {
    // Check for duplicate username+website
    if (passwords.some(p => p.username === data.username && p.website === data.website)) {
      setNotification({ show: true, message: "Password for this user and website already exists.", type: "error" });
      return;
    }
    setPasswords([data, ...passwords]);
    setNotification({ show: true, message: "Password added successfully!", type: "success" });
  };

  // Delete password handler
  const handleDelete = (idx) => {
    setPasswords(passwords.filter((_, i) => i !== idx));
    setNotification({ show: true, message: "Password deleted.", type: "success" });
  };

  // Copy password handler
  const handleCopy = (password) => {
    navigator.clipboard.writeText(password);
    setNotification({ show: true, message: "Password copied to clipboard!", type: "success" });
  };

  // Filtered passwords
  const filteredPasswords = passwords.filter(p => {
    const matchesSearch =
      p.website.toLowerCase().includes(search.toLowerCase()) ||
      p.username.toLowerCase().includes(search.toLowerCase()) ||
      (p.employee || "").toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? (p.category || "").toLowerCase() === categoryFilter.toLowerCase() : true;
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filter dropdown
  const categories = Array.from(new Set(passwords.map(p => p.category).filter(Boolean)));

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className={`px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown ${notification.type === "error" ? "bg-gradient-to-r from-red-500 to-pink-500 text-white" : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"}`}>
            {notification.type === "error" ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
      <AddPasswordModal open={showAddModal} onClose={() => setShowAddModal(false)} onAdd={handleAddPassword} />
      {/* Password Detail Modal */}
      {showPasswordDetailModal && selectedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-modalIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-purple-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
              onClick={() => setShowPasswordDetailModal(false)}
              aria-label="Close"
              style={{ lineHeight: 1 }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-lg font-bold mb-2 text-purple-500">Password Details</h2>
            <div className="space-y-2 text-gray-600 text-sm">
              <div><span className="font-semibold">Website/Service:</span> {selectedPassword.website}</div>
              <div><span className="font-semibold">Username:</span> {selectedPassword.username}</div>
              <div className="flex items-center gap-2"><span className="font-semibold">Password:</span> <span className="font-mono bg-gray-100 px-2 py-1 rounded">{modalPasswordVisible ? selectedPassword.password : "•".repeat(Math.max(8, selectedPassword.password?.length || 8))}</span>
                <button className="text-gray-400 hover:text-purple-600" onClick={() => setModalPasswordVisible(v => !v)} title={modalPasswordVisible ? "Hide" : "Show"} aria-label={modalPasswordVisible ? "Hide password" : "Show password"}>
                  {modalPasswordVisible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.97 10.97 0 0112 19c-5.52 0-10-4.48-10-10 0-2.21.72-4.25 1.94-5.94M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .39-.07.76-.18 1.11" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
                <button className="text-gray-400 hover:text-purple-600" onClick={() => {navigator.clipboard.writeText(selectedPassword.password)}} title="Copy Password" aria-label="Copy password">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
                </button>
              </div>
              <div><span className="font-semibold">Employee/User:</span> {selectedPassword.employee}</div>
              <div><span className="font-semibold">Category:</span> {selectedPassword.category}</div>
              <div><span className="font-semibold">URL:</span> <a href={selectedPassword.url} className="text-purple-500 underline break-all" target="_blank" rel="noopener noreferrer">{selectedPassword.url}</a></div>
              <div><span className="font-semibold">Notes:</span> {selectedPassword.notes}</div>
              <div><span className="font-semibold">Creation Date:</span> {selectedPassword.expiry}</div>
              <div><span className="font-semibold">Security Level:</span> {selectedPassword.securityLevel}</div>
              <div><span className="font-semibold">Created At:</span> {selectedPassword.createdAt ? new Date(selectedPassword.createdAt).toLocaleString() : ''}</div>
              {selectedPassword.customFields && selectedPassword.customFields.length > 0 && (
                <div>
                  <span className="font-semibold">Custom Fields:</span>
                  <ul className="list-disc ml-5">
                    {selectedPassword.customFields.map((f, i) => (
                      <li key={i}><span className="font-semibold">{f.question}:</span> {f.answer}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-4">
              <button
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition text-sm"
                onClick={() => {
                  setEditPassword(selectedPassword);
                  setShowEditModal(true);
                  setShowPasswordDetailModal(false);
                }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 00-1.414-1.414L3 17z" /></svg>
                Edit
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Edit Password Modal */}
      {showEditModal && editPassword && (
        <AddPasswordModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onAdd={data => {
            setPasswords(passwords => passwords.map(p => (p.createdAt === editPassword.createdAt ? { ...p, ...data } : p)));
            setShowEditModal(false);
          }}
          initialData={editPassword}
        />
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
            className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6 text-gray-700"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-extrabold text-[#7c3aed] mb-1">Password Manager</h1>
              <p className="text-gray-500 text-sm mb-6">Securely store, manage, and analyze your passwords. Get insights on password strength, duplicates, and more.</p>
              {/* Dashboard cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-100 p-1.5 rounded-full">
                      {/* Static lock icon */}
                      <svg className="w-6 h-6 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <rect x="6" y="10" width="12" height="8" rx="2" className="stroke-current" />
                        <path d="M8 10V7a4 4 0 118 0v3" className="stroke-current" />
                        <circle cx="12" cy="15" r="1" className="fill-current text-purple-400" />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-purple-700">Total Passwords</span>
                  </div>
                  <span className="text-2xl font-bold">{totalPasswords}</span>
                </div>
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-100 p-1.5 rounded-full animate-wiggle">
                      {/* Animated shield with exclamation icon */}
                      <svg className="w-6 h-6 text-yellow-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v3m0 4h.01" />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-yellow-700">Weak Passwords</span>
                  </div>
                  <span className="text-2xl font-bold">{weakPasswords}</span>
                </div>
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-pink-100 p-1.5 rounded-full animate-pulse">
                      {/* Animated warning icon */}
                      <svg className="w-6 h-6 text-pink-500 animate-shake" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M10.29 3.86l-7.09 12.42A2 2 0 005 19h14a2 2 0 001.8-2.72L13.71 3.86a2 2 0 00-3.42 0z" />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-pink-700">Duplicate Passwords</span>
                  </div>
                  <span className="text-2xl font-bold">{duplicatePasswords}</span>
                </div>
              </div>
              {/* Actions: make responsive and compact */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center w-full">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition w-full sm:w-auto text-sm"
                  onClick={() => setShowAddModal(true)}
                  aria-label="Add Password"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Add Password
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-1.5 rounded flex items-center gap-2 border border-gray-200 transition w-full sm:w-auto text-sm"
                  onClick={() => setNotification({ show: true, message: "Export feature coming soon!", type: "success" })}
                  aria-label="Export Passwords"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
                  Export
                </button>
                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm"
                      placeholder="Search passwords..."
                      value={search}
                      onChange={e => setSearch(e.target.value)}
                      aria-label="Search passwords"
                    />
                    <span className="absolute right-2 top-2 text-gray-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" /></svg></span>
                  </div>
                  {/* Category filter dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white"
                      value={categoryFilter}
                      onChange={e => setCategoryFilter(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {categories.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Passwords Table: responsive and compact */}
              {/* Mobile: show as cards */}
              <div className="sm:hidden flex flex-col gap-3 mt-3">
                {filteredPasswords.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">No passwords found.</div>
                )}
                {filteredPasswords.map((p, idx) => (
                  <div key={idx} className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col gap-2 cursor-pointer hover:bg-purple-50 transition" onClick={() => { setSelectedPassword(p); setShowPasswordDetailModal(true); }}>
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-800 text-base">{p.website}</div>
                        <div className="text-xs text-gray-400">{p.category}</div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 px-2"
                        onClick={() => handleDelete(passwords.indexOf(p))}
                        title="Delete Password"
                        aria-label="Delete password"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-500">Username</div>
                      <div className="text-sm font-mono">{p.username}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-500">Password</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showPasswordIdx === idx ? p.password : "•".repeat(Math.max(8, p.password.length))}
                        </span>
                        <button
                          className="text-gray-400 hover:text-purple-600"
                          onClick={() => setShowPasswordIdx(showPasswordIdx === idx ? null : idx)}
                          title={showPasswordIdx === idx ? "Hide" : "Show"}
                          aria-label={showPasswordIdx === idx ? "Hide password" : "Show password"}
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                        </button>
                        <button
                          className="text-gray-400 hover:text-purple-600"
                          onClick={() => handleCopy(p.password)}
                          title="Copy Password"
                          aria-label="Copy password"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div>
                        <span className="text-xs text-gray-500">Strength: </span>
                        <span className={
                          getPasswordStrength(p.password) === "Strong"
                            ? "text-green-600 font-semibold"
                            : getPasswordStrength(p.password) === "Medium"
                            ? "text-yellow-600 font-semibold"
                            : "text-red-600 font-semibold"
                        }>
                          {getPasswordStrength(p.password)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Duplicates: </span>
                        <span className={getDuplicateCount(p.password) > 0 ? "text-red-600 font-bold" : "text-gray-400"}>
                          {getDuplicateCount(p.password)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">Employee: </span>
                        <span className="text-xs text-gray-700">{p.employee}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {/* Tablet and up: show as table */}
              <div className="hidden sm:block bg-white rounded-xl shadow overflow-x-auto mt-3 w-full border border-gray-100">
                <table className="min-w-full divide-y divide-gray-200 text-xs">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Website/Service</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Password</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden xs:table-cell">Password</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Employee/User</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Strength</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Duplicate</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredPasswords.length === 0 && (
                      <tr>
                        <td colSpan={7} className="text-center py-8 text-gray-400">No passwords found.</td>
                      </tr>
                    )}
                    {filteredPasswords.map((p, idx) => (
                      <tr key={idx} className="hover:bg-purple-50 transition cursor-pointer" onClick={() => { setSelectedPassword(p); setShowPasswordDetailModal(true); }}>
                        {/* Website/Service and category always visible */}
                        <td className="px-3 py-2 whitespace-nowrap align-top">
                          <div className="font-semibold text-gray-800 text-sm md:text-base">{p.website}</div>
                          <div className="text-xs text-gray-400">{p.category}</div>
                          {/* Show strength and duplicate on mobile stacked */}
                          <div className="block sm:hidden mt-1 flex flex-wrap gap-2">
                            <span className={
                              getPasswordStrength(p.password) === "Strong"
                                ? "text-green-600 font-semibold"
                                : getPasswordStrength(p.password) === "Medium"
                                ? "text-yellow-600 font-semibold"
                                : "text-red-600 font-semibold"
                            }>
                              {getPasswordStrength(p.password)}
                            </span>
                            <span className={getDuplicateCount(p.password) > 0 ? "text-red-600 font-bold" : "text-gray-400"}>
                              Duplicates: {getDuplicateCount(p.password)}
                            </span>
                          </div>
                        </td>
                        {/* Password column: always visible after Website/Service */}
                        <td className="px-3 py-2 whitespace-nowrap align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">
                              {tablePasswordVisible[idx] ? p.password : "•".repeat(Math.max(8, p.password.length))}
                            </span>
                            <button
                              className="text-gray-400 hover:text-purple-600"
                              onClick={e => { e.stopPropagation(); setTablePasswordVisible(v => ({ ...v, [idx]: !v[idx] })); }}
                              title={tablePasswordVisible[idx] ? "Hide" : "Show"}
                              aria-label={tablePasswordVisible[idx] ? "Hide password" : "Show password"}
                            >
                              {tablePasswordVisible[idx] ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.97 10.97 0 0112 19c-5.52 0-10-4.48-10-10 0-2.21.72-4.25 1.94-5.94M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .39-.07.76-.18 1.11" /></svg>
                              ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                              )}
                            </button>
                            <button
                              className="text-gray-400 hover:text-purple-600"
                              onClick={e => { e.stopPropagation(); handleCopy(p.password); }}
                              title="Copy Password"
                              aria-label="Copy password"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16h8M8 12h8m-7 8h6a2 2 0 002-2V7a2 2 0 00-2-2h-6a2 2 0 00-2 2v11a2 2 0 002 2z" /></svg>
                            </button>
                          </div>
                        </td>
                        {/* Username always visible */}
                        <td className="px-3 py-2 whitespace-nowrap align-top text-xs md:text-sm">{p.username}</td>
                        {/* Strength: hide on mobile, show on sm+ */}
                        <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell align-top">
                          <span className={
                            getPasswordStrength(p.password) === "Strong"
                              ? "text-green-600 font-semibold"
                              : getPasswordStrength(p.password) === "Medium"
                              ? "text-yellow-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }>
                            {getPasswordStrength(p.password)}
                          </span>
                        </td>
                        {/* Duplicate: hide on mobile, show on sm+ */}
                        <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell align-top">
                          {getDuplicateCount(p.password) > 0 ? (
                            <span className="text-red-600 font-bold">{getDuplicateCount(p.password)}</span>
                          ) : (
                            <span className="text-gray-400">0</span>
                          )}
                        </td>
                        {/* Actions: always visible */}
                        <td className="px-3 py-2 whitespace-nowrap text-center align-middle">
                          <div className="flex gap-2 items-center justify-center">
                            <button
                              className="text-blue-500 hover:text-blue-700 px-1"
                              onClick={e => { e.stopPropagation(); setEditPassword(p); setShowEditModal(true); }}
                              title="Edit Password"
                              aria-label="Edit password"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 00-1.414-1.414L3 17z" /></svg>
                            </button>
                            <button
                              className="text-red-500 hover:text-red-700 px-1"
                              onClick={e => { e.stopPropagation(); handleDelete(filteredPasswords.indexOf(p)); }}
                              title="Delete Password"
                              aria-label="Delete password"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                          </div>
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

export default function Security() {
  return (
    <SidebarProvider>
      <SecurityContent />
    </SidebarProvider>
  );
}
