import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef, useMemo } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import { Search, Filter, Plus, Package, Trash2 } from "lucide-react";
import Head from "next/head";
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

// Helper to generate unique id
const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

function NotesTasksContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = useMemo(() => decryptToken(token), [token]);
  // All hooks must be called before any conditional returns
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72); // Default to 72px (typical header height)
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTask, setNewTask] = useState({
    task: "",
    description: "",
    priority: "Low",
    dueDate: "",
    assignee: "",
    tags: "",
    estimatedTime: "",
    attachment: null,
  });
  const [customQA, setCustomQA] = useState([{ question: "", answer: "" }]);
  const [showUpdateTaskModal, setShowUpdateTaskModal] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [editTask, setEditTask] = useState({
    id: "",
    task: "",
    description: "",
    priority: "Low",
    dueDate: "",
    completed: false,
  });
  // Add state for task detail modal
  const [showTaskDetailModal, setShowTaskDetailModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteTaskId, setDeleteTaskId] = useState(null);

  // Store tasks in state
  const [tasks, setTasks] = useState([
    {
      id: generateId(),
      task: "Design Login Page",
      description: "Create a responsive login page for the admin panel.",
      priority: "High",
      dueDate: "2024-07-01",
      completed: false,
    },
    {
      id: generateId(),
      task: "Update User Roles",
      description: "Review and update user permissions for new employees.",
      priority: "Medium",
      dueDate: "2024-07-05",
      completed: false,
    },
    {
      id: generateId(),
      task: "Backup Database",
      description: "Schedule and verify weekly database backups.",
      priority: "Low",
      dueDate: "2024-07-10",
      completed: false,
    },
    {
      id: generateId(),
      task: "Announce New Feature",
      description: "Draft and send announcement for the new dashboard feature.",
      priority: "Medium",
      dueDate: "2024-07-03",
      completed: false,
    },
    {
      id: generateId(),
      task: "Clean Up Old Logs",
      description: "Remove logs older than 6 months from the server.",
      priority: "Low",
      dueDate: "2024-07-15",
      completed: false,
    },
  ]);

  // Add Task handler
  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTask.task.trim() || !newTask.description.trim() || !newTask.dueDate)
      return;
    setTasks((prev) => [
      ...prev,
      {
        id: generateId(),
        task: newTask.task.trim(),
        description: newTask.description.trim(),
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        completed: false,
      },
    ]);
    setShowAddTaskModal(false);
    setNewTask({ task: "", description: "", priority: "Low", dueDate: "" });
  };

  // Delete Task handler (by id)
  const handleDeleteTask = (id) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
    setShowDeleteConfirm(false);
    setDeleteTaskId(null);
  };

  // Open update modal with selected task by id
  const handleOpenUpdateTask = (id) => {
    const t = tasks.find((task) => task.id === id);
    if (!t) return;
    setEditTaskId(id);
    setEditTask({
      id: t.id,
      task: t.task,
      description: t.description,
      priority: t.priority,
      dueDate: t.dueDate,
      completed: typeof t.completed === "boolean" ? t.completed : false,
    });
    setShowUpdateTaskModal(true);
  };

  // Update task handler by id
  const handleUpdateTask = (e) => {
    e.preventDefault();
    if (
      !editTask.task.trim() ||
      !editTask.description.trim() ||
      !editTask.dueDate
    )
      return;
    setTasks((prev) =>
      prev.map((t) =>
        t.id === editTaskId
          ? {
              ...t,
              task: editTask.task.trim(),
              description: editTask.description.trim(),
              priority: editTask.priority,
              dueDate: editTask.dueDate,
              completed: !!editTask.completed,
            }
          : t
      )
    );
    setShowUpdateTaskModal(false);
    setEditTaskId(null);
    setEditTask({
      id: "",
      task: "",
      description: "",
      priority: "Low",
      dueDate: "",
      completed: false,
    });
  };

  // State for filter and search
  const [priorityFilter, setPriorityFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Filtered tasks based on priority and search
  const filteredTasks = tasks.filter((task) => {
    // Hide completed tasks
    if (task.completed) return false;

    // Priority filter
    const priorityMatch =
      priorityFilter === "All" ||
      task.priority.toLowerCase() === priorityFilter.toLowerCase();

    // Search filter - case insensitive and trimmed
    const trimmedQuery = searchQuery.trim().toLowerCase();
    const taskNameMatch =
      trimmedQuery === "" || task.task.toLowerCase().includes(trimmedQuery);

    return priorityMatch && taskNameMatch;
  });

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

  // Helper for today's date in yyyy-mm-dd
  const getToday = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

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

  // Conditional returns after all hooks
  if (!ci || !aid) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  const handleCustomQAChange = (idx, field, value) => {
    setCustomQA((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };
  const addCustomQA = () => {
    setCustomQA((prev) => [...prev, { question: "", answer: "" }]);
  };

  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-6 h-6 text-white"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {notification.message}
          </div>
        </div>
      )}
      {/* Add Task Modal */}
      {showAddTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] border-2 border-purple-500">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
              onClick={() => setShowAddTaskModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <div className="flex flex-col items-center mb-2">
          
              <h2 className="text-3xl font-bold mb-4 text-purple-600">Add New Task</h2>
            </div>
            <form className="flex flex-col gap-4" onSubmit={handleAddTask}>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Task
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={newTask.task}
                  onChange={(e) => setNewTask({ ...newTask, task: e.target.value })}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  rows={3}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Assignee</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                    value={newTask.assignee}
                    onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                    placeholder="Assignee"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Tags</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                    value={newTask.tags}
                    onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                    placeholder="Tags (comma separated)"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Estimated Time</label>
                  <input
                    type="text"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                    value={newTask.estimatedTime}
                    onChange={(e) => setNewTask({ ...newTask, estimatedTime: e.target.value })}
                    placeholder="e.g. 2h 30m"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Attachment</label>
                  <input
                    type="file"
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                    onChange={(e) => setNewTask({ ...newTask, attachment: e.target.files[0] })}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black bg-white"
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Due Date</label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black"
                  value={newTask.dueDate}
                  min={getToday()}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  required
                />
              </div>
              <div>
                <h3 className="font-semibold text-gray-800 mb-2">Custom Questions & Answers</h3>
                {customQA.map((qa, idx) => (
                  <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Question"
                      value={qa.question}
                      onChange={e => handleCustomQAChange(idx, "question", e.target.value)}
                      className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                    />
                    <input
                      type="text"
                      placeholder="Answer"
                      value={qa.answer}
                      onChange={e => handleCustomQAChange(idx, "answer", e.target.value)}
                      className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                    />
                  </div>
                ))}
                <button type="button" onClick={addCustomQA} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
              </div>
              <button
                type="submit"
                className="bg-[#7c3aed] hover:bg-[#a259f7] text-white font-semibold rounded-lg px-4 py-2 mt-2 transition-colors duration-200"
              >
                Add Task
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Update Task Modal */}
      {showUpdateTaskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] border-2 border-purple-500">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
              onClick={() => {
                setShowUpdateTaskModal(false);
                setEditTaskId(null);
              }}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Update Task</h2>
            <form className="flex flex-col gap-4" onSubmit={handleUpdateTask}>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="completed"
                  checked={!!editTask.completed}
                  onChange={(e) =>
                    setEditTask({ ...editTask, completed: e.target.checked })
                  }
                />
                <label
                  htmlFor="completed"
                  className="text-sm font-semibold text-gray-700"
                >
                  Completed
                </label>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Task
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editTask.task}
                  onChange={(e) =>
                    setEditTask({ ...editTask, task: e.target.value })
                  }
                  disabled={!!editTask.completed}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editTask.description}
                  onChange={(e) =>
                    setEditTask({ ...editTask, description: e.target.value })
                  }
                  rows={3}
                  disabled={!!editTask.completed}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editTask.priority}
                  onChange={(e) =>
                    setEditTask({ ...editTask, priority: e.target.value })
                  }
                  disabled={!!editTask.completed}
                  required
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Due Date
                </label>
                <input
                  type="date"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-black disabled:bg-gray-100 disabled:cursor-not-allowed"
                  value={editTask.dueDate}
                  min={getToday()}
                  onChange={(e) =>
                    setEditTask({ ...editTask, dueDate: e.target.value })
                  }
                  disabled={!!editTask.completed}
                  required
                />
              </div>
              <button
                type="submit"
                className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-2 mt-2 transition-colors duration-200"
              >
                Update Task
              </button>
            </form>
          </div>
        </div>
      )}
      {/* Task Detail Modal (Desktop/Tablet) */}
      {showTaskDetailModal && selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur">
          <div className="relative w-full max-w-xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] border-2 border-purple-500">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
              onClick={() => setShowTaskDetailModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-black">Task Details</h2>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Task:</span>
              <span className="ml-2 text-gray-900">{selectedTask.task}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Description:</span>
              <span className="ml-2 text-gray-900">
                {selectedTask.description}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Priority:</span>
              <span
                className={
                  "ml-2 font-bold px-3 py-1 rounded-full text-sm " +
                  (selectedTask.priority === "High"
                    ? "bg-red-100 text-red-600"
                    : selectedTask.priority === "Medium"
                    ? "bg-orange-100 text-orange-500"
                    : "bg-green-100 text-green-600")
                }
              >
                {selectedTask.priority}
              </span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Due Date:</span>
              <span className="ml-2 text-gray-900">{selectedTask.dueDate}</span>
            </div>
            <div className="mb-2">
              <span className="font-semibold text-gray-700">Completed:</span>
              <span className="ml-2 text-gray-900">
                {selectedTask.completed ? "Yes" : "No"}
              </span>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                onClick={() => {
                  setShowTaskDetailModal(false);
                  handleOpenUpdateTask(selectedTask.id);
                }}
              >
                Update
              </button>
              {/* Remove Delete button, add Close button */}
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                onClick={() => setShowTaskDetailModal(false)}
              >
                Close
              </button>
            </div>
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
            className="transition-all duration-300 pl-0 pr-2 sm:pl-2 sm:pr-8 py-12 md:py-6"
            style={{
              marginLeft: 0,
              paddingTop: Math.max(headerHeight, 72) + 16,
            }}
          >
            <div className="pl-4">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl text-[#7c3aed] font-bold">
                    Notes and Tasks
                  </h1>
                  <p className="text-gray-500 mb-6">
                    Manage your tasks and track progress
                  </p>
                </div>
                <button
                  className="bg-[#7c3aed] hover:bg-[#a259f7] text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center gap-2"
                  aria-label="Add Task"
                  onClick={() => setShowAddTaskModal(true)}
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
                  Add Task
                </button>
              </div>
              {/* Task Summary Box */}
              <div className="mt-6 mb-8">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Total Tasks */}
                  <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                    <div className="flex flex-col justify-center w-full">
                      <span className="text-lg text-gray-500 font-semibold">
                        Total Tasks
                      </span>
                      <span className="text-3xl font-bold text-blue-600">
                        {tasks.length}
                      </span>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg self-center ml-4">
                      <Package size={28} className="text-blue-600" />
                    </div>
                  </div>
                  {/* Low Priority */}
                  <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                    <div className="flex flex-col justify-center w-full">
                      <span className="text-lg text-gray-500 font-semibold">
                        Low Priority
                      </span>
                      <span className="text-3xl font-bold text-green-600">
                        {tasks.filter((t) => t.priority === "Low").length}
                      </span>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg self-center ml-4">
                      <Package size={28} className="text-green-600" />
                    </div>
                  </div>
                  {/* Medium Priority */}
                  <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                    <div className="flex flex-col justify-center w-full">
                      <span className="text-lg text-gray-500 font-semibold">
                        Medium Priority
                      </span>
                      <span className="text-3xl font-bold text-orange-500">
                        {tasks.filter((t) => t.priority === "Medium").length}
                      </span>
                    </div>
                    <div className="p-2 bg-orange-100 rounded-lg self-center ml-4">
                      <Package size={28} className="text-orange-500" />
                    </div>
                  </div>
                  {/* High Priority */}
                  <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                    <div className="flex flex-col justify-center w-full">
                      <span className="text-lg text-gray-500 font-semibold">
                        High Priority
                      </span>
                      <span className="text-3xl font-bold text-red-600">
                        {tasks.filter((t) => t.priority === "High").length}
                      </span>
                    </div>
                    <div className="p-2 bg-red-100 rounded-lg self-center ml-4">
                      <Package size={28} className="text-red-600" />
                    </div>
                  </div>
                </div>
              </div>
              {/* Search and Filter Controls */}
              <div className="mt-8 mb-8 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Search size={20} />
                  </span>
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.trim())}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                <div className="relative w-full sm:w-48">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <Filter size={20} />
                  </span>
                  <select
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-gray-900 bg-white appearance-none"
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                  >
                    <option value="All">All</option>
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>
              {/* Tasks Table (Desktop/Tablet) */}
              <div className="hidden sm:block mt-8 overflow-x-auto">
                <table className="min-w-full bg-white rounded-2xl shadow border border-gray-100">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Task
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priority
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Due Date
                      </th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredTasks.map((task, idx) => (
                      <tr
                        key={task.id}
                        className="border-t border-gray-100 text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                        onClick={() => {
                          setSelectedTask(task);
                          setShowTaskDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-500">
                          {task.task}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {task.description.length > 45
                            ? task.description.slice(0, 45) + "..."
                            : task.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={
                              `px-3 py-1 rounded-full text-xs font-semibold ` +
                              (task.priority === "High"
                                ? "bg-red-100 text-red-700"
                                : task.priority === "Medium"
                                ? "bg-orange-100 text-orange-500"
                                : task.priority === "Low"
                                ? "bg-green-100 text-green-600"
                                : "bg-gray-100 text-gray-900")
                            }
                          >
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                          {task.dueDate}
                        </td>
                        <td
                          className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            className="text-purple-500 hover:text-purple-700"
                            title="Update Task"
                            onClick={() => handleOpenUpdateTask(task.id)}
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
                                d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                              />
                            </svg>
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Delete Task"
                            onClick={() => {
                              setDeleteTaskId(task.id);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {/* Card-based Task List (Mobile) */}
              <div className="sm:hidden mt-8">
                {filteredTasks.length === 0 ? (
                  <div className="text-center text-gray-500 text-lg">
                    No tasks found.
                  </div>
                ) : (
                  filteredTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedTask(task);
                        setShowTaskDetailModal(true);
                      }}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-bold text-gray-500">
                          {task.task}
                        </span>
                        <span
                          className={
                            "px-3 py-1 rounded-full text-xs font-semibold " +
                            (task.priority === "High"
                              ? "bg-red-100 text-red-700"
                              : task.priority === "Medium"
                              ? "bg-orange-100 text-orange-500"
                              : "bg-green-100 text-green-600")
                          }
                        >
                          {task.priority}
                        </span>
                      </div>
                      <div className="text-gray-500 text-sm mb-2">
                        Due: {task.dueDate}
                      </div>
                      <div className="flex gap-3 self-end">
                        <button
                          className="text-purple-500 hover:text-purple-700"
                          title="Update Task"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenUpdateTask(task.id);
                          }}
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
                              d="M15.232 5.232l3.536 3.536M9 13l6-6 3 3-6 6H9v-3z"
                            />
                          </svg>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Delete Task"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteTaskId(task.id);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {/* Delete Confirmation Modal */}
              {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
                  <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
                    <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
                      <Trash2 className="w-6 h-6 text-red-600" />
                      Confirm Delete
                    </h2>
                    <p className="mb-6 text-gray-700">
                      Are you sure you want to delete this task? This action
                      cannot be undone.
                    </p>
                    <div className="flex justify-end gap-3">
                      <button
                        className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold"
                        onClick={() => {
                          setShowDeleteConfirm(false);
                          setDeleteTaskId(null);
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold"
                        onClick={() => handleDeleteTask(deleteTaskId)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function NotesTasks() {
  return (
    <SidebarProvider>
      <NotesTasksContent />
    </SidebarProvider>
  );
}
