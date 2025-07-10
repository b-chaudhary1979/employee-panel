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
    body: "",
    priority: "Normal",
    schedule: "now", // now | later
    publishDate: "", // YYYY‑MM‑DDTHH:MM
    attachments: [], // File list
  });

  /** form validation state **/
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorities = ["Low", "Normal", "High"];

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

    // Body validation
    if (!form.body.trim()) {
      newErrors.body = "Body is required";
    } else if (form.body.trim().length < 10) {
      newErrors.body = "Body must be at least 10 characters long";
    } else if (form.body.trim().length > 2000) {
      newErrors.body = "Body must be less than 2000 characters";
    }

    // Schedule validation
    if (form.schedule === "later") {
      if (!form.publishDate) {
        newErrors.publishDate =
          "Publish date is required when scheduling for later";
      } else {
        const selectedDate = new Date(form.publishDate);
        const now = new Date();
        if (selectedDate <= now) {
          newErrors.publishDate = "Publish date must be in the future";
        }
      }
    }

    // File validation
    if (form.attachments.length > 0) {
      const maxFileSize = 10 * 1024 * 1024; // 10MB
      const allowedTypes = [
        "image/jpeg",
        "image/png",
        "image/gif",
        "application/pdf",
        "text/plain",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ];

      for (let i = 0; i < form.attachments.length; i++) {
        const file = form.attachments[i];
        if (file.size > maxFileSize) {
          newErrors.attachments = `File "${file.name}" is too large. Maximum size is 10MB`;
          break;
        }
        if (!allowedTypes.includes(file.type)) {
          newErrors.attachments = `File "${file.name}" has an unsupported type. Allowed types: JPG, PNG, GIF, PDF, TXT, DOC, DOCX`;
          break;
        }
      }
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

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setForm((prevForm) => ({ ...prevForm, attachments: files }));
    // Clear file errors when new files are selected
    if (errors.attachments) {
      setErrors((prev) => ({ ...prev, attachments: null }));
    }
  };

  const removeFile = (index) => {
    setForm((prevForm) => ({
      ...prevForm,
      attachments: prevForm.attachments.filter((_, i) => i !== index),
    }));
  };

  const showNotification = (message, type = "success") => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: "", type: "success" });
    }, 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showNotification("Please fix the errors in the form", "error");
      return;
    }

    setIsSubmitting(true);

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Frontend-only: Just show success and reset form
      showNotification("Announcement created successfully!", "success");

      // Reset form with proper state update
      setForm({
        title: "",
        body: "",
        priority: "Normal",
        schedule: "now",
        publishDate: "",
        attachments: [],
      });

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

  // Get minimum datetime for scheduling (current time + 1 minute)
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 1);
    return now.toISOString().slice(0, 16);
  };

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
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                    Create Announcement
                  </h1>
                  <p className="text-gray-500 text-lg">
                    Create and manage announcements for your organization
                  </p>
                </div>
              </div>

              <form
                onSubmit={handleSubmit}
                className="bg-white rounded-2xl shadow border border-gray-100 p-8 space-y-6"
              >
                {/* Title */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => {
                      setForm((prevForm) => ({
                        ...prevForm,
                        title: e.target.value,
                      }));
                    }}
                    className={`w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 ${
                      errors.title ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Enter announcement title here..."
                    required
                    maxLength={100}
                    disabled={isSubmitting}
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title}</p>
                  )}
                </div>

                {/* Body */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Body <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={form.body}
                    onChange={(e) => {
                      setForm((prevForm) => ({
                        ...prevForm,
                        body: e.target.value,
                      }));
                    }}
                    className={`w-full border border-gray-200 rounded-lg px-4 py-3 h-40 resize-y focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 ${
                      errors.body ? "border-red-500" : "border-gray-200"
                    }`}
                    placeholder="Write your announcement..."
                    required
                    maxLength={2000}
                    disabled={isSubmitting}
                  />
                  <div className="flex justify-between items-center mt-1">
                    {errors.body && (
                      <p className="text-red-500 text-sm">{errors.body}</p>
                    )}
                    <p className="text-gray-500 text-sm ml-auto">
                      {form.body.length}/2000 characters
                    </p>
                  </div>
                </div>

                {/* Priority */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-3">
                    Priority
                  </label>
                  <div className="flex gap-3">
                    {priorities.map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setForm((prevForm) => {
                            const newForm = { ...prevForm, priority: p };
                            return newForm;
                          });
                        }}
                        className={`px-6 py-3 rounded-lg text-lg font-semibold border transition-colors ${
                          form.priority === p
                            ? "bg-[#a259f7] text-white border-[#a259f7]"
                            : "bg-gray-100 border-gray-200 text-gray-700 hover:bg-gray-200"
                        }`}
                        aria-pressed={form.priority === p}
                        disabled={isSubmitting}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Schedule */}
                <div className="grid sm:grid-cols-2 gap-6">
                  <div>
                    <span className="block text-lg font-semibold text-gray-700 mb-2">
                      Publish
                    </span>
                    <label className="inline-flex items-center gap-3 mr-6">
                      <input
                        type="radio"
                        name="schedule"
                        value="now"
                        checked={form.schedule === "now"}
                        onChange={() => {
                          setForm((prevForm) => ({
                            ...prevForm,
                            schedule: "now",
                            publishDate: "",
                          }));
                        }}
                        className="text-[#a259f7] focus:ring-[#a259f7]"
                        disabled={isSubmitting}
                      />
                      <span className="text-lg text-gray-700">Now</span>
                    </label>
                    <label className="inline-flex items-center gap-3">
                      <input
                        type="radio"
                        name="schedule"
                        value="later"
                        checked={form.schedule === "later"}
                        onChange={() => {
                          setForm((prevForm) => ({
                            ...prevForm,
                            schedule: "later",
                          }));
                        }}
                        className="text-[#a259f7] focus:ring-[#a259f7]"
                        disabled={isSubmitting}
                      />
                      <span className="text-lg text-gray-700">Later</span>
                    </label>
                  </div>

                  {form.schedule === "later" && (
                    <div>
                      <label className="block text-lg font-semibold text-gray-700 mb-2">
                        Publish Date &amp; Time{" "}
                        <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="datetime-local"
                        value={form.publishDate}
                        onChange={(e) => {
                          setForm((prevForm) => ({
                            ...prevForm,
                            publishDate: e.target.value,
                          }));
                        }}
                        min={getMinDateTime()}
                        className={`w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 ${
                          errors.publishDate
                            ? "border-red-500"
                            : "border-gray-200"
                        }`}
                        required
                        disabled={isSubmitting}
                      />
                      {errors.publishDate && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.publishDate}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* Attachments */}
                <div>
                  <label className="block text-lg font-semibold text-gray-700 mb-2">
                    Attachments
                  </label>
                  <input
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.doc,.docx"
                    className={`w-full border border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-lg file:font-semibold file:bg-[#a259f7] file:text-white hover:file:bg-[#7c3aed] ${
                      errors.attachments ? "border-red-500" : "border-gray-200"
                    }`}
                  />
                  {errors.attachments && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.attachments}
                    </p>
                  )}
                  {form.attachments.length > 0 && (
                    <div className="mt-4 space-y-3">
                      <p className="text-lg text-gray-700 font-semibold">
                        Selected files:
                      </p>
                      {form.attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                        >
                          <div className="flex items-center gap-3">
                            <svg
                              className="w-5 h-5 text-gray-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                              />
                            </svg>
                            <span className="text-lg text-gray-700">
                              {file.name}
                            </span>
                            <span className="text-sm text-gray-500">
                              ({(file.size / 1024 / 1024).toFixed(2)} MB)
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-500 hover:text-red-700 text-lg font-semibold"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div className="flex gap-4 justify-end pt-4">
                  <button
                    type="button"
                    className="px-6 py-3 rounded-lg border border-gray-200 text-lg text-gray-700 hover:bg-gray-50 transition-colors font-semibold"
                    onClick={() => {
                      setForm({
                        title: "",
                        body: "",
                        priority: "Normal",
                        schedule: "now",
                        publishDate: "",
                        attachments: [],
                      });
                      setErrors({});
                      showNotification("Form cleared", "success");
                    }}
                    disabled={isSubmitting}
                  >
                    Clear Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 rounded-lg bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-3 text-lg"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Publishing...
                      </>
                    ) : (
                      "Publish Announcement"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </main>
        </div>
      </div>
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
