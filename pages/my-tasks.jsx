import React, { useEffect, useState, useRef, useMemo } from "react";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import { useRouter } from "next/router";
import Loader from "../loader/Loader";
import { collection, onSnapshot, query, orderBy } from "firebase/firestore";
import { db } from "../firebase";
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

export default function MyTasksPage() {
  const { isOpen } = useSidebar();
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);
  const { user, loading: userLoading } = useUserInfo();
  const [tasks, setTasks] = useState([]);
  const [fetching, setFetching] = useState(true);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [taskStatus, setTaskStatus] = useState('pending');
  const [submissionLinks, setSubmissionLinks] = useState(['']);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green",
  });
  const [unsubscribeFunctions, setUnsubscribeFunctions] = useState([]);

     const STATUS_OPTIONS = [
     {
       value: "pending",
       label: "Pending",
       color: "bg-yellow-100 text-yellow-700",
     },
     {
       value: "in-progress",
       label: "In Progress",
       color: "bg-blue-100 text-blue-700",
     },
     {
       value: "completed",
       label: "Completed",
       color: "bg-[#E6F9EC] text-[#27ae60]",
     },
   ];

        function statusClass(status) {
     const found = STATUS_OPTIONS.find((s) => s.value === status);
     return found
       ? `${found.color} font-semibold`
       : "bg-gray-100 text-gray-700 font-semibold";
   }

  function statusText(status) {
    const found = STATUS_OPTIONS.find((s) => s.value === status);
    return found ? found.label : status;
  }

  // Redirect if no token/credentials
  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  const setupRealTimeListeners = () => {
    // Use ci (companyId) from token and user.id (employeeId)
    if (!ci || !user?.id) {
      setFetching(false);
      return;
    }

    // Clear any existing listeners
    unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    setUnsubscribeFunctions([]);

    const unsubscribers = [];

    try {
      // Set up real-time listener for pending tasks
      const pendingTasksQuery = query(
        collection(db, "users", ci, "employees", user.id, "tasks", "task-data", "pending_tasks"),
        orderBy("assignedAt", "desc")
      );

      const pendingUnsubscribe = onSnapshot(pendingTasksQuery, (snapshot) => {
        const pendingTasks = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          status: d.data().status || 'pending'
        }));

        // Update tasks with real-time data
        setTasks(currentTasks => {
          const completedTasks = currentTasks.filter(task => task.status === 'completed');
          return [...pendingTasks, ...completedTasks];
        });
      }, (error) => {
        console.error("Error listening to pending tasks:", error);
      });

      unsubscribers.push(pendingUnsubscribe);

      // Set up real-time listener for completed tasks
      const completedTasksQuery = query(
        collection(db, "users", ci, "employees", user.id, "tasks", "task-data", "completed_tasks"),
        orderBy("assignedAt", "desc")
      );

      const completedUnsubscribe = onSnapshot(completedTasksQuery, (snapshot) => {
        const completedTasks = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
          status: d.data().status || 'completed'
        }));

        // Update tasks with real-time data
        setTasks(currentTasks => {
          const pendingTasks = currentTasks.filter(task => task.status === 'pending');
          return [...pendingTasks, ...completedTasks];
        });
      }, (error) => {
        console.error("Error listening to completed tasks:", error);
      });

      unsubscribers.push(completedUnsubscribe);

      setUnsubscribeFunctions(unsubscribers);
      setFetching(false);

    } catch (error) {
      console.error("Error setting up real-time listeners:", error);
      setTasks([]);
      setFetching(false);
    }
  };

  /* Set up real-time listeners for tasks */
  useEffect(() => {
    setupRealTimeListeners();
  }, [ci, user?.id]);

  /* Cleanup listeners on unmount */
  useEffect(() => {
    return () => {
      unsubscribeFunctions.forEach(unsubscribe => unsubscribe());
    };
  }, [unsubscribeFunctions]);

  // Update header height on resize
  useEffect(() => {
    const resize = () => setHeaderHeight(headerRef.current?.offsetHeight || 72);
    window.addEventListener("resize", resize);
    resize();
    return () => window.removeEventListener("resize", resize);
  }, []);

  if (userLoading || !user || !ci || fetching) return <Loader />;

  const getContentMarginLeft = () => {
    if (typeof window !== "undefined" && window.innerWidth < 640) return 0;
    return isOpen ? 270 : 64;
  };

     const handleViewDetails = (task) => {
     setSelectedTask(task);
     setTaskStatus(task.status || 'pending');
     setSubmissionLinks(['']);
     setShowTaskModal(true);
   };

     const closeTaskModal = () => {
     setShowTaskModal(false);
     setSelectedTask(null);
     setTaskStatus('pending');
     setSubmissionLinks(['']);
   };

  const addSubmissionLink = () => {
    setSubmissionLinks([...submissionLinks, '']);
  };

  const updateSubmissionLink = (index, value) => {
    const newLinks = [...submissionLinks];
    newLinks[index] = value;
    setSubmissionLinks(newLinks);
  };

  const removeSubmissionLink = (index) => {
    if (submissionLinks.length > 1) {
      const newLinks = submissionLinks.filter((_, i) => i !== index);
      setSubmissionLinks(newLinks);
    }
  };

  const handleSubmitAssignment = () => {
    if (!selectedTask) {
      console.error('No task selected for submission');
      return;
    }

    // Prevent multiple submissions
    if (isSubmitting) {
      return;
    }

    // Filter out empty submission links
    const validSubmissionLinks = submissionLinks.filter(link => link.trim() !== '');
    
    if (validSubmissionLinks.length === 0) {
      showNotification('Please add at least one submission link before submitting.', 'red');
      return;
    }

    // Show confirmation modal instead of submitting directly
    setShowConfirmation(true);
  };

  const confirmSubmit = async () => {
    setIsSubmitting(true);
    
    try {
      // Filter out empty submission links
      const validSubmissionLinks = submissionLinks.filter(link => link.trim() !== '');
      
      if (validSubmissionLinks.length === 0) {
        showNotification('Please add at least one submission link before submitting.', 'red');
        setShowConfirmation(false);
        setIsSubmitting(false);
        return;
      }

      console.log('Submitting assignment with links:', validSubmissionLinks);

      const response = await fetch('/api/submitEmployeeTask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyId: ci,
          employeeId: user.id,
          taskId: selectedTask.id,
          taskData: {
            taskName: selectedTask.title || selectedTask.taskName,
            description: selectedTask.description,
            assignedAt: selectedTask.assignedAt,
            assignedBy: selectedTask.assignedBy,
            priority: selectedTask.priority,
            dueDate: selectedTask.dueDate,
            links: selectedTask.links || [],
            status: selectedTask.status
          },
          submissionLinks: validSubmissionLinks,
          submittedAt: new Date().toISOString(),
          status: 'completed'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit task');
      }

      const result = await response.json();
      console.log('Task submitted successfully:', result);

      // Show success message
      showNotification('Task submitted successfully!', 'green');

      // Close all modals
      setShowConfirmation(false);
      closeTaskModal();

      // Tasks will automatically update via real-time listeners

    } catch (error) {
      console.error('Error submitting task:', error);
      showNotification(`Failed to submit task: ${error.message}`, 'red');
      setShowConfirmation(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelSubmit = () => {
    setShowConfirmation(false);
  };

  const showNotification = (message, color = "green") => {
    setNotification({
      show: true,
      message,
      color,
    });
    setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 1200);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };

  // Render links as clickable elements
  const renderLinks = (links) => {
    if (!links || !Array.isArray(links) || links.length === 0) {
      return <span className="text-gray-400">No links</span>;
    }

    return (
      <div className="flex flex-col gap-1">
        {links.map((link, index) => (
          <a
            key={index}
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 underline text-sm truncate"
          >
            Link {index + 1}
          </a>
        ))}
      </div>
    );
  };



  return (
    <>
      {/* Notification Popup */}
      {notification.show && (
        <div
          className={`fixed top-8 left-1/2 z-[9999] transform -translate-x-1/2 transition-all duration-500 ease-in-out ${
            notification.show ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`px-6 py-4 rounded-lg shadow-lg border-l-4 ${
              notification.color === "green"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  notification.color === "green" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
      <div className="min-h-screen bg-gray-50">
        <Header onHeight={(h) => setHeaderHeight(h)} ref={headerRef} />
        <SideMenu />

             <main
         className="p-6 transition-all duration-300"
         style={{ marginLeft: getContentMarginLeft(), marginTop: headerHeight }}
       >
                   <div className="flex items-center gap-3 mb-1">
                     <h1 className="text-3xl font-extrabold text-[#7c3aed] font-manrope">My Tasks</h1>
                     
                   </div>
                   <p className="text-gray-500 text-lg font-manrope">Track all your tasks, update statuses, and submit your work here. Data updates in real-time.</p>
                 {tasks.length === 0 ? (
                       <div className="text-center py-8">
              <p className="text-gray-500 text-lg font-manrope">No tasks found.</p>
            </div>
         ) : (
           <div className="bg-white shadow rounded-lg overflow-hidden">
             <div className="overflow-x-auto">
               <table className="w-full">
                                   <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">S.No</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Task</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Assigned By</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Links</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Due Date</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider font-manrope">Actions</th>
                    </tr>
                  </thead>
                 <tbody className="bg-white divide-y divide-gray-200">
                   {tasks.map((task, index) => (
                     <tr key={task.id} className="hover:bg-gray-50">
                                               <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-manrope">{index + 1}</td>
                        <td className="px-6 py-4">
                          <div>
                                                         <div className="text-sm font-medium text-gray-900 font-manrope">{task.title || task.taskName || "Untitled Task"}</div>
                            <div className="text-sm text-gray-500 font-manrope">{task.description}</div>
                          </div>
                        </td>
                                                 <td className="px-6 py-4 whitespace-nowrap">
                           <span className={`inline-flex px-2 py-1 text-xs rounded-full font-manrope ${statusClass(task.status)}`}>
                             {statusText(task.status)}
                           </span>
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-manrope">
                          {task.assignedBy || task.employeeName || 'Unknown'}
                        </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                           {task.links && Array.isArray(task.links) && task.links.length > 0 ? (
                             <div className="flex flex-col space-y-1">
                               {task.links.map((link, linkIndex) => (
                                 <a 
                                   key={linkIndex}
                                   href={link} 
                                   target="_blank" 
                                   rel="noopener noreferrer" 
                                   className="text-purple-600 hover:text-purple-900 text-xs font-manrope"
                                 >
                                   Link {linkIndex + 1}
                                 </a>
                               ))}
                             </div>
                           ) : (
                             <span className="text-gray-400 text-xs font-manrope">No links</span>
                           )}
                         </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-manrope">
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}
                        </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                           <button 
                             onClick={() => handleViewDetails(task)}
                             className="text-purple-600 hover:text-purple-900 font-manrope"
                           >
                             View Details
                           </button>
                         </td>
                     </tr>
                   ))}
                 </tbody>
               </table>
             </div>
           </div>
                   )}

                           {/* Assignment Details Modal */}
      {showTaskModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl p-0 relative overflow-hidden border border-gray-200 flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-[#e9f3ff] to-[#f7fafc]">
              <div>
                <h2 className="text-2xl font-bold text-[#28BD78] mb-1 font-manrope">
                  {selectedTask.title || selectedTask.taskName || "Untitled Task"}
                </h2>
                <div className="flex items-center gap-3">
                  <span
                    className={`inline-block px-4 py-1 rounded-full ${statusClass(taskStatus)} text-xs font-manrope`}
                  >
                    {statusText(taskStatus)}
                  </span>
                  <span className="text-gray-500 text-sm font-manrope">
                    Assigned:{" "}
                    <span className="font-semibold">{formatDate(selectedTask.assignedAt)}</span>
                  </span>
                </div>
              </div>
              
            </div>
            {/* Body with scroll */}
            <div className="flex-1 overflow-y-auto px-8 py-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[80vh]">
              {/* Left: Details */}
              <div>
                <div className="mb-6">
                  <div className="font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2 font-manrope">
                    <svg
                      className="w-5 h-5 text-[#28BD78]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 20h9" strokeLinecap="round" />
                      <path d="M16.5 3.5a5.5 5.5 0 11-7.78 7.78A5.5 5.5 0 0116.5 3.5z" />
                    </svg>
                    Description
                  </div>
                  <div className="text-gray-700 bg-[#F6F8FA] rounded-lg p-4 font-manrope">
                    {selectedTask.description || 'No description available'}
                  </div>
                </div>
                <div className="mb-6">
                  <div className="font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2 font-manrope">
                    <svg
                      className="w-5 h-5 text-[#28BD78]"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
                    </svg>
                    Task Details
                  </div>
                  <div className="text-gray-600 bg-[#F6F8FA] rounded-lg p-4 font-manrope">
                    <div className="space-y-2">
                      <div><strong>Assigned By:</strong> {selectedTask.assignedBy || 'Not specified'}</div>
                      <div><strong>Assigned At:</strong> {formatDate(selectedTask.assignedAt)}</div>
                      {selectedTask.movedAt && (
                        <div><strong>Moved At:</strong> {formatDate(selectedTask.movedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
                {selectedTask.links && selectedTask.links.length > 0 && (
                  <div className="mb-6">
                    <div className="font-semibold text-gray-700 mb-2 text-lg flex items-center gap-2 font-manrope">
                      <svg
                        className="w-5 h-5 text-[#28BD78]"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                      </svg>
                      Provided Links
                    </div>
                    <div className="text-gray-600 bg-[#F6F8FA] rounded-lg p-4">
                      <div className="space-y-2">
                        {selectedTask.links.map((link, index) => (
                          <div key={index}>
                            <a
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-800 underline break-all font-manrope"
                            >
                              Link {index + 1}
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                                 {/* Status Dropdown */}
                 <div className="mb-6">
                   <label className="block text-gray-700 font-medium mb-1 font-manrope">
                     Change Status:
                   </label>
                   <div className="relative">
                     <button
                       type="button"
                       className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 hover:bg-gray-100 transition text-base font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-[#28BD78] w-full font-manrope text-gray-900"
                       tabIndex={0}
                       onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                     >
                       <span
                         className={`w-3 h-3 rounded-full ${
                           STATUS_OPTIONS.find(
                             (s) => s.value === taskStatus
                           )?.color.split(' ')[0]
                         }`}
                       ></span>
                       {statusText(taskStatus)}
                       <svg
                         className="w-4 h-4 ml-1 text-gray-400"
                         fill="none"
                         stroke="currentColor"
                         strokeWidth="2"
                         viewBox="0 0 24 24"
                       >
                         <path d="M19 9l-7 7-7-7" />
                       </svg>
                     </button>
                                           {showStatusDropdown && (
                        <div className="absolute left-0 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                          {STATUS_OPTIONS.map((opt) => (
                            <button
                              key={opt.value}
                              type="button"
                              className={`flex items-center gap-2 w-full px-4 py-2 text-left text-base hover:bg-gray-100 transition font-manrope text-gray-900 ${
                                taskStatus === opt.value
                                  ? "font-bold"
                                  : ""
                              }`}
                              onClick={() => {
                                setTaskStatus(opt.value);
                                setShowStatusDropdown(false);
                              }}
                            >
                              <span
                                className={`w-3 h-3 rounded-full ${opt.color.split(' ')[0]} border border-gray-300`}
                              ></span>
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      )}
                   </div>
                 </div>
              </div>
              {/* Right: Assignment Submission */}
              <div>
                <div className="font-semibold mb-2 text-gray-700 text-lg font-manrope">
                  Submit Assignment Links:
                </div>
                {submissionLinks.map((link, idx) => (
                  <div key={idx} className="flex gap-2 mb-2">
                                         <input
                       type="url"
                       placeholder={`Submission Link ${idx + 1}`}
                       value={link}
                       onChange={(e) => updateSubmissionLink(idx, e.target.value)}
                       className="flex-1 px-3 py-2 border border-gray-300 rounded font-manrope text-gray-900"
                       required
                     />
                    {submissionLinks.length > 1 && (
                      <button
                        type="button"
                        className="px-2 text-red-500"
                        onClick={() => removeSubmissionLink(idx)}
                        title="Remove link"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="font-semibold mb-2 text-[#28BD78] font-manrope"
                  onClick={addSubmissionLink}
                >
                  + Add another link
                </button>
                <div className="flex gap-3 mt-2">
                                     <button
                     type="button"
                     onClick={handleSubmitAssignment}
                     disabled={isSubmitting || selectedTask?.status === 'completed'}
                     className={`flex-1 px-3 py-1.5 rounded text-sm font-medium transition flex items-center justify-center font-manrope ${
                       isSubmitting || selectedTask?.status === 'completed'
                         ? 'bg-gray-400 cursor-not-allowed' 
                         : 'bg-[#28BD78] hover:bg-green-600 text-white'
                     }`}
                   >
                     {isSubmitting ? 'Submitting...' : selectedTask?.status === 'completed' ? 'Already Submitted' : 'Submit Assignment'}
                   </button>
                  <button
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded text-sm font-medium hover:bg-gray-200 transition font-manrope"
                    onClick={closeTaskModal}
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
                 </div>
       )}

      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 relative flex flex-col items-center">
            <h3 className="text-xl font-bold mb-3 text-[#28BD78]">
              Submit Assignment?
            </h3>
            <p className="mb-6 text-gray-700 text-center">
              Are you sure you want to submit your assignment links? You won't
              be able to edit them after submission.
            </p>
            <div className="flex gap-4">
              <button
                disabled={isSubmitting}
                className={`px-5 py-2 rounded font-medium transition flex items-center justify-center ${
                  isSubmitting 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-[#28BD78] hover:bg-green-600'
                } text-white`}
                onClick={confirmSubmit}
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Yes, Submit'
                )}
              </button>
              <button
                disabled={isSubmitting}
                className={`px-5 py-2 rounded font-medium transition ${
                  isSubmitting 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
                onClick={cancelSubmit}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
                 </main>
       </div>
     </>
   );
 }