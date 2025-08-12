import React, { useState, useRef, useEffect, useMemo } from "react";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import AssignTaskModal from "../components/AssignTaskModal";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import Head from "next/head";
import { Pen, Trash2, Plus, CheckCircle, Clock, AlertCircle, Eye, Edit } from "lucide-react";
import useFetchAssignedTasks from "../hooks/useFetchAssignedTasks";

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
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [taskView, setTaskView] = useState('assigned'); // 'assigned' or 'submitted'
  
  // Fetch assigned tasks
  const { tasks: assignedTasks, loading: tasksLoading, error: tasksError, refetch: refetchTasks } = useFetchAssignedTasks(ci, aid);
  
  // Filter tasks based on search query and task view
  const filteredTasks = assignedTasks.filter(task => {
    // First filter by task view (assigned = pending, submitted = completed)
    if (taskView === 'assigned' && task.status !== 'pending') return false;
    if (taskView === 'submitted' && task.status !== 'completed') return false;
    
    // Then filter by search query
    if (!searchQuery.trim()) return true;
    
    const query = searchQuery.toLowerCase().trim();
    const internName = (task.internName || '').toLowerCase();
    const internEmail = (task.internEmail || '').toLowerCase();
    
    return internName.includes(query) || internEmail.includes(query);
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

  // Handle form submission from modal
  const handleAddTask = async (taskData) => {
    try {
      setIsSubmitting(true);
      
      const assignmentData = {
        title: taskData.taskName,
        description: taskData.description,
        department: taskData.category,
        dueDate: taskData.dueDate,
        priority: taskData.priority,
        links: taskData.links || [],
        assignedAt: new Date().toISOString(),
        employeeId: aid,
        employeeName: user ? `${user.firstName || ""} ${user.lastName || ""}`.trim() : "Unknown Employee",
        assignedByRole: "Employee"
      };

      // Determine selected intern IDs based on task data (intern-only)
      const selectedInternIds = taskData.internId ? [taskData.internId] : [];

      // Call the API endpoint for all three databases
      const response = await fetch('/api/AssignedTasks/createAssignment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: ci,
          assignmentData,
          selectedInternIds
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

      // Close modal and reset state
      setShowAddTaskModal(false);
      setSelectedTask(null);
      
      // Refetch tasks to show the new assignment
      await refetchTasks();

    } catch (err) {
      setNotification({
        show: true,
        message: "Error: " + err.message,
        color: "red",
      });
    } finally {
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
    <>
             <Head>
         <style>{`
           html,body{background-color:#fbf9f4 !important;}
           * { font-family: 'Manrope', sans-serif !important; }
         `}</style>
         <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200;300;400;500;600;700;800&display=swap" rel="stylesheet" />
       </Head>
      {notification.show && (
        <div className={`fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notification.color === 'green' ? 'bg-green-500' : 'bg-gradient-to-r from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
          {notification.color === 'green' && (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Assign Task Modal */}
      <AssignTaskModal
        key={selectedTask?.documentId || 'new-task'}
        open={showAddTaskModal}
        onClose={() => setShowAddTaskModal(false)}
        onAdd={handleAddTask}
        initialData={selectedTask}
        companyId={ci}
      />

      <div className="bg-[#fbf9f4] min-h-screen flex relative">
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
            <div className="max-w-6xl mx-auto">
              {/* Page Title and Subtitle */}
              <h1 className="text-3xl text-[#7c3aed] font-bold">
                Task Assignment
              </h1>
              <p className="text-gray-500 mb-6">
                Assign and manage tasks for employees and interns
              </p>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
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
                        d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      />
                    </svg>
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Total Tasks</div>
                    <div className="text-2xl text-gray-600 font-bold">{filteredTasks.length}</div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-yellow-100 p-3 rounded-full">
                    <Clock className="w-7 h-7 text-yellow-500" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Pending</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {filteredTasks.filter(task => task.status === 'pending').length}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-green-100 p-3 rounded-full">
                    <CheckCircle className="w-7 h-7 text-green-500" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Completed</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {filteredTasks.filter(task => task.status === 'completed').length}
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl shadow flex items-center gap-4 px-6 py-5">
                  <div className="bg-red-100 p-3 rounded-full">
                    <AlertCircle className="w-7 h-7 text-red-500" />
                  </div>
                  <div>
                    <div className="text-gray-500 text-sm">Overdue</div>
                    <div className="text-2xl text-gray-600 font-bold">
                      {filteredTasks.filter(task => {
                        if (task.status === 'completed' || !task.dueDate) return false;
                        return new Date(task.dueDate) < new Date();
                      }).length}
                    </div>
                  </div>
                </div>
              </div>

              {/* Search and Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                {/* Search Bar */}
                <div className="flex-1 max-w-2xl">
                  <div className="relative">
                                         <input
                       type="text"
                       placeholder="Search by name or email"
                       className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-500 placeholder-opacity-100 text-gray-900"
                       value={searchQuery}
                       onChange={(e) => setSearchQuery(e.target.value)}
                     />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                {/* Task View Toggle Buttons and Assign Task Button */}
                <div className="flex items-center gap-2">
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      taskView === 'assigned'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTaskView('assigned')}
                  >
                    Assigned Tasks
                  </button>
                  <button
                    className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
                      taskView === 'submitted'
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                    onClick={() => setTaskView('submitted')}
                  >
                    Submitted Tasks
                  </button>
                  
                  {/* Assign Task Button */}
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
                    onClick={() => {
                      setSelectedTask(null);
                      setShowAddTaskModal(true);
                    }}
                  >
                    <Plus className="w-5 h-5" />
                    Assign Task
                  </button>
                </div>
              </div>

              {/* Assigned Tasks Table */}
              <div className="bg-white rounded-xl shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-800">
                    {taskView === 'assigned' ? 'Assigned Tasks (Pending)' : 'Submitted Tasks (Completed)'}
                  </h3>
                  {tasksLoading && (
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                      </svg>
                      Loading...
                    </div>
                  )}
                </div>
                
                {tasksError && (
                  <div className="p-6 text-center text-red-500">
                    <p>Error loading tasks: {tasksError}</p>
                  </div>
                )}
                
                                 {!tasksLoading && !tasksError && filteredTasks.length === 0 && (
                   <div className="p-6 text-center text-gray-500">
                     <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                     </svg>
                     <p>
                       {searchQuery.trim() 
                         ? `No ${taskView === 'assigned' ? 'assigned' : 'submitted'} tasks found for "${searchQuery}".` 
                         : taskView === 'assigned' 
                           ? 'No pending tasks found. All tasks are either completed or not yet assigned.'
                           : 'No completed tasks found. Tasks will appear here once they are submitted.'
                       }
                     </p>
                   </div>
                 )}
                 
                 {!tasksLoading && !tasksError && filteredTasks.length > 0 && (
                   <div className="overflow-x-auto">
                     <table className="min-w-full divide-y divide-gray-200">
                       <thead className="bg-gray-50">
                         <tr>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             S. No.
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Name
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Email
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Role
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Assigned By
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Task Status
                           </th>
                           <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                             Actions
                           </th>
                         </tr>
                       </thead>
                       <tbody className="bg-white divide-y divide-gray-200">
                         {filteredTasks.map((task, index) => (
                           <tr key={task.id} className="hover:bg-gray-50">
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                               {index + 1}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                               {task.internName || `Intern ${task.internId}`}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {task.internEmail || `intern${task.internId}@company.com`}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                 Intern
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                               {task.assignedBy || 'Unknown'}
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap">
                               <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                 task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                 task.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                 'bg-gray-100 text-gray-800'
                               }`}>
                                 {task.status}
                               </span>
                             </td>
                             <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                               <div className="flex space-x-2">
                                 <button
                                   className="text-blue-600 hover:text-blue-900"
                                   onClick={() => {
                                     setSelectedTask(task);
                                     setShowAddTaskModal(true);
                                   }}
                                 >
                                   <Eye className="w-4 h-4" />
                                 </button>
                                 <button
                                   className="text-green-600 hover:text-green-900"
                                   onClick={() => {
                                     setSelectedTask(task);
                                     setShowAddTaskModal(true);
                                   }}
                                 >
                                   <Edit className="w-4 h-4" />
                                 </button>
                               </div>
                             </td>
                           </tr>
                         ))}
                       </tbody>
                     </table>
                   </div>
                 )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}
