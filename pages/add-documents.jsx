import React, { useState, useRef, useEffect } from "react";
import { FaUser, FaLink, FaFileUpload, FaCalendarAlt, FaTags, FaAlignLeft } from "react-icons/fa";
import { useUserInfo } from "../context/UserInfoContext";
import { useRouter } from 'next/router';
import useStoreData from "../hooks/useStoreData";
import { SidebarProvider } from "../context/SidebarContext";
import AddDocumentModal from "../components/AddDocumentMondal";

function AddDocumentsPageContent() {
  const router = useRouter();
  const { cid } = router.query; // Use cid directly like register-employee page
  const { user, loading } = useUserInfo();
  
  // Use cid directly from query - same as register-employee page
  const companyId = cid;
  const employeeId = user?.aid; // Get employee ID from user context
  const { uploadMedia, addLink, loading: uploadLoading } = useStoreData(companyId, employeeId);

  // Add modal state
  const [showAddDocumentModal, setShowAddDocumentModal] = useState(true);
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });

  // COMMENTED OUT FORM STATE - NOT USED (AddDocumentModal handles this)
  /*
  // Form state
  const [form, setForm] = useState({
    title: "",
    submitterName: "",
    linkData: "",
    textData: "",
    category: "",
    tags: "",
    notes: "",
    createdAt: new Date().toISOString(),
  });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [error, setError] = useState("");
  */

  // Simple authentication check - same as register-employee page
  useEffect(() => {
    if (router.isReady && !cid) {
      router.replace("/auth/login");
    }
  }, [router.isReady, cid]);

  // Simple loading states - same as register-employee page
  if (!cid) return null;
  if (loading || uploadLoading || !employeeId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Loading...</h1>
          <p className="text-gray-600">Please wait while we load your information.</p>
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

  // COMMENTED OUT FUNCTIONS - NOT USED (AddDocumentModal handles these)
  /*
  // Form handlers
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prev => [...prev, ...files]);
    e.target.value = ""; // Reset input so selecting the same file again works
  };

  const handleRemoveFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // If there are files, upload them
    if (uploadedFiles.length > 0) {
      let uploadedFileMetas = [];
      try {
        for (const file of uploadedFiles) {
          const meta = await uploadMedia(file, {
            title: form.title,
            submitterName: form.submitterName,
            linkData: form.linkData,
            textData: form.textData,
            category: form.category,
            tags: form.tags,
            notes: form.notes,
            createdAt: form.createdAt,
          });
          if (!meta.success) throw new Error(meta.error || 'Upload failed');
          uploadedFileMetas.push(meta);
        }
      } catch (err) {
        setError(err.message || 'File upload failed');
        return;
      }
      
      // Call onAdd with uploaded file metadata
      const documentData = {
        ...form,
        files: uploadedFileMetas,
        id: Date.now(),
      };
      handleAddDocument(documentData);
      return;
    }
    
    // If there is a link, store it in Firestore
    if (form.linkData) {
      const linkData = {
        ...form,
        url: form.linkData, // Store as 'url' for compatibility
        createdAt: new Date().toISOString(),
      };
      delete linkData.linkData; // Remove the old property
      const result = await addLink(linkData);
      if (!result.success) {
        setError(result.error || "Failed to add link");
        return;
      }
      handleAddDocument(linkData);
      return;
    }
    
    // Optionally, handle the case where neither file nor link is provided
    setError("Please upload a file or enter a link.");
  };
  */

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
          setNotification({ show: true, message, color: 'green' });
          setTimeout(() => {
            setNotification({ show: false, message: '', color: 'green' });
            router.back();
          }, 1500);
        }}
      />

      {/* ORIGINAL FORM CODE - COMMENTED OUT (NOT USED) */}
      {/*
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 to-purple-100/80 backdrop-blur-[6px]">
        <div className="bg-white/80 border border-purple-200 rounded-3xl shadow-2xl w-full max-w-4xl p-0 relative animate-modalIn backdrop-blur-xl ring-1 ring-purple-100">
          <div className="w-full h-full max-h-[90vh] flex flex-col">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-purple-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow-md hover:bg-purple-100"
              onClick={() => router.push(`/data?cid=${encodeURIComponent(cid)}`)}
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="px-8 pt-8 pb-2">
              <h2 className="text-2xl font-extrabold mb-1 text-purple-700 tracking-tight drop-shadow-sm">
                Add New Document
              </h2>
              <div className="h-1 w-24 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-full mb-3" />
              <p className="mb-4 text-gray-500 text-sm">Fill in the details below to add a new document entry.</p>
            </div>
            
            <div className="flex-1 overflow-y-auto px-4 pb-8">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-6 text-gray-800 bg-white/70 rounded-2xl p-6 shadow-lg ring-1 ring-purple-50">
                // Title field
                // Submitter Name field  
                // Link Data field
                // Category field
                // File Upload field with file display
                // Text Data field
                // Tags field
                // Created Date field
                // Notes field
                // Error Display
                // Submit Button
              </form>
            </div>
          </div>
        </div>
      </div>
      */}
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

 