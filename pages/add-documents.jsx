import React, { useState, useEffect} from "react";
import { useUserInfo } from "../context/UserInfoContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from 'next/router';
import { SidebarProvider } from "../context/SidebarContext";
import AddDocumentModal from "../components/AddDocumentModal";

function AddDocumentsPageContent() {
  
  const router = useRouter();
  const { user: authUser, loading: authLoading } = useAuth();
  const { user, loading } = useUserInfo();
  
  const isRouterReady = router.isReady && authUser;

  // Get companyId and employeeId from AuthContext
  const companyId = authUser?.companyId;
  const employeeId = authUser?.employeeId;

  // Add modal state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });


  // Simple authentication check - redirect if not authenticated
  useEffect(() => {
    if (router.isReady && !authUser && !authLoading) {
      router.replace("/auth/login");
    }
  }, [router.isReady, authUser, authLoading]);

  // Don't render the modal until we have valid parameters
  if (!isRouterReady || !companyId || !employeeId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Simple loading states - show loading if auth is still loading
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your information.</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Debug Info:</p>
            <p>Company ID: {companyId || "missing"}</p>
            <p>Employee ID: {employeeId || "missing"}</p>
            <p>Auth Loading: {authLoading ? "true" : "false"}</p>
            <p>User Loading: {loading ? "true" : "false"}</p>
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

 
