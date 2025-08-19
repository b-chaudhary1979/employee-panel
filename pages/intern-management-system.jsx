import React, { useState, useRef, useEffect } from "react";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import useFetchInterns from "../hooks/useFetchInterns";
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

export default function InternManagementSystem() {
  const { isOpen } = useSidebar();
  const router = useRouter();
  const { user, loading: userLoading } = useUserInfo();
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(72);
  const headerRef = useRef(null);
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });
  
  // Get company ID from URL token (same as other pages)
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const companyId = ci; // This is the real companyId from the token
  
  // Use the hook to fetch interns
  const { interns, loading: internsLoading, error: internsError, addIntern, updateIntern } = useFetchInterns(companyId);
  
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [showAddInternModal, setShowAddInternModal] = useState(false);
  const [newIntern, setNewIntern] = useState({
    name: "",
    email: "",
    phone: "",
    department: "",
    startDate: "",
    endDate: "",
    mentor: "",
    projects: [""],
    skills: [""],
    preferredTechnologies: [""],
    education: {
      university: "",
      currentSemester: ""
    },
    githubProfile: "",
    linkedinProfile: "",
    portfolioWebsite: "",
    aboutYourself: "",
    careerGoals: ""
  });
  
  // Filter state
  const [filterStatus, setFilterStatus] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

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

  // Handle adding a new intern
  const handleAddIntern = async (e) => {
    e.preventDefault();
    
    if (!companyId) {
      setNotification({ show: true, message: "Company ID missing – cannot add intern.", color: "red" });
      return;
    }

    try {
      await addIntern(newIntern);
      setShowAddInternModal(false);
      setNewIntern({
        name: "",
        email: "",
        phone: "",
        department: "",
        startDate: "",
        endDate: "",
        mentor: "",
        projects: [""],
        skills: [""],
        preferredTechnologies: [""],
        education: {
          university: "",
          currentSemester: ""
        },
        githubProfile: "",
        linkedinProfile: "",
        portfolioWebsite: "",
        aboutYourself: "",
        careerGoals: ""
      });
      
      setNotification({
        show: true,
        message: "Intern added successfully!",
        color: "green"
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: "", color: "green" });
      }, 3000);
    } catch (err) {
      console.error("Failed to add intern to Firestore", err);
      setNotification({ show: true, message: "Failed to add intern. Please try again.", color: "red" });
    }
  };

  // Handle input change for new intern form
  const handleNewInternChange = (e) => {
    const { name, value } = e.target;
    setNewIntern({
      ...newIntern,
      [name]: value
    });
  };

  // Handle project input change
  const handleProjectChange = (index, value) => {
    const updatedProjects = [...newIntern.projects];
    updatedProjects[index] = value;
    setNewIntern({
      ...newIntern,
      projects: updatedProjects
    });
  };

  // Add new project field
  const addProjectField = () => {
    setNewIntern({
      ...newIntern,
      projects: [...newIntern.projects, ""]
    });
  };

  // Remove project field
  const removeProjectField = (index) => {
    const updatedProjects = [...newIntern.projects];
    updatedProjects.splice(index, 1);
    setNewIntern({
      ...newIntern,
      projects: updatedProjects
    });
  };
  
  // Handle skills input change
  const handleSkillChange = (index, value) => {
    const updatedSkills = [...newIntern.skills];
    updatedSkills[index] = value;
    setNewIntern({
      ...newIntern,
      skills: updatedSkills
    });
  };

  // Add new skill field
  const addSkillField = () => {
    setNewIntern({
      ...newIntern,
      skills: [...newIntern.skills, ""]
    });
  };

  // Remove skill field
  const removeSkillField = (index) => {
    const updatedSkills = [...newIntern.skills];
    updatedSkills.splice(index, 1);
    setNewIntern({
      ...newIntern,
      skills: updatedSkills
    });
  };
  
  // Handle preferred technologies input change
  const handleTechChange = (index, value) => {
    const updatedTech = [...newIntern.preferredTechnologies];
    updatedTech[index] = value;
    setNewIntern({
      ...newIntern,
      preferredTechnologies: updatedTech
    });
  };

  // Add new technology field
  const addTechField = () => {
    setNewIntern({
      ...newIntern,
      preferredTechnologies: [...newIntern.preferredTechnologies, ""]
    });
  };

  // Remove technology field
  const removeTechField = (index) => {
    const updatedTech = [...newIntern.preferredTechnologies];
    updatedTech.splice(index, 1);
    setNewIntern({
      ...newIntern,
      preferredTechnologies: updatedTech
    });
  };
  
  // Handle education fields
  const handleEducationChange = (field, value) => {
    setNewIntern({
      ...newIntern,
      education: {
        ...newIntern.education,
        [field]: value
      }
    });
  };

  // Filter interns based on status and search term
  const filteredInterns = interns.filter(intern => {
    const matchesStatus = filterStatus === "All" || intern.status === filterStatus;
    const fullName = `${intern.firstName || ''} ${intern.lastName || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) || 
                         (intern.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (intern.department?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  // View intern details
  const viewInternDetails = (intern) => {
    setSelectedIntern(intern);
  };

  // Close intern details modal
  const closeInternDetails = () => {
    setSelectedIntern(null);
  };

  // Change intern status
  const changeInternStatus = async (id, newStatus) => {
    try {
      await updateIntern(id, { status: newStatus });
      
      if (selectedIntern && selectedIntern.id === id) {
        setSelectedIntern({ ...selectedIntern, status: newStatus });
      }
      
      setNotification({
        show: true,
        message: `Intern status updated to ${newStatus}!`,
        color: "green"
      });
      
      setTimeout(() => {
        setNotification({ show: false, message: "", color: "green" });
      }, 3000);
    } catch (err) {
      console.error("Failed to update intern status:", err);
      setNotification({
        show: true,
        message: "Failed to update intern status. Please try again.",
        color: "red"
      });
    }
  };

  if (userLoading || internsLoading) {
    return <Loader />;
  }

  if (internsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Interns</h2>
          <p className="text-gray-600 mb-4">{internsError}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {notification.show && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg shadow-lg text-white font-medium ${notification.color === "green" ? "bg-green-500" : "bg-red-500"}`}
        >
          {notification.message}
        </div>
      )}
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
          username={user?.name || "Employee"}
          companyName={user?.department || "Department"}
        />
        <main
          className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
          style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
        >
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl text-[#28DB78] font-bold">
                  Intern Management
                </h1>
                <p className="text-gray-500 mb-6">
                  Track and manage your company interns
                </p>
              </div>
              <button
                onClick={() => setShowAddInternModal(true)}
                className="bg-[#28DB78] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Intern
              </button>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                  <input
                    type="text"
                    placeholder="Search by name, email, or department"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status Filter</label>
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                  >
                    <option value="All">All</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Interns Table */}
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mentor</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredInterns.length > 0 ? (
                      filteredInterns.map((intern) => (
                        <tr key={intern.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{intern.id}</td>
                                                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intern.firstName} {intern.lastName}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intern.email}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intern.department}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{intern.mentor || "No mentor Assigned"}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${intern.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {intern.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => viewInternDetails(intern)}
                              className="text-indigo-600 hover:text-indigo-900 mr-3"
                            >
                              View
                            </button>
                            <button
                              onClick={() => changeInternStatus(intern.id, intern.status === 'Active' ? 'Inactive' : 'Active')}
                              className={`${intern.status === 'Active' ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'}`}
                            >
                              {intern.status === 'Active' ? 'Deactivate' : 'Activate'}
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="7" className="px-6 py-4 text-center text-sm text-gray-500">
                          No interns found matching your criteria.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Add Intern Modal */}
      {showAddInternModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Add New Intern</h2>
              <button
                onClick={() => setShowAddInternModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddIntern}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newIntern.name}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={newIntern.email}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={newIntern.phone}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                  <select
                    name="department"
                    value={newIntern.department}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
                    required
                  >
                    <option value="">Select Department</option>
                    <option value="Software Development">Software Development</option>
                    <option value="SEO">SEO</option>
                    <option value="UI/UX Design">UI/UX Design</option>
                    <option value="Content Writing">Content Writing</option>
                    <option value="Social Media Management">Social Media Management (SMM)</option>
                    <option value="Sales">Sales</option>
                    <option value="Digital Marketing">Digital Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mentor</label>
                  <input
                    type="text"
                    name="mentor"
                    value={newIntern.mentor}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    name="startDate"
                    value={newIntern.startDate}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={newIntern.endDate}
                    onChange={handleNewInternChange}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GitHub Profile</label>
                  <input
                    type="url"
                    name="githubProfile"
                    value={newIntern.githubProfile}
                    onChange={handleNewInternChange}
                    placeholder="https://github.com/username"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                  <input
                    type="url"
                    name="linkedinProfile"
                    value={newIntern.linkedinProfile}
                    onChange={handleNewInternChange}
                    placeholder="https://linkedin.com/in/username"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio Website</label>
                  <input
                    type="url"
                    name="portfolioWebsite"
                    value={newIntern.portfolioWebsite}
                    onChange={handleNewInternChange}
                    placeholder="https://yourportfolio.com"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
              </div>
              
              {/* Education */}
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-700 mb-2">Education</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">University</label>
                    <input
                      type="text"
                      value={newIntern.education.university}
                      onChange={(e) => handleEducationChange('university', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Semester</label>
                    <input
                      type="text"
                      value={newIntern.education.currentSemester}
                      onChange={(e) => handleEducationChange('currentSemester', e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      required
                    />
                  </div>
                </div>
              </div>
              
              {/* Skills */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Skills</label>
                {newIntern.skills.map((skill, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => handleSkillChange(index, e.target.value)}
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Skill"
                      required
                    />
                    {newIntern.skills.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSkillField(index)}
                        className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSkillField}
                  className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Add
                </button>
              </div>
              
              {/* Preferred Technologies */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Technologies</label>
                {newIntern.preferredTechnologies.map((tech, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={tech}
                      onChange={(e) => handleTechChange(index, e.target.value)}
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Technology"
                      required
                    />
                    {newIntern.preferredTechnologies.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeTechField(index)}
                        className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addTechField}
                  className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Add
                </button>
              </div>
              
              {/* Projects */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Projects</label>
                {newIntern.projects.map((project, index) => (
                  <div key={index} className="flex mb-2">
                    <input
                      type="text"
                      value={project}
                      onChange={(e) => handleProjectChange(index, e.target.value)}
                      className="flex-grow border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Project name"
                      required
                    />
                    {newIntern.projects.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeProjectField(index)}
                        className="ml-2 px-2 py-2 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addProjectField}
                  className="mt-2 px-4 py-2 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                >
                  Add Project
                </button>
              </div>
              
              {/* About Yourself */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">About Yourself</label>
                <textarea
                  name="aboutYourself"
                  value={newIntern.aboutYourself}
                  onChange={handleNewInternChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Tell us about yourself, your background, and interests"
                  required
                ></textarea>
              </div>
              
              {/* Career Goals */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Career Goals</label>
                <textarea
                  name="careerGoals"
                  value={newIntern.careerGoals}
                  onChange={handleNewInternChange}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  rows="3"
                  placeholder="Describe your short-term and long-term career goals"
                  required
                ></textarea>
              </div>
              
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowAddInternModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#28DB78] hover:bg-[#16a34a] text-white rounded-md"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

             {/* Intern Details Modal */}
       {selectedIntern && (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                         <div className="mb-4">
               <h2 className="text-2xl font-bold text-gray-800">Intern Details</h2>
             </div>
            
                         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
               <div>
                 <h3 className="text-sm font-medium text-gray-700">ID</h3>
                 <p className="text-lg font-semibold text-gray-900">{selectedIntern.id}</p>
               </div>
                              <div>
                  <h3 className="text-sm font-medium text-gray-700">Name</h3>
                  <p className="text-lg font-semibold text-gray-900">{selectedIntern.firstName} {selectedIntern.lastName}</p>
                </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">Email</h3>
                 <p className="text-lg text-gray-900">{selectedIntern.email}</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">Department</h3>
                 <p className="text-lg text-gray-900">{selectedIntern.department}</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">Mentor</h3>
                 <p className="text-lg text-gray-900">{selectedIntern.mentor || "No mentor Assigned"}</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">Status</h3>
                 <span className={`px-2 py-1 inline-flex text-sm leading-5 font-semibold rounded-full ${selectedIntern.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                   {selectedIntern.status}
                 </span>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">Start Date</h3>
                 <p className="text-lg text-gray-900">{selectedIntern.startDate}</p>
               </div>
               <div>
                 <h3 className="text-sm font-medium text-gray-700">End Date</h3>
                 <p className="text-lg text-gray-900">{selectedIntern.endDate}</p>
               </div>
             </div>
            
                         <div className="mb-6">
               <h3 className="text-lg font-semibold mb-2">Projects</h3>
               <ul className="list-disc pl-5 space-y-1">
                 {selectedIntern.projects && selectedIntern.projects.length > 0 ? (
                   selectedIntern.projects.map((project, index) => (
                     <li key={index} className="text-gray-700">{project}</li>
                   ))
                 ) : (
                   <li className="text-gray-500 italic">No projects listed</li>
                 )}
               </ul>
             </div>
            
            <div className="flex justify-between mt-6">
              <button
                onClick={() => changeInternStatus(selectedIntern.id, selectedIntern.status === 'Active' ? 'Inactive' : 'Active')}
                className={`px-4 py-2 rounded-md ${selectedIntern.status === 'Active' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 'bg-green-100 text-green-700 hover:bg-green-200'}`}
              >
                {selectedIntern.status === 'Active' ? 'Deactivate Intern' : 'Activate Intern'}
              </button>
              <button
                onClick={closeInternDetails}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}