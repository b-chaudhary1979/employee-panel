import React, { useState, useRef, useEffect, useMemo } from "react";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";

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

export default function AssignTasksPage() {
  const { isOpen } = useSidebar();
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);
  const { user, loading: userLoading } = useUserInfo();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef(null);
  const [assigneeType, setAssigneeType] = useState("intern"); // intern or employee
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green",
  });
  const [internOptions, setInternOptions] = useState([]); // fetched list
  const [selectedInternIds, setSelectedInternIds] = useState([]); // chosen interns
  const [showInternDropdown, setShowInternDropdown] = useState(false); // dropdown visibility
  const [isSubmitting, setIsSubmitting] = useState(false); // loading state for form submission

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    assigneeName: "",
    assigneeEmail: "",
    department: "",
    dueDate: "",
    priority: "Medium",
    mentorName: "",
    description: "",
    requirements: [""],
    links: [""],
    evaluationCriteria: [""],
    mentorFeedback: "",
    message: "",
    employeeIds: [""],
  });

  // Handle mobile sidebar
  const handleMobileSidebarToggle = () => {
    setMobileSidebarOpen(!mobileSidebarOpen);
  };

  const handleMobileSidebarClose = () => {
    setMobileSidebarOpen(false);
  };

  // Get content margin based on sidebar state
  const getContentMarginLeft = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) {
      return 0;
    }
    return isOpen ? 270 : 64;
  };

  // Redirect if no token/credentials
  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  // Update header height on resize
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };

    window.addEventListener("resize", updateHeaderHeight);
    updateHeaderHeight();

    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showInternDropdown && !event.target.closest('.intern-dropdown')) {
        setShowInternDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showInternDropdown]);
  
  /* Fetch interns once companyId is available */
  useEffect(() => {
    const fetchInterns = async () => {
      console.log("Fetching interns for companyId:", ci);
      if (!ci) {
        console.log("No companyId available, skipping fetch");
        return;
      }
      try {
        const response = await fetch('/api/interns/fetchInterns', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ companyId: ci }),
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log("API response:", data);
        
        const opts = (data.interns || []).map((intern) => {
          console.log("Intern data:", intern);
          return { 
            id: intern.id, 
            name: `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || "Unnamed" 
          };
        });
        console.log("Processed intern options:", opts);
        setInternOptions(opts);
      } catch (error) {
        console.error("Error fetching interns:", error);
      }
    };
    fetchInterns();
  }, [ci]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  // Handle array field changes (requirements, links, evaluation criteria)
  const handleArrayFieldChange = (field, index, value) => {
    const updatedArray = [...formData[field]];
    updatedArray[index] = value;
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  // Add new item to array fields
  const addArrayItem = (field) => {
    setFormData({
      ...formData,
      [field]: [...formData[field], ""],
    });
  };

  // Remove item from array fields
  const removeArrayItem = (field, index) => {
    const updatedArray = [...formData[field]];
    updatedArray.splice(index, 1);
    setFormData({
      ...formData,
      [field]: updatedArray,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Set loading state
    setIsSubmitting(true);
    
    // Validate required fields
    if (assigneeType === "intern" && selectedInternIds.length === 0) {
      setNotification({
        show: true,
        message: "Please select at least one intern",
        color: "red",
      });
      setIsSubmitting(false);
      return;
    }

    const assignmentData = {
      ...formData,
      assignedAt: new Date().toISOString(),
      assigneeType: assigneeType,
      employeeId: aid, // <-- automatically include assigning employee ID
      employeeName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown Employee", // <-- and name
      assignedByRole: user?.role || "Employee"
    };

    try {
      // Call the new API endpoint for all three databases
      const response = await fetch('/api/AssignedTasks/createAssignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: ci,
          assignmentData,
          selectedInternIds,
          assigneeType
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create assignment');
      }

      const result = await response.json();
      
      setNotification({
        show: true,
        message: result.message || "Assignment created successfully!",
        color: "green",
      });

      // Reset form after successful submission
      setFormData({
        title: "",
        assigneeName: "",
        assigneeEmail: "",
        department: "",
        dueDate: "",
        priority: "Medium",
        mentorName: "",
        description: "",
        requirements: [""],
        links: [""],
        evaluationCriteria: [""],
        mentorFeedback: "",
        message: "",
        employeeIds: [""],
      });
      
      // Reset selected interns
      setSelectedInternIds([]);

    } catch (err) {
      setNotification({
        show: true,
        message: "Error: " + err.message,
        color: "red",
      });
    } finally {
      // Reset loading state
      setIsSubmitting(false);
    }

    // Hide notification after 5 seconds
    setTimeout(() => {
      setNotification({ show: false, message: "", color: "green" });
    }, 5000);
  };

  // Debug loading state
  console.log("Loading state:", { userLoading, user: !!user, ci: !!ci, aid });
  
  // Temporarily allow rendering without user to debug
  if (!ci) {
    console.log("Showing loader because: no ci");
    return <Loader />;
  }
  
  // If user is still loading, show a simpler loading state
  if (userLoading) {
    console.log("User is still loading, showing simple loader");
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-white font-medium flex items-center gap-3 animate-fade-in ${notification.color === "green" ? "bg-green-500" : "bg-red-500"}`}
          style={{
            animation: "fadeIn 0.3s ease-out",
          }}
        >
          {notification.color === "green" ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="8" x2="12" y2="12"></line>
              <line x1="12" y1="16" x2="12.01" y2="16"></line>
            </svg>
          )}
          {notification.message}
        </div>
      )}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
      {/* Sidebar for desktop */}
      <div
        className="hidden sm:block fixed top-0 left-0 h-full z-40"
        style={{ width: 270 }}
      >
                 <SideMenu
           username={
             user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Employee"
           }
         />
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
                     <SideMenu
             mobileOverlay={true}
             username={
               user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Employee"
             }
           />
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
                     username={
             user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Employee"
           }
           companyName={user ? (user.company || user.department) : "Department"}
        />
        <main
          className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
          style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
        >
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl text-[#7c3aed] font-bold">
                  Task Assignment Portal
                </h1>
                <p className="text-gray-500 mb-6">
                  Create and manage assignments for your team members
                </p>
              </div>
              <div className="flex items-center gap-2 bg-purple-100 px-4 py-2 rounded-lg">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#7c3aed"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
                <span className="text-purple-700 font-medium">
                  Active Assignments: 0
                </span>
              </div>
            </div>

            {/* Main Form */}
            <div className="bg-white rounded-xl shadow-md p-6 mb-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#7c3aed"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <rect
                        x="3"
                        y="4"
                        width="18"
                        height="18"
                        rx="2"
                        ry="2"
                      ></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                      <path d="M9 16l2 2 4-4"></path>
                    </svg>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Create New Assignment
                  </h2>
                </div>
                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 rounded flex items-start gap-3">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#3b82f6"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mt-0.5"
                  >
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <p className="text-sm text-blue-700">
                    <span className="font-bold">Expiration Notice:</span> This
                    assignment will automatically expire and be removed from the{" "}
                    {assigneeType}'s view after 24 hours from creation.
                  </p>
                </div>

                {/* Toggle between Intern and Employee */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Assignee Type
                  </label>
                  <div className="flex space-x-4 bg-gray-100 p-1 rounded-lg w-fit">
                    <button
                      type="button"
                      onClick={() => setAssigneeType("intern")}
                      className={`px-6 py-2.5 rounded-md flex items-center gap-2 transition-all ${assigneeType === "intern" ? "bg-white text-purple-700 shadow-sm font-medium" : "bg-transparent text-gray-600 hover:bg-gray-200"}`}
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke={
                          assigneeType === "intern" ? "#7c3aed" : "#4b5563"
                        }
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                        <path d="M12 11v4"></path>
                        <path d="M12 15h4"></path>
                      </svg>
                      Intern
                    </button>
                                         {/* Only show Employee button for allowed roles */}
                     {user && ["HR", "Manager", "Team Lead"].includes(user.role) && (
                      <button
                        type="button"
                        onClick={() => setAssigneeType("employee")}
                        className={`px-6 py-2.5 rounded-md flex items-center gap-2 transition-all ${assigneeType === "employee" ? "bg-white text-purple-700 shadow-sm font-medium" : "bg-transparent text-gray-600 hover:bg-gray-200"}`}
                      >
                        <svg
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke={
                            assigneeType === "employee" ? "#7c3aed" : "#4b5563"
                          }
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                          <circle cx="12" cy="7" r="4"></circle>
                          <path d="M16 15v-1a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v1"></path>
                          <path d="M8 11h8"></path>
                        </svg>
                        Employee
                      </button>
                    )}
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-8 mt-6">
                  {/* Basic Information Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      Basic Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Assignment Title */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Assignment Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                          placeholder="Enter assignment title"
                          required
                        />
                      </div>

                      {/* Assignee Name - only for employees */}
                      {assigneeType === "employee" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee Name
                          </label>
                          <input
                            type="text"
                            name="assigneeName"
                            value={formData.assigneeName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                            placeholder="Enter employee name"
                            required
                          />
                        </div>
                      )}

                      {/* Intern Multi-select or Employee ID(s) */}
                      {assigneeType === "intern" ? (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Select Intern(s)
                          </label>
                          {/* Dropdown with checkboxes */}
                          <div className="relative intern-dropdown">
                            <div 
                              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white cursor-pointer flex justify-between items-center"
                              onClick={() => setShowInternDropdown(!showInternDropdown)}
                            >
                              <span className={selectedInternIds.length > 0 ? "text-gray-900 font-medium" : "text-gray-500"}>
                                {selectedInternIds.length > 0 
                                  ? `${selectedInternIds.length} ${selectedInternIds.length === 1 ? "intern" : "interns"} selected`
                                  : "Select an intern..."
                                }
                              </span>
                              <svg 
                                className={`w-4 h-4 transition-transform ${showInternDropdown ? "rotate-180" : ""}`}
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                            
                                                         {/* Dropdown list */}
                             {showInternDropdown && (
                               <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
                                 {console.log("Rendering dropdown with internOptions:", internOptions)}
                                 {internOptions.length > 0 ? (
                                  internOptions.map((intern) => (
                                    <label 
                                      key={intern.id} 
                                      className="flex items-center px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                                    >
                                      <input
                                        type="checkbox"
                                        value={intern.id}
                                        checked={selectedInternIds.includes(intern.id)}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            setSelectedInternIds([...selectedInternIds, intern.id]);
                                          } else {
                                            setSelectedInternIds(selectedInternIds.filter((id) => id !== intern.id));
                                          }
                                        }}
                                        className="mr-3 accent-purple-600"
                                      />
                                      <div className="flex flex-col">
                                        <span className="text-sm font-medium text-gray-900">{intern.name}</span>
                                        <span className="text-xs text-gray-500">{intern.id}</span>
                                      </div>
                                    </label>
                                  ))
                                ) : (
                                  <div className="px-3 py-2 text-sm text-gray-500">
                                    No interns available
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                          
                          {/* Selected interns display */}
                          {selectedInternIds.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                              {selectedInternIds.map((internId) => {
                                const intern = internOptions.find(i => i.id === internId);
                                return (
                                  <span 
                                    key={internId}
                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800"
                                  >
                                    {intern?.name || internId}
                                    <button
                                      type="button"
                                      onClick={() => setSelectedInternIds(selectedInternIds.filter(id => id !== internId))}
                                      className="ml-1 text-purple-600 hover:text-purple-800"
                                    >
                                      ×
                                    </button>
                                  </span>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Employee ID(s)
                          </label>
                          <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                            {formData.employeeIds.map((id, idx) => (
                              <div key={idx} className="flex mb-2">
                                <input
                                  type="text"
                                  value={id}
                                  onChange={(e) => {
                                    const updated = [...formData.employeeIds];
                                    updated[idx] = e.target.value;
                                    setFormData({
                                      ...formData,
                                      employeeIds: updated,
                                    });
                                  }}
                                  className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                  placeholder={`Employee ID ${idx + 1}`}
                                  required
                                />
                                {formData.employeeIds.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...formData.employeeIds];
                                      updated.splice(idx, 1);
                                      setFormData({
                                        ...formData,
                                        employeeIds: updated,
                                      });
                                    }}
                                    className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  employeeIds: [...formData.employeeIds, ""],
                                })
                              }
                              className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                ></path>
                              </svg>
                              Add Employee ID
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Department */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white text-gray-900"
                          required
                        >
                          <option value="" className="text-gray-500">Select Department</option>
                          <option value="Software Development" className="text-gray-900">
                            Software Development
                          </option>
                          <option value="SEO" className="text-gray-900">SEO</option>
                          <option value="UI/UX Design" className="text-gray-900">UI/UX Design</option>
                          <option value="Content Writing" className="text-gray-900">
                            Content Writing
                          </option>
                          <option value="Social Media Management" className="text-gray-900">
                            Social Media Management (SMM)
                          </option>
                        </select>
                      </div>

                      {/* Due Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Due Date <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="date"
                          name="dueDate"
                          value={formData.dueDate}
                          onChange={handleChange}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900"
                          required
                        />
                      </div>

                      {/* Priority */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Priority
                        </label>
                        <div className="flex space-x-2">
                          {["Low", "Medium", "High"].map((priority) => {
                            const priorityColors = {
                              Low: {
                                bg: "bg-green-100",
                                text: "text-green-700",
                                active: "bg-green-500",
                              },
                              Medium: {
                                bg: "bg-yellow-100",
                                text: "text-yellow-700",
                                active: "bg-yellow-500",
                              },
                              High: {
                                bg: "bg-red-100",
                                text: "text-red-700",
                                active: "bg-red-500",
                              },
                            };

                            return (
                              <label
                                key={priority}
                                className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md cursor-pointer transition-all ${formData.priority === priority ? `${priorityColors[priority].active} text-white` : `${priorityColors[priority].bg} ${priorityColors[priority].text} hover:bg-opacity-80`}`}
                              >
                                <input
                                  type="radio"
                                  name="priority"
                                  value={priority}
                                  checked={formData.priority === priority}
                                  onChange={handleChange}
                                  className="sr-only"
                                />
                                <div className="flex items-center gap-2">
                                  {priority === "Low" && (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <path d="M8 14s1.5 2 4 2 4-2 4-2"></path>
                                      <line
                                        x1="9"
                                        y1="9"
                                        x2="9.01"
                                        y2="9"
                                      ></line>
                                      <line
                                        x1="15"
                                        y1="9"
                                        x2="15.01"
                                        y2="9"
                                      ></line>
                                    </svg>
                                  )}
                                  {priority === "Medium" && (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <line
                                        x1="8"
                                        y1="12"
                                        x2="16"
                                        y2="12"
                                      ></line>
                                      <line
                                        x1="9"
                                        y1="9"
                                        x2="9.01"
                                        y2="9"
                                      ></line>
                                      <line
                                        x1="15"
                                        y1="9"
                                        x2="15.01"
                                        y2="9"
                                      ></line>
                                    </svg>
                                  )}
                                  {priority === "High" && (
                                    <svg
                                      width="16"
                                      height="16"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    >
                                      <circle cx="12" cy="12" r="10"></circle>
                                      <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
                                      <line
                                        x1="9"
                                        y1="9"
                                        x2="9.01"
                                        y2="9"
                                      ></line>
                                      <line
                                        x1="15"
                                        y1="9"
                                        x2="15.01"
                                        y2="9"
                                      ></line>
                                    </svg>
                                  )}
                                  <span className="font-medium">
                                    {priority}
                                  </span>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>

                      {/* Mentor Name - Only show for interns */}
                      {assigneeType === "intern" && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Mentor Name
                          </label>
                          <input
                            type="text"
                            name="mentorName"
                            value={formData.mentorName}
                            onChange={handleChange}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                            placeholder="Enter mentor name"
                            required
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Task Details Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        ></path>
                      </svg>
                      Task Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Description */}
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows="4"
                          placeholder="Provide a detailed description of the task..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                          required
                        ></textarea>
                      </div>

                      {/* Requirements */}
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                            ></path>
                          </svg>
                          Requirements
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          {formData.requirements.map((req, index) => (
                            <div key={`req-${index}`} className="flex mb-2">
                              <input
                                type="text"
                                value={req}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "requirements",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                placeholder={`Requirement ${index + 1}`}
                              />
                              {formData.requirements.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem("requirements", index)
                                  }
                                  className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayItem("requirements")}
                            className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              ></path>
                            </svg>
                            Add Requirement
                          </button>
                        </div>
                      </div>

                      {/* links */}
                      <div className="col-span-2">
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            ></path>
                          </svg>
                          links
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          {formData.links.map((resource, index) => (
                            <div
                              key={`resource-${index}`}
                              className="flex mb-2"
                            >
                              <input
                                type="text"
                                value={resource}
                                onChange={(e) =>
                                  handleArrayFieldChange(
                                    "links",
                                    index,
                                    e.target.value
                                  )
                                }
                                className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                placeholder={`Resource ${index + 1} (URL or reference)`}
                              />
                              {formData.links.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeArrayItem("links", index)
                                  }
                                  className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                >
                                  Remove
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addArrayItem("links")}
                            className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              ></path>
                            </svg>
                            Add Link
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Evaluation Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      Evaluation & Feedback
                    </h3>
                    <div className="space-y-6">
                      {/* Evaluation Criteria */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                            ></path>
                          </svg>
                          Evaluation Criteria
                        </label>
                        <div className="bg-gray-50 p-3 rounded-md border border-gray-200">
                          {formData.evaluationCriteria.map(
                            (criteria, index) => (
                              <div
                                key={`criteria-${index}`}
                                className="flex mb-2"
                              >
                                <input
                                  type="text"
                                  value={criteria}
                                  onChange={(e) =>
                                    handleArrayFieldChange(
                                      "evaluationCriteria",
                                      index,
                                      e.target.value
                                    )
                                  }
                                  className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                                  placeholder={`Criteria ${index + 1}`}
                                />
                                {formData.evaluationCriteria.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      removeArrayItem(
                                        "evaluationCriteria",
                                        index
                                      )
                                    }
                                    className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                  >
                                    Remove
                                  </button>
                                )}
                              </div>
                            )
                          )}
                          <button
                            type="button"
                            onClick={() => addArrayItem("evaluationCriteria")}
                            className="mt-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 flex items-center gap-2"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              ></path>
                            </svg>
                            Add Criteria
                          </button>
                        </div>
                      </div>

                      {/* Mentor Feedback - Only show for interns */}
                      {assigneeType === "intern" && (
                        <div>
                          <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                            <svg
                              className="w-4 h-4 mr-1 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                              ></path>
                            </svg>
                            Mentor Feedback
                          </label>
                          <textarea
                            name="mentorFeedback"
                            value={formData.mentorFeedback}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Provide feedback guidelines for the mentor..."
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                          ></textarea>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Communication Section */}
                  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
                    <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                      <svg
                        className="w-5 h-5 mr-2 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        ></path>
                      </svg>
                      Communication
                    </h3>
                    <div className="space-y-6">
                      {/* Message to Assignee */}
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-1 flex items-center">
                          <svg
                            className="w-4 h-4 mr-1 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 012 2z"
                            ></path>
                          </svg>
                          Message to{" "}
                          {assigneeType === "intern" ? "Intern" : "Employee"}
                        </label>
                        <textarea
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          rows="3"
                          placeholder="Add a personal message or instructions for the assignee..."
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 placeholder-gray-500"
                        ></textarea>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-8 flex flex-col sm:flex-row gap-4">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`flex-1 sm:flex-none text-white font-bold py-3 px-8 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-purple-400 cursor-not-allowed' 
                          : 'bg-purple-600 hover:bg-purple-700'
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                            <polyline points="17 21 17 13 7 13 7 21"></polyline>
                            <polyline points="7 3 7 8 15 8"></polyline>
                          </svg>
                          Create Assignment
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => {
                        setFormData({
                          title: "",
                          assigneeName: "",
                          assigneeEmail: "",
                          department: "",
                          dueDate: "",
                          priority: "Medium",
                          mentorName: "",
                          description: "",
                          requirements: [""],
                          links: [""],
                          evaluationCriteria: [""],
                          mentorFeedback: "",
                          message: "",
                          employeeIds: [""],
                        });
                      }}
                      className={`flex-1 sm:flex-none border border-gray-300 font-medium py-3 px-8 rounded-md transition-colors duration-200 flex items-center justify-center gap-2 ${
                        isSubmitting 
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                          : 'bg-white hover:bg-gray-50 text-gray-700'
                      }`}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                      Reset Form
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
