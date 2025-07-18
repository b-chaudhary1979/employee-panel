import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef, useMemo } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import Head from "next/head";
import { Edit, Trash2 } from "lucide-react";
import useAnnouncements from "../hooks/useAnnouncements";

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

// Add EditToggle component (slider style) if not already present
function EditToggle({ value, onChange }) {
  return (
    <div className="flex flex-col items-center" style={{ marginLeft: '-28px' }}>
      <div className="flex items-center">
        <button
          type="button"
          className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 focus:outline-none shadow ${value ? 'bg-green-500' : 'bg-red-500'}`}
          onClick={() => onChange(!value)}
          aria-label="Toggle Edit"
          style={{ transition: 'background 0.3s cubic-bezier(.4,2,.6,1)' }}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300`}
            style={{ left: value ? 'calc(100% - 2rem)' : '0.25rem', transition: 'left 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
        </button>
        <span className={`ml-3 text-sm font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>{value ? 'ON' : 'OFF'}</span>
      </div>
      <span className={`mt-1 text-xs font-bold ${value ? 'text-green-600' : 'text-red-600'}`}>{value ? 'Edit is ON' : 'Edit is OFF'}</span>
    </div>
  );
}

// Add StatusSwitch component for active/inactive toggle if not already present
function StatusSwitch({ value, onChange, disabled }) {
  return (
    <div className="flex flex-col items-center">
      <div className="flex items-center">
        <button
          type="button"
          className={`relative w-14 h-8 flex items-center rounded-full transition-colors duration-300 focus:outline-none shadow ${value === 'published' ? 'bg-green-500' : 'bg-red-500'}`}
          onClick={() => !disabled && onChange(value === 'published' ? 'not published' : 'published')}
          aria-label="Toggle Status"
          style={{ transition: 'background 0.3s cubic-bezier(.4,2,.6,1)' }}
          disabled={disabled}
        >
          <span
            className={`absolute top-1 w-6 h-6 rounded-full bg-white shadow-md transition-transform duration-300`}
            style={{ left: value === 'published' ? 'calc(100% - 2rem)' : '0.25rem', transition: 'left 0.3s cubic-bezier(.4,2,.6,1)' }}
          />
        </button>
        <span className={`ml-3 text-sm font-bold ${value === 'published' ? 'text-green-600' : 'text-red-600'}`}>{value === 'published' ? 'Active' : 'Inactive'}</span>
      </div>
    </div>
  );
}

function AnnouncementsContent() {
  const router = useRouter();
  const { token } = router.query;
  // memoise decryption to avoid re‑runs
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);

  /** sidebar & layout **/
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const isCollapsed = !mobileSidebarOpen && !isOpen;
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72); // Default to 72px (typical header height)

  /** user session **/
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    type: "success", // success, error, warning
  });

  /** announcement form state **/
  const [form, setForm] = useState({
    title: "",
    subtitle: "",
    type: "information", // warning, information, urgent
    content: "",
    link: "",
    image: "",
    audience: "",
    expiryDate: "",
    tags: "",
  });

  /** form validation state **/
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Add state for edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editAnnouncement, setEditAnnouncement] = useState(null);
  const [editMode, setEditMode] = useState(false);
  // Add state for custom Q&A in form and edit modal
  const [customQA, setCustomQA] = useState([{ question: "", answer: "" }]);
  const [editCustomQA, setEditCustomQA] = useState([{ question: "", answer: "" }]);

  // Add state for confirmation modals
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [confirmPublishId, setConfirmPublishId] = useState(null);
  const [confirmStatusId, setConfirmStatusId] = useState(null);
  const [pendingStatus, setPendingStatus] = useState(null);

  const { announcements, loading: loadingAnnouncements, error: announcementsError, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useAnnouncements(ci);

  // Summary stats (dynamic)
  const totalAnnouncements = announcements.length;
  const activeAnnouncements = announcements.filter(a => a.status === 'published' || a.active).length;
  const totalViews = announcements.reduce((sum, a) => sum + (a.views || 0), 0);

  const types = [
    { value: "warning", label: "Warning", color: "yellow" },
    { value: "information", label: "Information", color: "blue" },
    { value: "urgent", label: "Urgent", color: "red" },
    { value: "event", label: "Event", color: "purple" },
    { value: "reminder", label: "Reminder", color: "green" },
    { value: "promotion", label: "Promotion", color: "pink" },
    { value: "other", label: "Other", color: "gray" },
  ];

  // Validation function
  const validateForm = () => {
    const newErrors = {};

    // Title validation
    if (!form.title.trim()) {
      newErrors.title = "Title is required";
    } else if (form.title.trim().length < 3) {
      newErrors.title = "Title must be at least 3 characters long";
    } else if (form.title.trim().length > 100) {
      newErrors.title = "Title must be less than 100 characters";
    }

    // Content validation
    if (!form.content.trim()) {
      newErrors.content = "Content is required";
    } else if (form.content.trim().length < 10) {
      newErrors.content = "Content must be at least 10 characters long";
    } else if (form.content.trim().length > 2000) {
      newErrors.content = "Content must be less than 2000 characters";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field, value) => {
    setForm((prevForm) => {
      const newForm = { ...prevForm, [field]: value };
      return newForm;
    });
    // Clear field-specific errors when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const handleSubmit = async (e, action = "publish") => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      const status = action === "publish" ? "published" : "not published";
      await addAnnouncement({
        ...form,
        status,
        active: status === 'published',
        customQA,
        views: 0,
        createdAt: new Date().toISOString(),
        author: user?.name || "Admin",
      });

      // Show success message
      showNotification(
        `Announcement ${
          action === "publish" ? "published" : "saved as draft"
        } successfully!`,
        "success"
      );

      // Reset form
      setForm({
        title: "",
        subtitle: "",
        type: "information",
        content: "",
        link: "",
        image: "",
        audience: "",
        expiryDate: "",
        tags: "",
      });
      setCustomQA([{ question: "", answer: "" }]);

      // Clear errors
      setErrors({});
    } catch (error) {
      console.error("Error creating announcement:", error);
      showNotification(
        error.message || "Failed to create announcement. Please try again.",
        "error"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case "warning":
        return "yellow";
      case "urgent":
        return "red";
      default:
        return "blue";
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "warning":
        return (
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
              d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
            />
          </svg>
        );
      case "urgent":
        return (
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
              d="M12 9v3.75m0 0v3.75m0-3.75h3.75m-3.75 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
      default:
        return (
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
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  };

  // Helper to get a valid date string from Firestore Timestamp or string
  function getAnnouncementDate(createdAt) {
    if (!createdAt) return 'N/A';
    // Firestore Timestamp object
    if (typeof createdAt === 'object' && createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleDateString();
    }
    // ISO string or other string
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return 'N/A';
  }

  /* ───────────────────────────────────────── hooks ───────────────────────────────────────── */
  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  useEffect(() => {
    if (error) {
      showNotification(`Error loading user info: ${error}`, "error");
    }
  }, [error]);

  const getContentMarginLeft = () => {
    if (!isHydrated) return 270;
    if (isMobile) return 0;
    return isOpen ? 270 : 64;
  };

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

  const handleMobileSidebarToggle = () => setMobileSidebarOpen((v) => !v);
  const handleMobileSidebarClose = () => setMobileSidebarOpen(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setMobileSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ───────────────────────────────────────── render guards ─────────────────────────────────── */
  if (!ci || !aid) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  /* ───────────────────────────────────────── component ui ──────────────────────────────────── */
  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div
            className={`px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown ${
              notification.type === "error"
                ? "bg-gradient-to-r from-red-500 to-pink-500 text-white"
                : notification.type === "warning"
                ? "bg-gradient-to-r from-yellow-500 to-orange-500 text-white"
                : "bg-gradient-to-r from-green-500 to-emerald-500 text-white"
            }`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              {notification.type === "error" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : notification.type === "warning" ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              )}
            </svg>
            {notification.message}
          </div>
        </div>
      )}

      <div className="bg-[#fbf9f4] min-h-screen flex relative font-manrope">
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
          className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
          style={{
            marginLeft: getContentMarginLeft(),
            zIndex: !mobileSidebarOpen && !isOpen ? 50 : 0, // lift above collapsed sidebar
          }}
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
            className="transition-all duration-300 pl-0 pr-2 sm:pl-2 sm:pr-8 py-12 md:py-6"
            style={{
              marginLeft: 0,
              paddingTop: Math.max(headerHeight, 72) + 16,
            }}
          >
            <div className="pl-4">
              {/* Page Title */}
              <h1 className="text-3xl font-bold text-purple-500 mb-2">
                Create Announcement
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                Create and manage announcements for your organization
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5 min-w-0">
                  <div className="bg-purple-100 p-3 rounded-full">
                    <svg
                      className="w-7 h-7 text-purple-500"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500 text-sm truncate whitespace-nowrap font-medium">
                      Total Announcements
                    </div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {totalAnnouncements}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5 min-w-0">
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
                  <div className="min-w-0">
                    <div className="text-gray-500 text-sm truncate whitespace-nowrap font-medium">
                      Active
                    </div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {activeAnnouncements}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5 min-w-0">
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
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                      />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <div className="text-gray-500 text-sm truncate whitespace-nowrap font-medium">
                      Total Views
                    </div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {totalViews}
                    </div>
                  </div>
                </div>
              </div>

              {/* Create New Announcement Form */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Create New Announcement
                </h2>

                <form
                  onSubmit={(e) => handleSubmit(e, "publish")}
                  className="space-y-6"
                >
                  {/* Title and Type in one row */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Title */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Title <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) =>
                          handleInputChange("title", e.target.value)
                        }
                        className={`w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 ${
                          errors.title ? "border-red-500" : "border-gray-200"
                        }`}
                        placeholder="Enter announcement title here..."
                        required
                        maxLength={100}
                        disabled={isSubmitting}
                      />
                      {errors.title && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.title}
                        </p>
                      )}
                    </div>

                    {/* Type */}
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Type <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={form.type}
                        onChange={(e) =>
                          handleInputChange("type", e.target.value)
                        }
                        className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                        disabled={isSubmitting}
                      >
                        {types.map((type) => (
                          <option key={type.value} value={type.value}>
                            {type.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Content */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">
                      Content <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={form.content}
                      onChange={(e) =>
                        handleInputChange("content", e.target.value)
                      }
                      className={`w-full border border-gray-200 rounded-lg px-4 py-3 h-40 resize-y focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 ${
                        errors.content ? "border-red-500" : "border-gray-200"
                      }`}
                      placeholder="Write your announcement content..."
                      required
                      maxLength={2000}
                      disabled={isSubmitting}
                    />
                    <div className="flex justify-between items-center mt-1">
                      {errors.content && (
                        <p className="text-red-500 text-sm">{errors.content}</p>
                      )}
                      <p className="text-gray-500 text-sm ml-auto">
                        {form.content.length}/2000 characters
                      </p>
                    </div>
                  </div>

                  {/* Subtitle */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Subtitle</label>
                    <input
                      type="text"
                      value={form.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      placeholder="Enter subtitle here..."
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Link */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Link</label>
                    <input
                      type="text"
                      value={form.link}
                      onChange={(e) => handleInputChange("link", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      placeholder="Enter link (optional)"
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Image */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Image URL</label>
                    <input
                      type="text"
                      value={form.image}
                      onChange={(e) => handleInputChange("image", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      placeholder="Paste image URL (optional)"
                      disabled={isSubmitting}
                    />
                    {form.image && (
                      <img src={form.image} alt="Announcement" className="max-h-32 rounded-lg border mt-2" />
                    )}
                  </div>
                  {/* Audience */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Audience</label>
                    <input
                      type="text"
                      value={form.audience}
                      onChange={(e) => handleInputChange("audience", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      placeholder="Target audience (optional)"
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Expiry Date */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Expiry Date</label>
                    <input
                      type="date"
                      value={form.expiryDate}
                      onChange={(e) => handleInputChange("expiryDate", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Tags */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Tags</label>
                    <input
                      type="text"
                      value={form.tags}
                      onChange={(e) => handleInputChange("tags", e.target.value)}
                      className="w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                      placeholder="Comma separated tags (optional)"
                      disabled={isSubmitting}
                    />
                  </div>
                  {/* Custom Q&A */}
                  <div>
                    <label className="block text-lg font-semibold text-gray-700 mb-2">Custom Q&A</label>
                    {customQA.map((qa, idx) => (
                      <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                        <input
                          type="text"
                          placeholder="Question"
                          value={qa.question}
                          onChange={e => {
                            const updatedQA = [...customQA];
                            updatedQA[idx].question = e.target.value;
                            setCustomQA(updatedQA);
                          }}
                          className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                          disabled={isSubmitting}
                        />
                        <input
                          type="text"
                          placeholder="Answer"
                          value={qa.answer}
                          onChange={e => {
                            const updatedQA = [...customQA];
                            updatedQA[idx].answer = e.target.value;
                            setCustomQA(updatedQA);
                          }}
                          className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                          disabled={isSubmitting}
                        />
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => setCustomQA([...customQA, { question: "", answer: "" }])}
                      className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                      disabled={isSubmitting}
                    >
                      + Add Custom Q&A
                    </button>
                  </div>

                  {/* Action buttons */}
                  <div className="flex gap-3 justify-start pt-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Publishing...
                        </>
                      ) : (
                        "Publish"
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmit(e, "draft")}
                      disabled={isSubmitting}
                      className="px-4 py-2 rounded-lg border border-gray-200 text-sm text-gray-700 hover:bg-gray-50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? "Saving..." : "Draft"}
                    </button>
                  </div>
                </form>
              </div>

              {/* Announcements List */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-purple-600 mb-6">
                  All Announcements
                </h2>

                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className="bg-white rounded-xl shadow border border-gray-100 p-6"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-4">
                            <h3 className="text-xl font-bold text-gray-900">
                              {announcement.title}
                            </h3>
                            <div
                              className={`flex items-center gap-1 px-2 py-1 rounded-full bg-${getTypeColor(
                                announcement.type
                              )}-100 hover:bg-${getTypeColor(
                                announcement.type
                              )}-200 transition-colors cursor-pointer`}
                              title={`${
                                announcement.type.charAt(0).toUpperCase() +
                                announcement.type.slice(1)
                              } announcement`}
                            >
                              <div
                                className={`text-${getTypeColor(
                                  announcement.type
                                )}-500`}
                              >
                                {getTypeIcon(announcement.type)}
                              </div>
                              <span
                                className={`text-xs font-semibold text-${getTypeColor(
                                  announcement.type
                                )}-700`}
                              >
                                {announcement.type.charAt(0).toUpperCase() +
                                  announcement.type.slice(1)}
                              </span>
                            </div>
                            <StatusSwitch
                              value={announcement.status || (announcement.active ? 'published' : 'not published')}
                              onChange={status => {
                                setConfirmStatusId(announcement.id);
                                setPendingStatus(status);
                              }}
                              disabled={false}
                            />
                          </div>
                          <div className="flex items-center gap-4 mt-1"></div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition-colors border border-blue-200 hover:border-blue-300"
                          onClick={() => {
                            setEditAnnouncement(announcement);
                            setEditCustomQA(announcement.customQA || [{ question: "", answer: "" }]);
                            setShowEditModal(true);
                            setEditMode(false);
                          }}
                        >
                          <Edit size={23} />
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700 p-2 rounded-full hover:bg-red-50 transition-colors border border-red-200 hover:border-red-300"
                          onClick={() => setConfirmDeleteId(announcement.id)}
                        >
                          <Trash2 size={23} />
                        </button>
                      </div>
                    </div>

                    <div className="text-gray-700 leading-relaxed mb-4">
                      {announcement.content}
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          {getAnnouncementDate(announcement.createdAt)}
                        </span>
                        <span className="flex items-center gap-1">
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
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                          {announcement.views} views
                        </span>
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                            announcement.status === "published"
                              ? "bg-green-100 text-green-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {announcement.status === "published" ? "Published" : "Not Published"}
                        </span>
                      </div>
                      <div>
                        {announcement.status === "not published" && (
                          <button
                            className="px-4 py-2 bg-[#a259f7] hover:bg-[#7c3aed] text-white rounded-lg text-sm font-semibold transition-colors"
                            onClick={() => setConfirmPublishId(announcement.id)}
                          >
                            Publish Now
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] border-2 border-purple-500">
            <button
              className="absolute top-1 right-3 text-gray-400 hover:text-black text-4xl"
              onClick={() => { setShowEditModal(false); setEditMode(false); }}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-700">Edit Announcement</h2>
              <EditToggle value={editMode} onChange={setEditMode} />
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const { id, ...updateData } = editAnnouncement;
                await updateAnnouncement(editAnnouncement.id, { ...updateData, customQA: editCustomQA });
                setShowEditModal(false);
                setEditMode(false);
              }}
            >
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.title || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, title: e.target.value })}
                  required
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Subtitle</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.subtitle || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, subtitle: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black bg-white"
                  value={editAnnouncement.type || "information"}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, type: e.target.value })}
                  disabled={!editMode}
                >
                  {types.map((type) => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Content</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.content || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, content: e.target.value })}
                  rows={3}
                  required
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Link</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.link || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, link: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.image || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, image: e.target.value })}
                  disabled={!editMode}
                />
                {editAnnouncement.image && (
                  <img src={editAnnouncement.image} alt="Announcement" className="max-h-32 rounded-lg border mt-2" />
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Audience</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.audience || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, audience: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.expiryDate || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, expiryDate: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={editAnnouncement.tags || ""}
                  onChange={e => setEditAnnouncement({ ...editAnnouncement, tags: e.target.value })}
                  disabled={!editMode}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Q&A</label>
                {(editCustomQA || []).map((qa, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={qa.question}
                      onChange={e => {
                        if (!editMode) return;
                        const updatedQA = [...editCustomQA];
                        updatedQA[idx].question = e.target.value;
                        setEditCustomQA(updatedQA);
                      }}
                      className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                      disabled={!editMode}
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={qa.answer}
                      onChange={e => {
                        if (!editMode) return;
                        const updatedQA = [...editCustomQA];
                        updatedQA[idx].answer = e.target.value;
                        setEditCustomQA(updatedQA);
                      }}
                      className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                      disabled={!editMode}
                    />
                  </div>
                ))}
                {editMode && (
                  <button
                    type="button"
                    onClick={() => setEditCustomQA([...(editCustomQA || []), { question: "", answer: "" }])}
                    className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                  >
                    + Add Custom Q&A
                  </button>
                )}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-6 justify-end">
                  <button
                    type="button"
                    className="bg-red-500 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                    onClick={async () => {
                      await deleteAnnouncement(editAnnouncement.id);
                      setShowEditModal(false);
                      setEditMode(false);
                    }}
                  >
                    Delete Announcement
                  </button>
                  <button
                    type="submit"
                    className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                    onClick={() => { setShowEditModal(false); setEditMode(false); }}
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Delete */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to delete this announcement? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={() => setConfirmDeleteId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={async () => {
                  await deleteAnnouncement(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Publish */}
      {confirmPublishId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-purple-600 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Confirm Publish
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to publish this announcement?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={() => setConfirmPublishId(null)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold"
                onClick={async () => {
                  await updateAnnouncement(confirmPublishId, { status: "published" });
                  setConfirmPublishId(null);
                }}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal for Status Toggle */}
      {confirmStatusId && pendingStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-purple-600 flex items-center gap-2">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
              Confirm Status Change
            </h2>
            <p className="mb-6 text-gray-700">
              Are you sure you want to change the status of this announcement to "{pendingStatus === 'published' ? 'Published' : 'Not Published'}"?
            </p>
            <div className="flex justify-end gap-3">
              <button
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                onClick={() => { setConfirmStatusId(null); setPendingStatus(null); }}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold"
                onClick={async () => {
                  await updateAnnouncement(confirmStatusId, { status: pendingStatus, active: pendingStatus === 'published' });
                  setConfirmStatusId(null);
                  setPendingStatus(null);
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default function Announcements() {
  return (
    <SidebarProvider>
      <AnnouncementsContent />
    </SidebarProvider>
  );
}
