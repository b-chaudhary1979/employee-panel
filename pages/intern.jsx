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
import { useAuth } from "../context/AuthContext";
import Loader from "../loader/Loader";
import { Fragment } from "react";
import RegisterInternForm from "../components/RegisterInternForm";
import Head from "next/head";
import useStoreInterns from "../hooks/useStoreInterns";
import { Pen, Trash2 } from "lucide-react";
import GenerateQRCode from "../components/genereateQrCode";
function InternsContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error, isAuthenticated } = useAuth();
  
  // Get companyId from secure auth context instead of URL
  const companyId = user?.companyId || ci;
  
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green", // 'green' for success, 'red' for delete
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showInternModal, setShowInternModal] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteIntId, setDeleteIntId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { interns, loading: internLoading, addIntern, updateIntern, deleteIntern, error: intError } = useStoreInterns(companyId);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedInternId, setCopiedInternId] = useState(null);
  const [allowInternToEdit, setAllowInternToEdit] = useState(false);
  
  // QR Code hook
  const qrCodeHook = GenerateQRCode({
    title: "Intern QR Code",
    onError: (message) => {
      setNotification({ show: true, message, color: "red" });
      setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
    }
  });

  // Add handler for form submit
  const handleAddIntern = async (form, customQA) => {
    await addIntern({ ...form, customQA });
    setShowRegisterModal(false);
    setNotification({ show: true, message: "Intern registered successfully!", color: "green" });
    setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 2000);
  };

  // Add handler for edit
  const handleEditIntern = (inter) => {
    setSelectedIntern(inter);
    setEditMode(true);
    setShowInternModal(true);
  };
  // Add handler for view
  const handleViewIntern = (inter) => {
    setSelectedIntern(inter);
    setEditMode(false);
    setShowInternModal(true);
    setAllowInternToEdit(inter.allowInternToEdit || false);
  };
  // Add handler for delete
  const handleDeleteIntern = async (id) => {
    setIsDeleting(true);
    await deleteIntern(id); // Hard delete
    setShowDeleteConfirm(false);
    setDeleteIntId(null);
    setNotification({ show: true, message: "Intern deleted successfully!", color: "red" });
    setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
    setIsDeleting(false);
  };

  // Add handler for copy interns ID
  const handleCopyInternId = (id) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedInternId(id);
      setNotification({ show: true, message: `Intern ID copied!`, color: "green" });
      setTimeout(() => {
        setNotification({ show: false, message: "", color: "green" });
        setCopiedInternId(null);
      }, 1000);
    }
  };

  // Add handler for QR generation
  const handleGenerateQR = async (intern) => {
    try {
      await qrCodeHook.generateQRCode(intern);
    } catch (error) {
      setNotification({ show: true, message: "Error generating QR code", color: "red" });
      setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
    }
  };

  useEffect(() => {
    if (router.isReady && (!isAuthenticated || (!ci && !aid))) {
      // Add a small delay to allow router.query to stabilize after navigation
      const timer = setTimeout(() => {
        if (!isAuthenticated || (!ci && !aid)) {
          router.replace("/auth/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, ci, aid, isAuthenticated]);

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

  // Prevent escape key during deletion
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isDeleting) {
        e.preventDefault();
      }
    };
    
    if (isDeleting) {
      document.addEventListener('keydown', handleEscape);
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isDeleting]);

  // Filter interns by search and status
  const filteredInterns = interns.filter(inter => {
    // Status filter
    const statusMatch = !statusFilter || (inter.status || "Active") === statusFilter;
    // Search filter (name, email, id)
    const q = searchQuery.trim().toLowerCase();
    const name = `${inter.firstName || ''} ${inter.lastName || ''}`.toLowerCase();
    const email = (inter.email || '').toLowerCase();
    const id = (inter.internId || intern.id || '').toLowerCase();
    const searchMatch = !q || name.includes(q) || email.includes(q) || id.includes(q);
    return statusMatch && searchMatch;
  });

  // Summary stats
  const totalInterns = interns.length;
  const activeInterns = interns.filter(inter => (inter.status || "Active") === "Active").length;
  const inactiveInterns = interns.filter(inter => (inter.status || "Active") !== "Active").length;

  // Only return after all hooks
  if (!isAuthenticated || (!ci && !aid)) return null;
  if (loading || internLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  // Helper to format Firestore Timestamp, string, or Date
  function formatTimestamp(ts) {
    if (!ts) return 'N/A';
    if (typeof ts === 'object' && ts.seconds) {
      // Firestore Timestamp
      return new Date(ts.seconds * 1000).toLocaleString();
    }
    if (typeof ts === 'string' || typeof ts === 'number') {
      const d = new Date(ts);
      if (!isNaN(d.getTime())) return d.toLocaleString();
    }
    if (ts instanceof Date) return ts.toLocaleString();
    return 'N/A';
  }

  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notification.color === 'green' ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
          {notification.color === 'green' ? (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            // Red tick for delete success
            notification.message === 'Intern deleted successfully!' ? (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-red-200">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            )
          )}
          {notification.message}
        </div>
      )}
      {/* Register Intern Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
              onClick={() => setShowRegisterModal(false)}
            >
              &#8592; Back
            </button>
            <RegisterInternForm onSubmit={handleAddIntern} />
          </div>
        </div>
      )}
      {/* Intern Detail Modal (View/Edit) */}
      {showInternModal && selectedIntern && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-2xl md:max-w-4xl mx-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl p-10 overflow-y-auto max-h-[90vh] border border-purple-200 ring-1 ring-purple-100 text-[1.15rem] md:text-xl">
            {/* Colored top border accent */}
            <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400" />
            {/* Allow Intern To Edit Toggle */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <span className="text-sm font-semibold text-gray-500">Allow Intern to Edit</span>
              <button
                onClick={async () => {
                  const newValue = !allowInternToEdit;
                  setAllowInternToEdit(newValue);
                  // Update in selectedIntern state
                  setSelectedIntern({ ...selectedIntern, allowInternToEdit: newValue });
                  // Persist to backend
                  await updateIntern(selectedIntern.id, { ...selectedIntern, allowInternToEdit: newValue });
                  setNotification({ show: true, message: `Allow Intern to Edit: ${newValue ? 'Enabled' : 'Disabled'}`, color: 'green' });
                  setTimeout(() => setNotification({ show: false, message: '', color: 'green' }), 1000);
                }}
                className={`w-10 h-6 rounded-full ${allowInternToEdit ? 'bg-green-500' : 'bg-gray-300'} flex items-center transition-colors duration-300`}
                type="button"
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${allowInternToEdit ? 'translate-x-4' : ''}`}></span>
              </button>
            </div>
            {/* Back Button */}
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 hover:bg-purple-300 rounded text-purple-700 font-semibold text-lg md:text-xl z-20"
              onClick={() => { setShowInternModal(false); setEditMode(false); }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {/* Profile Picture at the top (moved inside the border) */}
            <div className="flex flex-col items-center mb-10 mt-6 relative z-10">
              {selectedIntern.photo ? (
                <img src={selectedIntern.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg mb-2" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-purple-200 shadow-lg mb-2">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              )}
              {/* Registration date below profile picture */}
              <div className="text-sm text-gray-500 text-center mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm border border-gray-200">
                Registered on: <span className="font-semibold text-gray-700">{formatTimestamp(selectedIntern.dateRegistered)}</span>
              </div>
            </div>
            {/* Intern Details Section */}
            <div className="mb-10 bg-white/90 rounded-2xl p-7 border border-purple-100 shadow flex flex-col gap-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2h16v-2c0-2.663-5.33-4-8-4z" /></svg>
                  <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-tight">Intern Details</h2>
                </div>
                <button
                  onClick={() => handleGenerateQR(selectedIntern)}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V6a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1zm12 0h2a1 1 0 001-1V6a1 1 0 00-1-1h-2a1 1 0 00-1 1v1a1 1 0 001 1zM5 20h2a1 1 0 001-1v-1a1 1 0 00-1-1H5a1 1 0 00-1 1v1a1 1 0 001 1z" />
                  </svg>
                  Generate QR
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div><span className="text-xs text-purple-400 font-bold uppercase">Intern ID</span><br/>
                  <span className="text-xl md:text-2xl text-gray-800 flex items-center gap-2 font-bold">
                    {selectedIntern.internId || selectedIntern.id || '-'}
                    {(selectedIntern.internId || selectedIntern.id) && (
                      <button
                        type="button"
                        className="ml-1 px-2 py-1 bg-gray-200 hover:bg-purple-200 rounded text-xs text-gray-700 flex items-center gap-1"
                        title="Copy Intern ID"
                        onClick={() => {
                          handleCopyInternId(selectedIntern.internId || selectedIntern.id);
                        }}
                      >
                        {copiedInternId === (selectedIntern.internId || selectedIntern.id) ? (
                          // Tick icon
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        ) : (
                          // Copy icon
                          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <rect x="9" y="9" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                            <rect x="3" y="3" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                          </svg>
                        )}
                      </button>
                    )}
                  </span>
                </div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Name</span><br/><span className="text-xl md:text-2xl text-gray-800 font-semibold">{selectedIntern.firstName} {selectedIntern.lastName}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Email</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.email}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Phone</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.phone}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">DOB</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.dob}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Gender</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.gender}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Department</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.department}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Role</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.role}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Status</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.status || 'Active'}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Date Joined</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.dateJoined}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Address</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.address}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">City</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.city}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">State</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.state}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Country</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.country}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">ZIP Code</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.zip}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Company</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedIntern.company}</span></div>
              </div>
            </div>
            <div className="my-8 border-t border-purple-100" />
            {/* Custom Q&A Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v-1.5A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v1.5m9 0v8.25A2.25 2.25 0 0114.25 18H9.75A2.25 2.25 0 017.5 16.5V8.25m9 0H7.5" /></svg>
                <h3 className="text-xl md:text-2xl font-bold text-blue-400 tracking-tight">Custom Q&A</h3>
              </div>
              {(selectedIntern.customQA || []).length === 0 && <div className="text-base text-gray-400">No custom questions.</div>}
              <div className="space-y-4">
                {(selectedIntern.customQA || []).map((qa, idx) => (
                  <div key={idx} className="bg-white border border-blue-100 rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 shadow">
                    <div className="flex-1">
                      <span className="font-bold text-black text-lg md:text-xl">Q:</span> <span className="font-semibold text-black text-lg md:text-xl">{qa.question}</span>
                    </div>
                    <div className="flex-1 border-t md:border-t-0 md:border-l border-blue-100 md:pl-6 pt-3 md:pt-0 mt-3 md:mt-0">
                      <span className="font-bold text-black text-lg md:text-xl">A:</span> <span className="font-semibold text-black text-lg md:text-xl">{qa.answer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="my-8 border-t border-purple-100" />
            {/* Documents Section */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2a2 2 0 012-2h2a2 2 0 012 2v2m-6 4h6a2 2 0 002-2V7a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <h3 className="text-xl md:text-2xl font-bold text-green-400 tracking-tight">Documents</h3>
              </div>
              {(selectedIntern.documents || []).length === 0 && <div className="text-base text-gray-400">No documents uploaded.</div>}
              <ul className="list-disc pl-6">
                {(selectedIntern.documents || []).map((doc, idx) => (
                  <li key={idx} className="mb-2">
                    <a href={doc.data} download={doc.name} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg md:text-xl">{doc.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Status Pills, Edit Form, etc. remain unchanged */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-700">Intern Details</h2>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-gray-500">Edit</span>
                <button onClick={() => setEditMode((v) => !v)} className={`w-10 h-6 rounded-full ${editMode ? 'bg-green-500' : 'bg-gray-300'} flex items-center transition-colors duration-300`}>
                  <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${editMode ? 'translate-x-4' : ''}`}></span>
                </button>
              </div>
            </div>
            <form
              className="flex flex-col gap-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const { id, sNo, ...updateData } = selectedIntern;
                await updateIntern(selectedIntern.id, updateData);
                setShowInternModal(false);
                setEditMode(false);
                setNotification({ show: true, message: "Intern updated successfully!", color: "green" });
                setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 2000);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.firstName || ''} onChange={e => setSelectedIntern({ ...selectedIntern, firstName: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.lastName || ''} onChange={e => setSelectedIntern({ ...selectedIntern, lastName: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.email || ''} onChange={e => setSelectedIntern({ ...selectedIntern, email: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.phone || ''} onChange={e => setSelectedIntern({ ...selectedIntern, phone: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.department || ''} onChange={e => setSelectedIntern({ ...selectedIntern, department: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.role || ''} onChange={e => setSelectedIntern({ ...selectedIntern, role: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date Joined</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.dateJoined || ''} onChange={e => setSelectedIntern({ ...selectedIntern, dateJoined: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.address || ''} onChange={e => setSelectedIntern({ ...selectedIntern, address: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.city || ''} onChange={e => setSelectedIntern({ ...selectedIntern, city: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.state || ''} onChange={e => setSelectedIntern({ ...selectedIntern, state: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.country || ''} onChange={e => setSelectedIntern({ ...selectedIntern, country: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP Code</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedIntern.zip || ''} onChange={e => setSelectedIntern({ ...selectedIntern, zip: e.target.value })} required disabled={!editMode} />
                </div>
              </div>
              {/* Documents Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Documents</label>
                {(selectedIntern.documents || []).length === 0 && <div className="text-xs text-gray-400">No documents uploaded.</div>}
                <ul className="list-disc pl-5">
                  {(selectedIntern.documents || []).map((doc, idx) => (
                    <li key={idx} className="mb-1">
                      <a href={doc.data} download={doc.name} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">{doc.name}</a>
                    </li>
                  ))}
                </ul>
              </div>
              {/* Status Pills - only in edit mode, small size, before custom questions */}
              {editMode ? (
                <div className="mt-2 mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2 mt-1">
                    {["Active", "Inactive", "Pending", "Terminated", "Employment Cancelled"].map(option => (
                      <button
                        key={option}
                        type="button"
                        className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors duration-200 ${selectedIntern.status === option ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'} cursor-pointer`}
                        style={{ minWidth: 0, height: '28px', fontSize: '0.85rem' }}
                        onClick={() => setSelectedIntern({ ...selectedIntern, status: option })}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${selectedIntern.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{selectedIntern.status || 'Active'}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Q&A</label>
                {(selectedIntern.customQA || []).map((qa, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                    <input type="text" placeholder="Question" value={qa.question} onChange={e => { if (!editMode) return; const updatedQA = [...selectedIntern.customQA]; updatedQA[idx].question = e.target.value; setSelectedIntern({ ...selectedIntern, customQA: updatedQA }); }} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" disabled={!editMode} />
                    <input type="text" placeholder="Answer" value={qa.answer} onChange={e => { if (!editMode) return; const updatedQA = [...selectedIntern.customQA]; updatedQA[idx].answer = e.target.value; setSelectedIntern({ ...selectedIntern, customQA: updatedQA }); }} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" disabled={!editMode} />
                  </div>
                ))}
                {editMode && (
                  <button type="button" onClick={() => setSelectedIntern({ ...selectedIntern, customQA: [...(selected.customQA || []), { question: '', answer: '' }] })} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
                )}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-6 justify-end">
                  <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg px-4 py-2 transition-colors duration-200" onClick={() => { setShowInternModal(false); setEditMode(false); }}>Cancel</button>
                  <button type="submit" className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200">Save Changes</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
          onClick={(e) => {
            if (!isDeleting && e.target === e.currentTarget) {
              setShowDeleteConfirm(false);
              setDeleteIntId(null);
            }
          }}
        >
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this intern? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button 
                className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed" 
                onClick={() => { setShowDeleteConfirm(false); setDeleteIntId(null); }}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                onClick={() => handleDeleteIntern(deleteIntId)} 
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </button>
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
            className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              {/* Page Title and Subtitle */}
              <h1 className="text-3xl text-[#28BD78] font-bold">
                Intern Management
              </h1>
              <p className="text-gray-500 mb-6">
                Track and manage your company interns
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
                    <div className="text-gray-500 text-sm">Total Interns</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {totalInterns}
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
                      {activeInterns}
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
                      {inactiveInterns}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search, Filter, and Generate Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search interns by name, email, or ID..."
                  className="flex-1 border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                  className="border border-gray-300 text-gray-500 rounded-lg px-3 py-2 focus:outline-none"
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                >
                  <option value="">All Status</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Pending">Pending</option>
                  <option value="Terminated">Terminated</option>
                  <option value="Employment Cancelled">Employment Cancelled</option>
                </select>
                <button
                  className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
                  onClick={() => router.push('/register-intern')}
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
                  Register Intern
                </button>
              </div>

              {/* Intern Table */}
              <div className="bg-white rounded-xl shadow">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Intern ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInterns.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-gray-400">No interns found.</td>
                      </tr>
                    ) : (
                      filteredInterns.map((inter, idx) => (
                        <tr key={inter.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewIntern(inter)}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inter.sNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {inter.photo ? (
                              <img src={inter.photo} alt="Profile" className="w-9 h-9 rounded-full object-cover border" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700 cursor-pointer group relative"
                              onClick={e => { e.stopPropagation(); handleCopyInternId(inter.internId || inter.id); }}
                              title="Click to copy Intern ID"
                          >
                            {inter.InternId || inter.id}
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Copy</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500"><div className="font-bold">{inter.firstName} {inter.lastName}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inter.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inter.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{inter.status === "Active" ? (<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>) : (<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{inter.status || 'Inactive'}</span>)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{inter.dateJoined}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
                            <button className="text-purple-500 hover:text-purple-700" title="Edit Intern" onClick={() => handleEditIntern(inter)}>
                              <Pen className="w-5 h-5" />
                            </button>
                            <button className="text-red-500 hover:text-red-700" title="Delete Intern" onClick={() => { setDeleteIntId(inter.id); setShowDeleteConfirm(true); }}>
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
                {/* Mobile Cards */}
                <div className="sm:hidden">
                  {filteredInterns.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">No interns found.</div>
                  ) : (
                    filteredInterns.map((inter, idx) => (
                      <div key={inter.id} className="border-b border-gray-200 px-4 py-4 flex flex-col gap-2 cursor-pointer hover:bg-gray-50" onClick={() => handleViewIntern(inter)}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-blue-700 flex items-center gap-2">
                            {inter.sNo}.
                            {inter.photo ? (
                              <img src={inter.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                            )}
                            <span
                              className="cursor-pointer underline text-blue-700 relative group"
                              onClick={e => { e.stopPropagation(); handleCopyInternId(inter.internId || inter.id); }}
                              title="Click to copy Intern ID"
                            >
                              {inter.internId || inter.id}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Copy</span>
                            </span>
                          </span>
                          <div className="flex gap-3 self-end" onClick={e => e.stopPropagation()}>
                            <button className="text-purple-500 hover:text-purple-700" title="Edit Intern" onClick={() => handleEditIntern(inter)}><Pen className="w-5 h-5" /></button>
                            <button className="text-red-500 hover:text-red-700" title="Delete Intern" onClick={() => { setDeleteIntId(inter.id); setShowDeleteConfirm(true); }}><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <div className="text-gray-500"><span className="font-semibold">Name: </span>{inter.firstName} {inter.lastName}</div>
                        <div className="text-gray-500"><span className="font-semibold">Email: </span>{inter.email}</div>
                        <div className="text-gray-500"><span className="font-semibold">Role: </span>{inter.role}</div>
                        <div>{inter.status === "Active" ? (<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>) : (<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{inter.status || 'Inactive'}</span>)}</div>
                        <div className="text-gray-500"><span className="font-semibold">Date Joined: </span>{inter.dateJoined}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* QR Code Modal */}
      {qrCodeHook.QRModal}
    </>
  );
}

export default function Interns() {
  return (
    <SidebarProvider>
      <InternsContent />
    </SidebarProvider>
  );
}
