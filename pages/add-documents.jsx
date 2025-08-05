import React, { useState, useRef, useEffect, useMemo } from "react";
import { FaUser, FaLink, FaFileUpload, FaCalendarAlt, FaTags, FaAlignLeft } from "react-icons/fa";
import { useUserInfo } from "../context/UserInfoContext";
import { useRouter } from 'next/router';
import { SidebarProvider } from "../context/SidebarContext";
import AddDocumentModal from "../components/AddDocumentModal";
import useStoreData from "../hooks/useStoreData";
// import CryptoJS from "crypto-js"; // TEMPORARILY DISABLED - not using encryption

// TEMPORARILY DISABLED: Utility to decrypt token into ci and aid
// const ENCRYPTION_KEY = "cyberclipperSecretKey123!";
// function decryptToken(token) {
//   console.log("🔐 [DECRYPT] Attempting to decrypt token:", token ? "present" : "missing");
//   try {
//     const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
//     const decrypted = bytes.toString(CryptoJS.enc.Utf8);
//     const { ci, aid } = JSON.parse(decrypted);
//     console.log("🔐 [DECRYPT] Successfully decrypted - ci:", ci, "aid:", aid);
//     return { ci, aid };
//   } catch (error) {
//     console.error("🔐 [DECRYPT] Failed to decrypt token:", error);
//     return { ci: null, aid: null };
//   }
// }

function AddDocumentsPageContent() {
  console.log("🔄 [RENDER] AddDocumentsPageContent rendering");
  
  const router = useRouter();
  const { token, cid, aid } = router.query; // Get encrypted token or cid and aid from query
  const { user, loading } = useUserInfo();
  
  console.log("📋 [STATE] Router query - token:", token ? "present" : "missing", "cid:", cid || "missing", "aid:", aid || "missing");
  console.log("👤 [STATE] User info - loading:", loading, "user:", user ? "present" : "missing", "user aid:", user?.aid);
  console.log("👤 [STATE] User details - companyId:", user?.companyId, "ci:", user?.ci, "aid:", user?.aid);
  
  // Get companyId and employeeId directly from cid and aid parameters
  const companyId = cid;
  const employeeId = aid || user?.aid || user?.employeeId || user?.id || 'temp-employee-id';
  
  console.log("🏢 [STATE] Final values - companyId:", companyId, "employeeId:", employeeId);
  
  const {
    uploadMedia,
    addLink,
    loading: uploadLoading,
  } = useStoreData(companyId, employeeId);

  console.log("📦 [HOOK] useStoreData called with - companyId:", companyId, "employeeId:", employeeId);
  console.log("📦 [HOOK] useStoreData returned - uploadLoading:", uploadLoading);

  // Add modal state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });

  console.log("🎭 [STATE] Modal state - showAddDocumentModal:", showAddDocumentModal);

  // Simple authentication check - same as other pages
  useEffect(() => {
    console.log("🔐 [AUTH] Authentication check - router.isReady:", router.isReady, "cid:", cid || "missing");
    console.log("🔐 [AUTH] Router state - isReady:", router.isReady, "asPath:", router.asPath);
    if (router.isReady && !cid) {
      console.log("🔐 [AUTH] Redirecting to login - no valid parameters");
      router.replace("/auth/login");
    }
  }, [router.isReady, cid]);

  // Simple loading states - same as other pages
  if (!cid) {
    console.log("❌ [RENDER] Early return - no valid parameters");
    return null;
  }
  if (loading) {
    console.log("⏳ [RENDER] User context loading - waiting for user data");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your information.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug Info:</p>
            <p>CID: {cid || "missing"}</p>
            <p>User Loading: {loading ? "true" : "false"}</p>
            <p>Employee ID: {employeeId || "missing"}</p>
            <p>User: {user ? "present" : "missing"}</p>
          </div>
        </div>
      </div>
    );
  }
  
  // If we have cid but no employeeId, we can still proceed for file upload
  if (!employeeId) {
    console.log("⚠️ [RENDER] No employeeId but have cid - proceeding with limited functionality");
    // We can still show the modal for file upload, but some features might be limited
  }

  // Handle document addition
  const handleAddDocument = (documentData) => {
    console.log("📄 [HANDLER] handleAddDocument called with:", documentData);
    // Don't handle redirection here - let onSuccess handle it
    // This prevents double router.back() calls
  };

  // Handle modal close
  const handleCloseModal = () => {
    console.log("❌ [HANDLER] handleCloseModal called");
    setShowAddDocumentModal(false);
    router.back();
  };

  console.log("✅ [RENDER] Rendering main component");

  return (
    <>
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className={`bg-gradient-to-r ${notification.color === 'green' ? 'from-green-500 to-green-400' : 'from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {notification.message}
          </div>
        </div>
      )}

      {/* AddDocumentModal */}
      <AddDocumentModal
        open={showAddDocumentModal}
        onClose={handleCloseModal}
        onAdd={handleAddDocument}
        companyId={companyId}
        onSuccess={(message) => {
          console.log("✅ [SUCCESS] onSuccess called with message:", message);
          setNotification({ show: true, message, color: 'green' });
          setTimeout(() => {
            console.log("⏰ [TIMEOUT] Executing timeout callback");
            setNotification({ show: false, message: '', color: 'green' });
            router.back();
          }, 1500);
        }}
      />
    </>
  );
}

export default function AddDocumentsPage() {
  console.log("🏗️ [RENDER] AddDocumentsPage wrapper rendering");
  return (
    <SidebarProvider>
      <AddDocumentsPageContent />
    </SidebarProvider>
  );
}

 