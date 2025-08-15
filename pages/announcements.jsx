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

  // Add state for details modal
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState(null);

  const {
    announcements,
    loading: loadingAnnouncements,
    error: announcementsError,
    readStatus,
    markAsRead,
    markAllAsRead,
  } = useAnnouncements(ci, aid);

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
    if (!createdAt) return "N/A";
    // Firestore Timestamp object
    if (typeof createdAt === "object" && createdAt.seconds) {
      return new Date(createdAt.seconds * 1000).toLocaleDateString();
    }
    // ISO string or other string
    const date = new Date(createdAt);
    if (!isNaN(date.getTime())) {
      return date.toLocaleDateString();
    }
    return "N/A";
  }

  // Handle announcement click to open details modal
  const handleAnnouncementClick = (announcement) => {
    setSelectedAnnouncement(announcement);
    setShowDetailsModal(true);
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
              {/* Announcements List */}
              <div className="space-y-4">
              <h1 className="text-3xl font-bold text-green-500 mb-2">
                  All Announcements
              </h1>
              <p className="text-gray-500 text-lg mb-8">
                  Stay updated with the latest news and important information for all employees.
                </p>
              
              {/* Mark All as Read Button */}
              <div className="flex justify-end mb-4">
                <button
                  className="bg-green-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                  onClick={markAllAsRead}
                  disabled={announcements.every(a => readStatus[a.id])}
                >
                  Mark All as Read
                </button>
              </div>

                {loadingAnnouncements ? (
                  <div className="flex justify-center items-center py-12">
                    <Loader />
                  </div>
                ) : announcementsError ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <div className="text-red-600 mb-2">
                      <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                    <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Announcements</h3>
                    <p className="text-red-600">{announcementsError}</p>
                    </div>
                ) : announcements.length === 0 ? (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
                    <div className="text-gray-400 mb-4">
                      <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                    <h3 className="text-xl font-semibold text-gray-600 mb-2">No Announcements</h3>
                    <p className="text-gray-500">There are no announcements available at this time.</p>
                    </div>
                ) : (
                  announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`bg-white rounded-md shadow border border-gray-100 p-3 cursor-pointer hover:shadow-lg hover:border-green-200 transition-all duration-200 ${
                      readStatus[announcement.id] ? "opacity-60" : ""
                    }`}
                    onClick={() => handleAnnouncementClick(announcement)}
                  >
                    <div className="flex flex-col gap-2">
                      <div
                        className={`inline-block px-2 py-0.5 rounded bg-${getTypeColor(
                          announcement.type
                        )}-100 text-${getTypeColor(
                          announcement.type
                        )}-700 text-xs font-medium w-fit`}
                      >
                        {announcement.type.charAt(0).toUpperCase() +
                          announcement.type.slice(1)}
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-semibold text-gray-900 flex-1 pr-3">
                          {announcement.title}
                        </h3>
                        <button
                          className={`px-2 py-1 rounded text-sm font-medium transition-colors flex-shrink-0 ${
                            readStatus[announcement.id]
                              ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent opening the modal when clicking the button
                            if (!readStatus[announcement.id]) {
                              markAsRead(announcement.id);
                            }
                          }}
                          disabled={readStatus[announcement.id]}
                        >
                          {readStatus[announcement.id] ? "Read" : "Mark as Read"}
                        </button>
                      </div>

                      <div className="text-gray-600 text-sm leading-snug">
                        {announcement.content}
                      </div>
                    </div>
                  </div>
                ))
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Announcement Details Modal */}
      {showDetailsModal && selectedAnnouncement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur">
          <div className="relative w-full max-w-2xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] border border-gray-200 m-4">
            
                        <div>
              {/* Header */}
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div
                    className={`flex items-center gap-1 px-3 py-1 rounded-full bg-${getTypeColor(
                      selectedAnnouncement.type
                    )}-100`}
                  >
                    <div className={`text-${getTypeColor(selectedAnnouncement.type)}-500`}>
                      {getTypeIcon(selectedAnnouncement.type)}
                    </div>
                    <span className={`text-sm font-semibold text-${getTypeColor(selectedAnnouncement.type)}-700`}>
                      {selectedAnnouncement.type.charAt(0).toUpperCase() + selectedAnnouncement.type.slice(1)}
                    </span>
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedAnnouncement.title}
                </h2>
                {selectedAnnouncement.subtitle && (
                  <p className="text-lg text-gray-600 mb-3">{selectedAnnouncement.subtitle}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span>{getAnnouncementDate(selectedAnnouncement.createdAt)}</span>
                  {selectedAnnouncement.author && (
                    <span>By {selectedAnnouncement.author}</span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="mb-6">
                <div className="prose max-w-none">
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {selectedAnnouncement.content}
                  </p>
                </div>
              </div>

              {/* Image */}
              {selectedAnnouncement.image && (
                <div className="mb-6">
                  <img
                    src={selectedAnnouncement.image}
                    alt="Announcement"
                    className="w-full max-h-64 object-cover rounded-lg border"
                  />
                </div>
              )}

              {/* Additional Details */}
              {(selectedAnnouncement.audience || selectedAnnouncement.expiryDate || selectedAnnouncement.tags) && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  {selectedAnnouncement.audience && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Target Audience</h4>
                      <p className="text-gray-600">{selectedAnnouncement.audience}</p>
                    </div>
                  )}
                  {selectedAnnouncement.expiryDate && (
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-1">Expires</h4>
                      <p className="text-gray-600">{new Date(selectedAnnouncement.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                  {selectedAnnouncement.tags && selectedAnnouncement.tags.trim() && (
                    <div className="md:col-span-2">
                      <h4 className="font-semibold text-gray-700 mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedAnnouncement.tags.split(',').filter(tag => tag.trim()).map((tag, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium"
                          >
                            {tag.trim()}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Link */}
              {selectedAnnouncement.link && selectedAnnouncement.link.trim() && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-2">Related Link</h4>
                  <a
                    href={selectedAnnouncement.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 underline"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open Link
                  </a>
                </div>
              )}

                            {/* Custom Q&A */}
              {selectedAnnouncement.customQA && 
               selectedAnnouncement.customQA.length > 0 && 
               selectedAnnouncement.customQA.some(qa => qa.question && qa.question.trim() && qa.answer && qa.answer.trim()) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Questions & Answers</h4>
                  <div className="space-y-4">
                    {selectedAnnouncement.customQA.map((qa, index) => (
                      qa.question && qa.question.trim() && qa.answer && qa.answer.trim() && (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-800 mb-2">Q: {qa.question}</h5>
                          <p className="text-gray-600">A: {qa.answer}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Custom Q&A */}
              {selectedAnnouncement.customQA && 
               selectedAnnouncement.customQA.length > 0 && 
               selectedAnnouncement.customQA.some(qa => qa.question && qa.question.trim() && qa.answer && qa.answer.trim()) && (
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">Questions & Answers</h4>
                  <div className="space-y-4">
                    {selectedAnnouncement.customQA.map((qa, index) => (
                      qa.question && qa.question.trim() && qa.answer && qa.answer.trim() && (
                        <div key={index} className="bg-gray-50 rounded-lg p-4">
                          <h5 className="font-medium text-gray-800 mb-2">Q: {qa.question}</h5>
                          <p className="text-gray-600">A: {qa.answer}</p>
                        </div>
                      )
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    readStatus[selectedAnnouncement.id]
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-green-100 text-green-700 hover:bg-green-200"
                  }`}
                  onClick={() => {
                    if (!readStatus[selectedAnnouncement.id]) {
                      markAsRead(selectedAnnouncement.id);
                    }
                  }}
                  disabled={readStatus[selectedAnnouncement.id]}
                >
                  {readStatus[selectedAnnouncement.id] ? "Already Read" : "Mark as Read"}
                </button>
                <button
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setShowDetailsModal(false);
                    setSelectedAnnouncement(null);
                  }}
                >
                  Close
                </button>
              </div>
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
