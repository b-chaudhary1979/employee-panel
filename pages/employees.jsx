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
import { Fragment } from "react";
import RegisterEmployeeForm from "../components/RegisterEmployeeForm";
import Head from "next/head";
import useStoreEmployees from "../hooks/useStoreEmployees";
import { Pen, Trash2 } from "lucide-react";
function EmployeesContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green", // 'green' for success, 'red' for delete
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteEmpId, setDeleteEmpId] = useState(null);
  const { employees, loading: empLoading, addEmployee, updateEmployee, deleteEmployee, error: empError } = useStoreEmployees(ci);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [copiedEmployeeId, setCopiedEmployeeId] = useState(null);
  const [allowEmployeeToEdit, setAllowEmployeeToEdit] = useState(false);

  // Add handler for form submit
  const handleAddEmployee = async (form, customQA) => {
    await addEmployee({ ...form, customQA });
    setShowRegisterModal(false);
    setNotification({ show: true, message: "Employee registered successfully!", color: "green" });
    setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 2000);
  };

  // Add handler for edit
  const handleEditEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEditMode(true);
    setShowEmployeeModal(true);
  };
  // Add handler for view
  const handleViewEmployee = (emp) => {
    setSelectedEmployee(emp);
    setEditMode(false);
    setShowEmployeeModal(true);
    setAllowEmployeeToEdit(emp.allowEmployeeToEdit || false);
  };
  // Add handler for delete
  const handleDeleteEmployee = async (id) => {
    await deleteEmployee(id); // Hard delete
    setShowDeleteConfirm(false);
    setDeleteEmpId(null);
    setNotification({ show: true, message: "Employee deleted successfully!", color: "red" });
    setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
  };

  // Add handler for copy employee ID
  const handleCopyEmployeeId = (id) => {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      setCopiedEmployeeId(id);
      setNotification({ show: true, message: `Employee ID copied!`, color: "green" });
      setTimeout(() => {
        setNotification({ show: false, message: "", color: "green" });
        setCopiedEmployeeId(null);
      }, 1000);
    }
  };

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

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

  // Filter employees by search and status
  const filteredEmployees = employees.filter(emp => {
    // Status filter
    const statusMatch = !statusFilter || (emp.status || "Active") === statusFilter;
    // Search filter (name, email, id)
    const q = searchQuery.trim().toLowerCase();
    const name = `${emp.firstName || ''} ${emp.lastName || ''}`.toLowerCase();
    const email = (emp.email || '').toLowerCase();
    const id = (emp.employeeId || emp.id || '').toLowerCase();
    const searchMatch = !q || name.includes(q) || email.includes(q) || id.includes(q);
    return statusMatch && searchMatch;
  });

  // Summary stats
  const totalEmployees = employees.length;
  const activeEmployees = employees.filter(emp => (emp.status || "Active") === "Active").length;
  const inactiveEmployees = employees.filter(emp => (emp.status || "Active") !== "Active").length;

  // Only return after all hooks
  if (!ci || !aid) return null;
  if (loading || empLoading) {
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
            notification.message === 'Employee deleted successfully!' ? (
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
      {/* Register Employee Modal */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh]">
            <button
              className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold"
              onClick={() => setShowRegisterModal(false)}
            >
              &#8592; Back
            </button>
            <RegisterEmployeeForm onSubmit={handleAddEmployee} />
          </div>
        </div>
      )}
      {/* Employee Detail Modal (View/Edit) */}
      {showEmployeeModal && selectedEmployee && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-2xl md:max-w-4xl mx-auto bg-gradient-to-br from-purple-50 via-white to-blue-50 rounded-2xl shadow-2xl p-10 overflow-y-auto max-h-[90vh] border border-purple-200 ring-1 ring-purple-100 text-[1.15rem] md:text-xl">
            {/* Colored top border accent */}
            <div className="absolute top-0 left-0 w-full h-2 rounded-t-2xl bg-gradient-to-r from-purple-500 via-pink-400 to-blue-400" />
            {/* Allow Employee To Edit Toggle */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-20">
              <span className="text-sm font-semibold text-gray-500">Allow Employee to Edit</span>
              <button
                onClick={async () => {
                  const newValue = !allowEmployeeToEdit;
                  setAllowEmployeeToEdit(newValue);
                  // Update in selectedEmployee state
                  setSelectedEmployee({ ...selectedEmployee, allowEmployeeToEdit: newValue });
                  // Persist to backend
                  await updateEmployee(selectedEmployee.id, { ...selectedEmployee, allowEmployeeToEdit: newValue });
                  setNotification({ show: true, message: `Allow Employee to Edit: ${newValue ? 'Enabled' : 'Disabled'}`, color: 'green' });
                  setTimeout(() => setNotification({ show: false, message: '', color: 'green' }), 1000);
                }}
                className={`w-10 h-6 rounded-full ${allowEmployeeToEdit ? 'bg-green-500' : 'bg-gray-300'} flex items-center transition-colors duration-300`}
                type="button"
              >
                <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${allowEmployeeToEdit ? 'translate-x-4' : ''}`}></span>
              </button>
            </div>
            {/* Back Button */}
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 hover:bg-purple-300 rounded text-purple-700 font-semibold text-lg md:text-xl z-20"
              onClick={() => { setShowEmployeeModal(false); setEditMode(false); }}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            {/* Profile Picture at the top (moved inside the border) */}
            <div className="flex flex-col items-center mb-10 mt-6 relative z-10">
              {selectedEmployee.photo ? (
                <img src={selectedEmployee.photo} alt="Profile" className="w-32 h-32 rounded-full object-cover border-4 border-purple-200 shadow-lg mb-2" />
              ) : (
                <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border-4 border-purple-200 shadow-lg mb-2">
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                </div>
              )}
              {/* Registration date below profile picture */}
              <div className="text-sm text-gray-500 text-center mt-2 bg-white/80 px-4 py-1 rounded-full shadow-sm border border-gray-200">
                Registered on: <span className="font-semibold text-gray-700">{formatTimestamp(selectedEmployee.dateRegistered)}</span>
              </div>
            </div>
            {/* Employee Details Section */}
            <div className="mb-10 bg-white/90 rounded-2xl p-7 border border-purple-100 shadow flex flex-col gap-6">
              <div className="flex items-center gap-2 mb-4">
                <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 11c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm0 2c-2.67 0-8 1.337-8 4v2h16v-2c0-2.663-5.33-4-8-4z" /></svg>
                <h2 className="text-2xl md:text-3xl font-bold text-purple-400 tracking-tight">Employee Details</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div><span className="text-xs text-purple-400 font-bold uppercase">Employee ID</span><br/>
                  <span className="text-xl md:text-2xl text-gray-800 flex items-center gap-2 font-bold">
                    {selectedEmployee.employeeId || selectedEmployee.id || '-'}
                    {(selectedEmployee.employeeId || selectedEmployee.id) && (
                      <button
                        type="button"
                        className="ml-1 px-2 py-1 bg-gray-200 hover:bg-purple-200 rounded text-xs text-gray-700 flex items-center gap-1"
                        title="Copy Employee ID"
                        onClick={() => {
                          handleCopyEmployeeId(selectedEmployee.employeeId || selectedEmployee.id);
                        }}
                      >
                        {copiedEmployeeId === (selectedEmployee.employeeId || selectedEmployee.id) ? (
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
                <div><span className="text-xs text-purple-400 font-bold uppercase">Name</span><br/><span className="text-xl md:text-2xl text-gray-800 font-semibold">{selectedEmployee.firstName} {selectedEmployee.lastName}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Email</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.email}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Phone</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.phone}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">DOB</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.dob}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Gender</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.gender}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Department</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.department}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Role</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.role}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Status</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.status || 'Active'}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Date Joined</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.dateJoined}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Address</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.address}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">City</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.city}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">State</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.state}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Country</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.country}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">ZIP Code</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.zip}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Company</span><br/><span className="text-lg md:text-xl text-gray-800">{selectedEmployee.company}</span></div>
              </div>
            </div>
            <div className="my-8 border-t border-purple-100" />
            {/* Custom Q&A Section */}
            <div className="mb-10">
              <div className="flex items-center gap-2 mb-3">
                <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v-1.5A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v1.5m9 0v8.25A2.25 2.25 0 0114.25 18H9.75A2.25 2.25 0 017.5 16.5V8.25m9 0H7.5" /></svg>
                <h3 className="text-xl md:text-2xl font-bold text-blue-400 tracking-tight">Custom Q&A</h3>
              </div>
              {(selectedEmployee.customQA || []).length === 0 && <div className="text-base text-gray-400">No custom questions.</div>}
              <div className="space-y-4">
                {(selectedEmployee.customQA || []).map((qa, idx) => (
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
              {(selectedEmployee.documents || []).length === 0 && <div className="text-base text-gray-400">No documents uploaded.</div>}
              <ul className="list-disc pl-6">
                {(selectedEmployee.documents || []).map((doc, idx) => (
                  <li key={idx} className="mb-2">
                    <a href={doc.data} download={doc.name} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-lg md:text-xl">{doc.name}</a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Status Pills, Edit Form, etc. remain unchanged */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-purple-700">Employee Details</h2>
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
                const { id, sNo, ...updateData } = selectedEmployee;
                await updateEmployee(selectedEmployee.id, updateData);
                setShowEmployeeModal(false);
                setEditMode(false);
                setNotification({ show: true, message: "Employee updated successfully!", color: "green" });
                setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 2000);
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">First Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.firstName || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, firstName: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Last Name</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.lastName || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, lastName: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <input type="email" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.email || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, email: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.phone || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, phone: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Department</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.department || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, department: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Role</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.role || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, role: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date Joined</label>
                  <input type="date" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.dateJoined || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, dateJoined: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.address || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, address: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">City</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.city || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, city: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">State</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.state || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, state: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Country</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.country || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, country: e.target.value })} required disabled={!editMode} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">ZIP Code</label>
                  <input type="text" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black" value={selectedEmployee.zip || ''} onChange={e => setSelectedEmployee({ ...selectedEmployee, zip: e.target.value })} required disabled={!editMode} />
                </div>
              </div>
              {/* Documents Section */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Documents</label>
                {(selectedEmployee.documents || []).length === 0 && <div className="text-xs text-gray-400">No documents uploaded.</div>}
                <ul className="list-disc pl-5">
                  {(selectedEmployee.documents || []).map((doc, idx) => (
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
                        className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors duration-200 ${selectedEmployee.status === option ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'} cursor-pointer`}
                        style={{ minWidth: 0, height: '28px', fontSize: '0.85rem' }}
                        onClick={() => setSelectedEmployee({ ...selectedEmployee, status: option })}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="mt-2 mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold ${selectedEmployee.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>{selectedEmployee.status || 'Active'}</span>
                </div>
              )}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Custom Q&A</label>
                {(selectedEmployee.customQA || []).map((qa, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                    <input type="text" placeholder="Question" value={qa.question} onChange={e => { if (!editMode) return; const updatedQA = [...selectedEmployee.customQA]; updatedQA[idx].question = e.target.value; setSelectedEmployee({ ...selectedEmployee, customQA: updatedQA }); }} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" disabled={!editMode} />
                    <input type="text" placeholder="Answer" value={qa.answer} onChange={e => { if (!editMode) return; const updatedQA = [...selectedEmployee.customQA]; updatedQA[idx].answer = e.target.value; setSelectedEmployee({ ...selectedEmployee, customQA: updatedQA }); }} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" disabled={!editMode} />
                  </div>
                ))}
                {editMode && (
                  <button type="button" onClick={() => setSelectedEmployee({ ...selectedEmployee, customQA: [...(selectedEmployee.customQA || []), { question: '', answer: '' }] })} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
                )}
              </div>
              {editMode && (
                <div className="flex gap-2 mt-6 justify-end">
                  <button type="button" className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg px-4 py-2 transition-colors duration-200" onClick={() => { setShowEmployeeModal(false); setEditMode(false); }}>Cancel</button>
                  <button type="submit" className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200">Save Changes</button>
                </div>
              )}
            </form>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this employee? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold" onClick={() => { setShowDeleteConfirm(false); setDeleteEmpId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => handleDeleteEmployee(deleteEmpId)}>Delete</button>
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
              <h1 className="text-3xl text-[#7c3aed] font-bold">
                Employee Management
              </h1>
              <p className="text-gray-500 mb-6">
                Track and manage your company employees
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
                    <div className="text-gray-500 text-sm">Total Employees</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {totalEmployees}
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
                      {activeEmployees}
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
                      {inactiveEmployees}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search, Filter, and Generate Button */}
              <div className="flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search employees by name, email, or ID..."
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
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
                  onClick={() => router.push(`/register-employee?cid=${ci}`)}
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
                  Register Employee
                </button>
              </div>

              {/* Employee Table */}
              <div className="bg-white rounded-xl shadow overflow-x-auto">
                {/* Desktop Table */}
                <table className="min-w-full divide-y divide-gray-200 hidden sm:table">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S. No.</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date Joined</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="text-center py-6 text-gray-400">No employees found.</td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp, idx) => (
                        <tr key={emp.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleViewEmployee(emp)}>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{emp.sNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {emp.photo ? (
                              <img src={emp.photo} alt="Profile" className="w-9 h-9 rounded-full object-cover border" />
                            ) : (
                              <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-semibold text-blue-700 cursor-pointer group relative"
                              onClick={e => { e.stopPropagation(); handleCopyEmployeeId(emp.employeeId || emp.id); }}
                              title="Click to copy Employee ID"
                          >
                            {emp.employeeId || emp.id}
                            <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Copy</span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500"><div className="font-bold">{emp.firstName} {emp.lastName}</div></td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{emp.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{emp.role}</td>
                          <td className="px-6 py-4 whitespace-nowrap">{emp.status === "Active" ? (<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>) : (<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{emp.status || 'Inactive'}</span>)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-500">{emp.dateJoined}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
                            <button className="text-purple-500 hover:text-purple-700" title="Edit Employee" onClick={() => handleEditEmployee(emp)}>
                              <Pen className="w-5 h-5" />
                            </button>
                            <button className="text-red-500 hover:text-red-700" title="Delete Employee" onClick={() => { setDeleteEmpId(emp.id); setShowDeleteConfirm(true); }}>
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
                  {filteredEmployees.length === 0 ? (
                    <div className="text-center text-gray-400 py-6">No employees found.</div>
                  ) : (
                    filteredEmployees.map((emp, idx) => (
                      <div key={emp.id} className="border-b border-gray-200 px-4 py-4 flex flex-col gap-2 cursor-pointer hover:bg-gray-50" onClick={() => handleViewEmployee(emp)}>
                        <div className="flex justify-between items-center">
                          <span className="font-semibold text-blue-700 flex items-center gap-2">
                            {emp.sNo}.
                            {emp.photo ? (
                              <img src={emp.photo} alt="Profile" className="w-8 h-8 rounded-full object-cover border" />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 border">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.121 17.804A13.937 13.937 0 0112 15c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                              </div>
                            )}
                            <span
                              className="cursor-pointer underline text-blue-700 relative group"
                              onClick={e => { e.stopPropagation(); handleCopyEmployeeId(emp.employeeId || emp.id); }}
                              title="Click to copy Employee ID"
                            >
                              {emp.employeeId || emp.id}
                              <span className="absolute left-1/2 -translate-x-1/2 top-full mt-1 text-xs text-green-600 bg-white px-2 py-1 rounded shadow opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">Copy</span>
                            </span>
                          </span>
                          <div className="flex gap-3 self-end" onClick={e => e.stopPropagation()}>
                            <button className="text-purple-500 hover:text-purple-700" title="Edit Employee" onClick={() => handleEditEmployee(emp)}><Pen className="w-5 h-5" /></button>
                            <button className="text-red-500 hover:text-red-700" title="Delete Employee" onClick={() => { setDeleteEmpId(emp.id); setShowDeleteConfirm(true); }}><Trash2 className="w-5 h-5" /></button>
                          </div>
                        </div>
                        <div className="text-gray-500"><span className="font-semibold">Name: </span>{emp.firstName} {emp.lastName}</div>
                        <div className="text-gray-500"><span className="font-semibold">Email: </span>{emp.email}</div>
                        <div className="text-gray-500"><span className="font-semibold">Role: </span>{emp.role}</div>
                        <div>{emp.status === "Active" ? (<span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">Active</span>) : (<span className="bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">{emp.status || 'Inactive'}</span>)}</div>
                        <div className="text-gray-500"><span className="font-semibold">Date Joined: </span>{emp.dateJoined}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function Employees() {
  return (
    <SidebarProvider>
      <EmployeesContent />
    </SidebarProvider>
  );
}
