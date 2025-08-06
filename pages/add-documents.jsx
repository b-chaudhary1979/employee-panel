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
  
  const router = useRouter();
  const { token, cid, aid } = router.query; // Get encrypted token or cid and aid from query
  const { user, loading } = useUserInfo();
  
    // Wait for router to be ready and have valid parameters
  const isRouterReady = router.isReady && (cid || token);

  // Calculate companyId and employeeId - these might be undefined initially
  const companyId = cid;
  const employeeId = aid || user?.aid || user?.employeeId || user?.id || 'temp-employee-id';


  // Call useStoreData hook first - it will handle its own memoization and early returns
  const { uploadMedia, addLink, loading: uploadLoading, error: uploadError } = useStoreData(companyId, employeeId);
  

  // Add modal state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });


  // Simple authentication check - same as other pages
  useEffect(() => {
    if (router.isReady && !cid && !token) {
      router.replace("/auth/login");
    }
  }, [router.isReady, cid, token]);

  // Don't render the modal until we have valid parameters
  if (!isRouterReady || !companyId || !employeeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Simple loading states - same as other pages
  // Only show loading if we don't have valid parameters yet
  if (loading && (!companyId || !employeeId)) {
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
  
  // Handle document addition
  const handleAddDocument = (documentData) => {
    // Don't handle redirection here - let onSuccess handle it
    // This prevents double router.back() calls
  };

  // Handle modal close
  const handleCloseModal = () => {
    setShowAddDocumentModal(false);
    router.back();
  };


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
        employeeId={employeeId}
        onSuccess={(message) => {
          setNotification({ show: true, message, color: 'green' });
          setTimeout(() => {
            setNotification({ show: false, message: '', color: 'green' });
            router.back();
          }, 1500);
        }}
      />
    </>
  );
}

export default function AddDocumentsPage() {
  return (
    <SidebarProvider>
      <AddDocumentsPageContent />
    </SidebarProvider>
  );
}

 