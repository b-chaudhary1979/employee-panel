import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
const ENCRYPTION_KEY = "cyberclipperSecretKey123!";
import Head from "next/head";
import useStorePassword from "../hooks/useStorePassword";
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
  if (
    password.length > 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return "Strong";
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
  const { user, loading: userLoading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success",
  });

  // Password manager state (from Firestore)
  const {
    passwords,
    loading: passwordsLoading,
    error: passwordsError,
    addPassword,
    updatePassword,
    deletePassword,
  } = useStorePassword(ci);

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
  const [copiedIdx, setCopiedIdx] = useState(null); // For table/card copy
  const [modalCopied, setModalCopied] = useState(false); // For modal copy
  const [pendingDelete, setPendingDelete] = useState(null); // id or idx of password to delete
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteUsageTag, setDeleteUsageTag] = useState('In Use');

  // Derived stats
  const totalPasswords = passwords.length;
  const weakPasswords = passwords.filter(
    (p) => getPasswordStrength(p.password) === "Weak"
  ).length;
  const duplicatePasswords = (() => {
    const seen = {};
    let count = 0;
    passwords.forEach((p) => {
      if (seen[p.password]) count++;
      else seen[p.password] = true;
    });
    return count;
  })();

  // For duplicate count per row
  function getDuplicateCount(password) {
    return passwords.filter((p) => p.password === password).length - 1;
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
    if (error || passwordsError) {
      setNotification({
        show: true,
        message: `Error loading user info: ${error || passwordsError}`,
        type: "error",
      });
    }
  }, [error, passwordsError]);

  // Auto-hide notification after 4 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(
        () => setNotification({ show: false, message: "", type: "success" }),
        4000
      );
      return () => clearTimeout(timer);
    }
  }, [notification.show]);

  if (!ci || !aid) return null;
  if (userLoading || passwordsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  // Add password handler
  const handleAddPassword = async (data) => {
    // Check for duplicate username+website
    if (
      passwords.some(
        (p) => p.username === data.username && p.website === data.website
      )
    ) {
      setNotification({
        show: true,
        message: "Password for this user and website already exists.",
        type: "error",
      });
      return;
    }
    // Store in Firestore under companies/{ci}/passwords
    await addPassword({
      ...data,
      customFields: data.customFields || [],
      employee: data.employee || [],
      createdAt: data.createdAt || new Date().toISOString(),
      submittedBy: data.submittedBy || "",
      expiryDate: data.expiryDate || "",
      tags: data.tags || "",
    });
    setNotification({
      show: true,
      message: "Password added successfully!",
      type: "success",
    });
  };

  // Delete password handler
  const handleDelete = async (idxOrId) => {
    let id = idxOrId;
    let passwordDoc = null;
    // If idx is passed (from filteredPasswords), get id
    if (typeof idxOrId === "number") {
      const p = filteredPasswords[idxOrId];
      if (!p) return;
      id = p.id;
      passwordDoc = p;
    } else {
      passwordDoc = passwords.find(p => p.id === id);
    }
    // Try to update the tag, but ignore error if doc doesn't exist
    if (passwordDoc && passwordDoc.usageTag !== deleteUsageTag) {
      try {
        await updatePassword(id, { ...passwordDoc, usageTag: deleteUsageTag });
      } catch (e) {
        // Ignore error (e.g., doc does not exist)
      }
    }
    await deletePassword(id);
    setNotification({
      show: true,
      message: "Password deleted.",
      type: "success",
    });
    setShowDeleteModal(false);
    setPendingDelete(null);
    setDeleteUsageTag('In Use');
  };

  // Copy password handler
  const handleCopy = (password, idx = null, isModal = false) => {
    navigator.clipboard.writeText(password);
    setNotification({
      show: true,
      message: "Password copied to clipboard!",
      type: "success",
    });
    if (isModal) {
      setModalCopied(true);
      setTimeout(() => setModalCopied(false), 1500);
    } else if (idx !== null) {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }
  };

  // Filtered passwords
  const filteredPasswords = passwords.filter((p) => {
    const matchesSearch =
      p.website?.toLowerCase().includes(search.toLowerCase()) ||
      p.username?.toLowerCase().includes(search.toLowerCase()) ||
      (p.employee || "").toString().toLowerCase().includes(search.toLowerCase());
    let matchesCategory = true;
    if (categoryFilter) {
      const filter = categoryFilter.toLowerCase();
      if (["high priority", "medium priority", "low priority"].includes(filter)) {
        matchesCategory = (p.category || "").toLowerCase() === filter;
      } else if (["strong", "medium", "weak"].includes(filter)) {
        matchesCategory = getPasswordStrength(p.password).toLowerCase() === filter;
      } else {
        matchesCategory = (p.category || "").toLowerCase() === filter;
      }
    }
    return matchesSearch && matchesCategory;
  });

  // Unique categories for filter dropdown
  const staticCategories = [
    'High Priority',
    'Medium Priority',
    'Low Priority',
    'Strong',
    'Medium',
    'Weak',
  ];
  const dynamicCategories = Array.from(
    new Set(passwords.map((p) => p.category).filter(Boolean))
  ).filter(cat => !staticCategories.includes(cat));
  const categories = [...staticCategories, ...dynamicCategories];

  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div
            className={`px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown ${
              notification.type === "error"
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            }`}
          >
            {notification.type === "error" ? (
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
            ) : (
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
            )}
            {notification.message}
          </div>
        </div>
      )}
      <AddPasswordModal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={handleAddPassword}
        initialData={{ usageTag: 'In Use' }}
      />
      {/* Password Detail Modal */}
      {showPasswordDetailModal && selectedPassword && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-purple-50/80 via-white/90 to-purple-100/80 backdrop-blur-[8px] animate-fadeIn font-[Manrope]">
          {/* Premium modal border shimmer */}
          <div className="absolute inset-0 pointer-events-none z-0">
            <div className="w-full h-full rounded-3xl border-4 border-transparent animate-borderShimmer" style={{boxShadow:'0 0 40px 8px rgba(124,58,237,0.08), 0 4px 32px 0 rgba(80,0,120,0.06)'}}></div>
          </div>
          <div className="relative bg-white/90 backdrop-blur-2xl rounded-3xl shadow-2xl w-full max-w-2xl sm:max-w-2xl md:max-w-2xl lg:max-w-2xl p-0 border border-purple-100/60 ring-2 ring-purple-100/40 animate-premiumModal overflow-hidden font-[Manrope] mx-2 sm:mx-0" style={{boxShadow:'0 8px 48px 0 rgba(124,58,237,0.10), 0 1.5px 8px 0 rgba(80,0,120,0.06)'}}>
            {/* Optional noise overlay for texture */}
            <div className="absolute inset-0 pointer-events-none z-0" style={{backgroundImage:'url("https://www.transparenttextures.com/patterns/symphony.png")', opacity:0.06}}></div>
            {/* Header with back button, icon and close */}
            <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-6 bg-purple-200 border-b border-purple-100/40 rounded-t-3xl shadow-md relative">
              {/* Back Button */}
              <button
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 flex items-center gap-1 bg-purple-50 hover:bg-purple-100 text-purple-700 px-3 py-1.5 rounded-xl font-semibold shadow transition focus:outline-none focus:ring-2 focus:ring-purple-200"
                onClick={() => setShowPasswordDetailModal(false)}
                aria-label="Back"
                style={{ zIndex: 2 }}
              >
                <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                Back
              </button>
              <div className="flex items-center gap-3 mx-auto">
                <svg className="w-8 h-8 text-purple-600 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" className="stroke-current"/><path d="M8 10V7a4 4 0 118 0v3" className="stroke-current"/><circle cx="12" cy="15" r="1" className="fill-current text-purple-200"/></svg>
                <h2 className="text-lg sm:text-2xl font-extrabold tracking-wide font-[Manrope] drop-shadow-lg text-gray-900">Password Details</h2>
              </div>
              <button
                className="text-purple-700 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-full p-1.5 transition focus:outline-none focus:ring-2 focus:ring-purple-200 absolute right-2 sm:right-4 top-1/2 -translate-y-1/2"
                onClick={() => setShowPasswordDetailModal(false)}
                aria-label="Close"
                style={{ lineHeight: 1, zIndex: 2 }}
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {/* Content with horizontal scroller */}
            <div className="px-3 sm:px-8 py-6 sm:py-10 space-y-4 sm:space-y-5 text-gray-800 animate-fadeIn overflow-x-auto relative z-10 text-sm sm:text-base" style={{ minHeight: '320px', maxHeight: '70vh' }}>
              {/* Website/Service */}
              <div className="flex items-center gap-2 sm:gap-3 bg-purple-100 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="currentColor" strokeWidth="2"/><path d="M4 9h16" stroke="#7c3aed" strokeWidth="2"/></svg>
                <span className="font-semibold text-gray-900">Website/Service:</span>
                <span className="ml-1 font-medium">{selectedPassword.website}</span>
              </div>
              {/* Username */}
              <div className="flex items-center gap-2 sm:gap-3 bg-purple-100 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/><path d="M4 20v-1a7 7 0 0114 0v1" stroke="#7c3aed" strokeWidth="2"/></svg>
                <span className="font-semibold text-gray-900">Username:</span>
                <span className="ml-1 font-medium">{selectedPassword.username}</span>
              </div>
              {/* Password */}
              <div className="flex items-center gap-2 sm:gap-3 bg-purple-100 rounded-xl px-3 sm:px-4 py-2 shadow-md border border-purple-100">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="6" y="10" width="12" height="8" rx="2" className="stroke-current"/><path d="M8 10V7a4 4 0 118 0v3" className="stroke-current"/><circle cx="12" cy="15" r="1" className="fill-current text-purple-500"/></svg>
                <span className="font-semibold text-gray-900">Password:</span>
                <span className="ml-1 font-mono bg-white px-2 py-1 rounded text-gray-800 text-base tracking-wider select-all">
                  {modalPasswordVisible ? selectedPassword.password : "•".repeat(Math.max(8, selectedPassword.password?.length || 8))}
                </span>
                <button
                  className="text-purple-500 hover:text-purple-700 ml-1 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded"
                  onClick={() => setModalPasswordVisible((v) => !v)}
                  title={modalPasswordVisible ? "Hide" : "Show"}
                  aria-label={modalPasswordVisible ? "Hide password" : "Show password"}
                >
                  {modalPasswordVisible ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.97 10.97 0 0112 19c-5.52 0-10-4.48-10-10 0-2.21.72-4.25 1.94-5.94M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .39-.07.76-.18 1.11" /></svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                  )}
                </button>
                <button
                  className="text-purple-500 hover:text-purple-700 ml-1 focus:outline-none focus:ring-2 focus:ring-purple-200 rounded"
                  onClick={() => handleCopy(selectedPassword.password, null, true)}
                  title="Copy Password"
                  aria-label="Copy password"
                >
                  {modalCopied ? (
                    // Tick icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  ) : (
                    // Simple copy icon
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                  )}
                </button>
              </div>
              {/* Employee/User */}
              <div className="flex items-center gap-2 bg-purple-100 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 20v-1a7 7 0 0114 0v1" stroke="#7c3aed" strokeWidth="2"/><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2"/></svg>
                <span className="font-semibold text-gray-900">Employee/User:</span>
                <span className="ml-1 font-medium">{selectedPassword.employee}</span>
              </div>
              {/* Category */}
              <div className="flex items-center gap-2 bg-purple-100 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M5 7h14M5 12h14M5 17h14" stroke="#7c3aed" strokeWidth="2"/></svg>
                <span className="font-semibold text-gray-900">Category:</span>
                <span className="ml-1 font-medium">{selectedPassword.category}</span>
              </div>
              {/* URL */}
              <div className="flex items-center bg-purple-100 gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M3.9 12a5 5 0 017.1-7.1l1 1" stroke="#7c3aed" strokeWidth="2"/><path d="M20.1 12a5 5 0 01-7.1 7.1l-1-1" stroke="#7c3aed" strokeWidth="2"/><path d="M8 12h8" stroke="#7c3aed" strokeWidth="2"/></svg>
                <span className="font-semibold text-gray-900">URL:</span>
                <a href={selectedPassword.url} className="ml-1 underline break-all font-medium" target="_blank" rel="noopener noreferrer">{selectedPassword.url}</a>
              </div>
              {/* Notes */}
              {selectedPassword.notes && (
                <div className="flex items-center bg-purple-100 gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M4 4h16v16H4z" stroke="#7c3aed" strokeWidth="2"/><path d="M8 8h8M8 12h6M8 16h4" stroke="#7c3aed" strokeWidth="2"/></svg>
                  <span className="font-semibold text-gray-900">Notes:</span>
                  <span className="ml-1 font-medium">{selectedPassword.notes}</span>
                </div>
              )}
              {/* Expiry Date */}
              {selectedPassword.expiry && (
                <div className="flex items-center bg-purple-100 gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#7c3aed" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="#7c3aed" strokeWidth="2"/></svg>
                  <span className="font-semibold text-gray-900">Expiry Date:</span>
                  <span className="ml-1 font-medium">{selectedPassword.expiry}</span>
                </div>
              )}
              {/* Security Level */}
              {selectedPassword.securityLevel && (
                <div className="flex items-center bg-purple-100 gap-2 sm:gap-3 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2l3 7h7l-5.5 4.5L18 21l-6-4-6 4 1.5-7.5L2 9h7z" stroke="#7c3aed" strokeWidth="2"/></svg>
                  <span className="font-semibold text-gray-900">Security Level:</span>
                  <span className="ml-1 font-medium">{selectedPassword.securityLevel}</span>
                </div>
              )}
              {/* Created At */}
              {selectedPassword.createdAt && (
                <div className="flex items-center bg-purple-100 gap-2 sm:gap-3  rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                  <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 8v4l3 3" stroke="#7c3aed" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2"/></svg>
                  <span className="font-semibold text-gray-900">Created At:</span>
                  <span className="ml-1 font-medium">{new Date(selectedPassword.createdAt).toLocaleString()}</span>
                </div>
              )}
              {/* Custom Fields */}
              {selectedPassword.customFields && selectedPassword.customFields.length > 0 && (
                <div className="flex flex-col gap-1 bg-purple-100 rounded-xl px-3 sm:px-4 py-2 shadow-sm border border-purple-50">
                  <span className="font-semibold flex items-center gap-2 text-gray-900"><svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 6v6l4 2" stroke="#7c3aed" strokeWidth="2"/><circle cx="12" cy="12" r="10" stroke="#7c3aed" strokeWidth="2"/></svg>Custom Fields:</span>
                  <ul className="list-disc ml-7 mt-1">
                    {selectedPassword.customFields.map((f, i) => (
                      <li key={i} className="font-medium"><span className="font-semibold text-gray-900">{f.question}:</span> {f.answer}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            {/* Soft divider above actions */}
            <div className="w-full h-0.5 bg-gradient-to-r from-purple-100/60 via-purple-50/60 to-purple-100/60 my-0" />
            {/* Actions */}
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 px-3 sm:px-12 py-5 sm:py-7 bg-gradient-to-r from-white to-purple-50 rounded-b-3xl border-t border-purple-100/60">
              <button
                className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white font-semibold px-4 sm:px-6 py-2 rounded-2xl flex items-center gap-2 shadow-lg transition text-base focus:outline-none focus:ring-2 focus:ring-purple-200 transform hover:-translate-y-0.5 active:scale-95 font-[Manrope]"
                onClick={() => {
                  setEditPassword(selectedPassword);
                  setShowEditModal(true);
                  setShowPasswordDetailModal(false);
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 00-1.414-1.414L3 17z" /></svg>
                Edit
              </button>
              <button
                className="bg-gradient-to-r from-purple-100 to-white hover:from-purple-200 hover:to-white text-purple-800 font-semibold px-4 sm:px-6 py-2 rounded-2xl flex items-center gap-2 shadow-lg transition text-base border border-purple-100 focus:outline-none focus:ring-2 focus:ring-purple-200 transform hover:-translate-y-0.5 active:scale-95 font-[Manrope]"
                onClick={() => setShowPasswordDetailModal(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                Close
              </button>
            </div>
            {/* Keyframes for shimmer and modal animation */}
            <style>{`
              @keyframes borderShimmer {
                0% { box-shadow: 0 0 40px 8px rgba(124,58,237,0.08), 0 4px 32px 0 rgba(80,0,120,0.06); }
                50% { box-shadow: 0 0 60px 16px rgba(124,58,237,0.13), 0 8px 48px 0 rgba(80,0,120,0.09); }
                100% { box-shadow: 0 0 40px 8px rgba(124,58,237,0.08), 0 4px 32px 0 rgba(80,0,120,0.06); }
              }
              .animate-borderShimmer { animation: borderShimmer 2.8s ease-in-out infinite; }
              @keyframes premiumModal {
                0% { opacity: 0; transform: scale(0.96) translateY(30px); }
                100% { opacity: 1; transform: scale(1) translateY(0); }
              }
              .animate-premiumModal { animation: premiumModal 0.7s cubic-bezier(0.4,0,0.2,1) both; }
            `}</style>
          </div>
        </div>
      )}
      {/* Edit Password Modal */}
      {showEditModal && editPassword && (
        <AddPasswordModal
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onAdd={async (data) => {
            await updatePassword(editPassword.id, data);
            setShowEditModal(false);
            setNotification({
              show: true,
              message: "Password updated successfully!",
              type: "success",
            });
          }}
          initialData={editPassword}
          renderExtraFields={(fields, setFields) => (
            <div className="mb-4">
              <label className="block text-gray-700 font-semibold mb-1">Usage Tag:</label>
              <select
                className="border rounded px-2 py-1 w-full"
                value={fields.usageTag || 'In Use'}
                onChange={e => setFields(f => ({ ...f, usageTag: e.target.value }))}
              >
                <option value="In Use">In Use</option>
                <option value="Not In Use">Not In Use</option>
                <option value="Expired">Expired</option>
              </select>
            </div>
          )}
        />
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteModal && pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl p-6 max-w-sm w-full border border-purple-100 flex flex-col items-center">
            <svg className="w-12 h-12 text-red-500 mb-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Password?</h3>
            <p className="text-gray-600 mb-4 text-center">Are you sure you want to delete this password? This action cannot be undone.</p>
            <div className="w-full mb-4 flex flex-col items-center">
              <label htmlFor="usageTag" className="text-gray-700 font-semibold mb-1">Usage Tag:</label>
              <select id="usageTag" className="border rounded px-2 py-1 w-40" value={deleteUsageTag} onChange={e => setDeleteUsageTag(e.target.value)}>
                <option value="In Use">In Use</option>
                <option value="Not In Use">Not In Use</option>
              </select>
            </div>
            <div className="flex gap-3 w-full justify-center">
              <button className="bg-red-500 hover:bg-red-600 text-white font-semibold px-4 py-2 rounded-xl transition" onClick={() => handleDelete(pendingDelete)}>Delete</button>
              <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl transition" onClick={() => { setShowDeleteModal(false); setPendingDelete(null); setDeleteUsageTag('In Use'); }}>Cancel</button>
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
            username={user?.name || "admin"}
            companyName={user?.company || "company name"}
          />
          <main
            className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6 text-gray-700"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <h1 className="text-2xl font-extrabold text-[#7c3aed] mb-1">
                Password Manager
              </h1>
              <p className="text-gray-500 text-sm mb-6">
                Securely store, manage, and analyze your passwords. Get insights
                on password strength, duplicates, and more.
              </p>
              {/* Dashboard cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-purple-100 p-1.5 rounded-full">
                      {/* Static lock icon */}
                      <svg
                        className="w-6 h-6 text-purple-500"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <rect
                          x="6"
                          y="10"
                          width="12"
                          height="8"
                          rx="2"
                          className="stroke-current"
                        />
                        <path
                          d="M8 10V7a4 4 0 118 0v3"
                          className="stroke-current"
                        />
                        <circle
                          cx="12"
                          cy="15"
                          r="1"
                          className="fill-current text-purple-400"
                        />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-purple-700">
                      Total Passwords
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{totalPasswords}</span>
                </div>
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-yellow-100 p-1.5 rounded-full animate-wiggle">
                      {/* Animated shield with exclamation icon */}
                      <svg
                        className="w-6 h-6 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 3l7 4v5c0 5.25-3.5 9.74-7 11-3.5-1.26-7-5.75-7-11V7l7-4z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 10v3m0 4h.01"
                        />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-yellow-700">
                      Weak Passwords
                    </span>
                  </div>
                  <span className="text-2xl font-bold">{weakPasswords}</span>
                </div>
                <div className="bg-white rounded-xl shadow p-4 flex flex-col items-start w-full">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="bg-pink-100 p-1.5 rounded-full animate-pulse">
                      {/* Animated warning icon */}
                      <svg
                        className="w-6 h-6 text-pink-500 animate-shake"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 9v4m0 4h.01"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M10.29 3.86l-7.09 12.42A2 2 0 005 19h14a2 2 0 001.8-2.72L13.71 3.86a2 2 0 00-3.42 0z"
                        />
                      </svg>
                    </span>
                    <span className="text-base font-semibold text-pink-700">
                      Duplicate Passwords
                    </span>
                  </div>
                  <span className="text-2xl font-bold">
                    {duplicatePasswords}
                  </span>
                </div>
              </div>
              {/* Actions: make responsive and compact */}
              <div className="flex flex-col sm:flex-row gap-2 mb-4 items-start sm:items-center w-full">
                <button
                  className="bg-purple-600 hover:bg-purple-700 text-white font-semibold px-4 py-1.5 rounded flex items-center gap-2 transition w-full sm:w-auto text-sm"
                  onClick={() => setShowAddModal(true)}
                  aria-label="Add Password"
                >
                  <svg
                    className="w-4 h-4"
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
                  Add Password
                </button>
                <button
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-4 py-1.5 rounded flex items-center gap-2 border border-gray-200 transition w-full sm:w-auto text-sm"
                  onClick={() =>
                    setNotification({
                      show: true,
                      message: "Export feature coming soon!",
                      type: "success",
                    })
                  }
                  aria-label="Export Passwords"
                >
                  <svg
                    className="w-4 h-4"
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
                  Export
                </button>
                <div className="flex-1 flex flex-col sm:flex-row gap-2 w-full sm:w-auto mt-2 sm:mt-0">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm"
                      placeholder="Search passwords..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      aria-label="Search passwords"
                    />
                    <span className="absolute right-2 top-2 text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z"
                        />
                      </svg>
                    </span>
                  </div>
                  {/* Category filter dropdown */}
                  <div className="relative flex-1 sm:flex-none">
                    <select
                      className="w-full border rounded px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-white"
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      aria-label="Filter by category"
                    >
                      <option value="">All Categories</option>
                      {staticCategories.map((cat, i) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                      {dynamicCategories.length > 0 && <option disabled>──────────</option>}
                      {dynamicCategories.map((cat, i) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
              {/* Passwords Table: responsive and compact */}
              {/* Mobile: show as cards */}
              <div className="sm:hidden flex flex-col gap-3 mt-3">
                {filteredPasswords.length === 0 && (
                  <div className="text-center py-8 text-gray-400 bg-white rounded-xl shadow border border-gray-100">
                    No passwords found.
                  </div>
                )}
                {filteredPasswords.map((p, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-xl shadow border border-gray-100 p-4 flex flex-col gap-2 cursor-pointer hover:bg-purple-50 transition"
                    onClick={() => {
                      setSelectedPassword(p);
                      setShowPasswordDetailModal(true);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-semibold text-gray-800 text-base">
                          {p.website}
                        </div>
                        <div className="text-xs text-gray-400 flex items-center gap-1">
                          <span className="truncate block max-w-[140px] relative" style={{ maxWidth: 140 }}>
                            {p.url}
                            <span className="absolute right-0 top-0 h-full w-8 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, white 80%)" }}></span>
                          </span>
                        </div>
                      </div>
                      <button
                        className="text-red-500 hover:text-red-700 px-2"
                        onClick={(e) => { e.stopPropagation(); setPendingDelete(p.id); setShowDeleteModal(true); }}
                        title="Delete Password"
                        aria-label="Delete password"
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
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-500">Username</div>
                      <div className="text-sm font-mono">{p.username}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <div className="text-xs text-gray-500">Password</div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono">
                          {showPasswordIdx === idx
                            ? p.password
                            : "•".repeat(Math.max(8, p.password.length))}
                        </span>
                        <button
                          className="text-gray-400 hover:text-purple-600"
                          onClick={() =>
                            setShowPasswordIdx(
                              showPasswordIdx === idx ? null : idx
                            )
                          }
                          title={showPasswordIdx === idx ? "Hide" : "Show"}
                          aria-label={
                            showPasswordIdx === idx
                              ? "Hide password"
                              : "Show password"
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          className="text-gray-400 hover:text-purple-600"
                          onClick={() => handleCopy(p.password, idx)}
                          title="Copy Password"
                          aria-label="Copy password"
                        >
                          {copiedIdx === idx ? (
                            // Tick icon
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                          ) : (
                            // Simple copy icon
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                          )}
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-4 mt-2">
                      <div>
                        <span className="text-xs text-gray-500">
                          Strength:{" "}
                        </span>
                        <span
                          className={
                            getPasswordStrength(p.password) === "Strong"
                              ? "text-green-600 font-semibold"
                              : getPasswordStrength(p.password) === "Medium"
                              ? "text-yellow-600 font-semibold"
                              : "text-red-600 font-semibold"
                          }
                        >
                          {getPasswordStrength(p.password)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          Duplicates:{" "}
                        </span>
                        <span
                          className={
                            getDuplicateCount(p.password) > 0
                              ? "text-red-600 font-bold"
                              : "text-gray-400"
                          }
                        >
                          {getDuplicateCount(p.password)}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-gray-500">
                          Employee:{" "}
                        </span>
                        <span className="text-xs text-gray-700">
                          {p.employee}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="text-xs text-gray-500">Usage</div>
                        <div className={`text-xs font-semibold px-2 py-0.5 rounded inline-block w-fit
                          ${p.usageTag === 'Expired' ? 'bg-red-100 text-red-700' :
                            p.usageTag === 'Not In Use' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-green-100 text-green-700'}`}
                        >
                          {p.usageTag || 'In Use'}
                        </div>
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
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">S.No</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Website/Service</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">URL</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Password</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden xs:table-cell">Username</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden md:table-cell">Employee/User</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Strength</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap hidden sm:table-cell">Duplicate</th>
                      <th className="px-3 py-2 text-left font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Usage</th>
                      <th className="px-3 py-2 text-center font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {filteredPasswords.length === 0 && (
                      <tr>
                        <td colSpan={10} className="text-center py-8 text-gray-400">No passwords found.</td>
                      </tr>
                    )}
                    {filteredPasswords.map((p, idx) => (
                      <tr key={idx} className="hover:bg-purple-50 transition cursor-pointer" onClick={() => { setSelectedPassword(p); setShowPasswordDetailModal(true); }}>
                        {/* S.No */}
                        <td className="px-3 py-2 whitespace-nowrap align-top font-semibold text-gray-500">{idx + 1}</td>
                        {/* Website/Service and category always visible */}
                        <td className="px-3 py-2 whitespace-nowrap align-top">
                          <div className="font-semibold text-gray-800 text-sm md:text-base">{p.website}</div>
                          <div className="text-xs text-gray-400">{p.category}</div>
                          {/* Show strength and duplicate on mobile stacked */}
                          <div className="sm:hidden mt-1 flex flex-wrap gap-2">
                            <span className={getPasswordStrength(p.password) === "Strong" ? "text-green-600 font-semibold" : getPasswordStrength(p.password) === "Medium" ? "text-yellow-600 font-semibold" : "text-red-600 font-semibold"}>{getPasswordStrength(p.password)}</span>
                            <span className={getDuplicateCount(p.password) > 0 ? "text-red-600 font-bold" : "text-gray-400"}>Duplicates: {getDuplicateCount(p.password)}</span>
                          </div>
                        </td>
                        {/* URL column */}
                        <td className="px-3 py-2 whitespace-nowrap align-top max-w-xs">
                          <div className="relative max-w-xs overflow-hidden" style={{ maxWidth: 180 }}>
                            <span className="truncate block" style={{ maxWidth: 160 }}>{p.url}</span>
                            <span className="absolute right-0 top-0 h-full w-8 pointer-events-none" style={{ background: "linear-gradient(to right, transparent, white 80%)" }}></span>
                          </div>
                        </td>
                        {/* Password column: always visible after Website/Service */}
                        <td className="px-3 py-2 whitespace-nowrap align-top">
                          <div className="flex items-center gap-2">
                            <span className="font-mono">{tablePasswordVisible[idx] ? p.password : "•".repeat(Math.max(8, p.password.length))}</span>
                            <button className="text-gray-400 hover:text-purple-600" onClick={(e) => { e.stopPropagation(); setTablePasswordVisible((v) => ({ ...v, [idx]: !v[idx] })); }} title={tablePasswordVisible[idx] ? "Hide" : "Show"} aria-label={tablePasswordVisible[idx] ? "Hide password" : "Show password"}>{tablePasswordVisible[idx] ? (/* eye-off icon */<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>) : (/* eye icon */<svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>)}</button>
                            <button className="text-gray-400 hover:text-purple-600" onClick={(e) => { e.stopPropagation(); handleCopy(p.password, idx); }} title="Copy Password" aria-label="Copy password">
                              {copiedIdx === idx ? (
                                // Tick icon
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              ) : (
                                // Simple copy icon
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="9" y="9" width="13" height="13" rx="2"/><rect x="3" y="3" width="13" height="13" rx="2"/></svg>
                              )}
                            </button>
                          </div>
                        </td>
                        {/* Username always visible */}
                        <td className="px-3 py-2 whitespace-nowrap align-top text-xs md:text-sm hidden xs:table-cell">{p.username}</td>
                        {/* Employee/User */}
                        <td className="px-3 py-2 whitespace-nowrap align-top text-xs md:text-sm hidden md:table-cell">{p.employee}</td>
                        {/* Strength: hide on mobile, show on sm+ */}
                        <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell align-top"><span className={getPasswordStrength(p.password) === "Strong" ? "text-green-600 font-semibold" : getPasswordStrength(p.password) === "Medium" ? "text-yellow-600 font-semibold" : "text-red-600 font-semibold"}>{getPasswordStrength(p.password)}</span></td>
                        {/* Duplicate: hide on mobile, show on sm+ */}
                        <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell align-top">{getDuplicateCount(p.password) > 0 ? (<span className="text-red-600 font-bold">{getDuplicateCount(p.password)}</span>) : (<span className="text-gray-400">0</span>)}</td>
                        {/* Usage: hide on mobile, show on sm+ */}
                        <td className="px-3 py-2 whitespace-nowrap hidden sm:table-cell align-top text-xs md:text-sm">
                          <span className={`px-2 py-0.5 rounded font-semibold
                            ${p.usageTag === 'Expired' ? 'bg-red-100 text-red-700' :
                              p.usageTag === 'Not In Use' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-green-100 text-green-700'}`}
                          >
                            {p.usageTag || 'In Use'}
                          </span>
                        </td>
                        {/* Actions: always visible */}
                        <td className="px-3 py-2 whitespace-nowrap text-center align-middle">
                          <div className="flex gap-2 items-center justify-center">
                            <button className="text-blue-500 hover:text-blue-700 px-1" onClick={(e) => { e.stopPropagation(); setEditPassword(p); setShowEditModal(true); }} title="Edit Password" aria-label="Edit password"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536M9 11l6 6M3 17v4h4l10.293-10.293a1 1 0 00-1.414-1.414L3 17z" /></svg></button>
                            <button className="text-red-500 hover:text-red-700 px-1" onClick={(e) => { e.stopPropagation(); setPendingDelete(p.id); setShowDeleteModal(true); }} title="Delete Password" aria-label="Delete password"><svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg></button>
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
