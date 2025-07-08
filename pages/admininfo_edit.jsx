import React, { useState, useEffect } from "react";
import { useRouter } from "next/router";
// Mock user data (replace with real data as needed)
const mockUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  phone: "+1 234 567 8901",
  plan: "Pro",
  companyName: "Cyber Clipper Inc.",
  companySize: "50-100",
  companyLocation: "New York, USA",
};

const AdminInfoEdit = () => {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(mockUser.companyName);
  const [companySize, setCompanySize] = useState(mockUser.companySize);
  const [companyLocation, setCompanyLocation] = useState(
    mockUser.companyLocation
  );

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalField, setModalField] = useState("");
  const [modalValue, setModalValue] = useState("");

  // Notification state
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifMsg, setNotifMsg] = useState("");

  // Auto-dismiss notification
  useEffect(() => {
    if (notifOpen) {
      const timer = setTimeout(() => setNotifOpen(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [notifOpen]);

  // Open modal for a field
  const handleEditClick = (field) => {
    setModalField(field);
    if (field === "Company Name") setModalValue(companyName);
    if (field === "Company Size") setModalValue(companySize);
    if (field === "Company Location") setModalValue(companyLocation);
    setModalOpen(true);
  };

  // Save modal value
  const handleModalSave = () => {
    if (modalField === "Company Name") setCompanyName(modalValue);
    if (modalField === "Company Size") setCompanySize(modalValue);
    if (modalField === "Company Location") setCompanyLocation(modalValue);
    setModalOpen(false);
    setNotifMsg("Profile updated!");
    setNotifOpen(true);
  };

  // Form submit (not used for modal edits)
  const handleSubmit = (e) => {
    e.preventDefault();
    setNotifMsg("Profile updated!");
    setNotifOpen(true);
  };

  // Pencil SVG
  const PencilIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#a259f7" className="w-5 h-5 inline ml-2 cursor-pointer hover:scale-125 transition-transform duration-150">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L7.5 19.213l-4 1 1-4 13.362-13.726z" />
    </svg>
  );

  // Modal JSX
  const Modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/50 backdrop-blur-2xl">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-sm relative animate-fadeIn text-gray-500">
        <button
          onClick={() => setModalOpen(false)}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold"
          aria-label="Close"
        >
          &times;
        </button>
        <h3 className="text-2xl font-bold mb-6 text-[#a259f7] text-center">Edit {modalField}</h3>
        <input
          type="text"
          value={modalValue}
          onChange={(e) => setModalValue(e.target.value)}
          className="w-full py-3 px-4 rounded-lg border border-[#a259f7] mb-6 focus:ring-2 focus:ring-[#a259f7] outline-none text-lg"
          autoFocus
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setModalOpen(false)}
            className="px-5 py-2 rounded bg-gray-200 text-gray-700 hover:bg-gray-300 font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleModalSave}
            className="px-5 py-2 rounded bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold hover:from-purple-700 hover:to-violet-700 shadow-md"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  // Notification JSX
  const Notification = (
    <div className={`fixed top-6 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${notifOpen ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}>
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
        {notifMsg}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FBF6F1] py-10 px-0 font-sans">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-5 py-2 ml-6 mb-4 w-fit rounded-full bg-white/80 hover:bg-white/100 shadow text-[#a259f7] font-semibold text-lg transition-colors duration-150 border border-purple-100"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#a259f7" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
        </svg>
        Back
      </button>
      {Notification}
      {modalOpen && Modal}
      <div className="w-full flex flex-col md:flex-row overflow-hidden animate-fadeIn">
        {/* Left: Non-editable user info */}
        <div className="md:w-1/2 w-full p-12 flex flex-col justify-center bg-gradient-to-br from-purple-50 to-violet-50">
          <h2 className="text-4xl font-extrabold text-[#a259f7] mb-10 text-left tracking-tight">Admin Info</h2>
          <div className="space-y-8">
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Name</label>
              <input
                type="text"
                value={mockUser.name}
                disabled
                className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-lg outline-none cursor-not-allowed shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Email</label>
              <input
                type="email"
                value={mockUser.email}
                disabled
                className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-lg outline-none cursor-not-allowed shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Phone Number</label>
              <input
                type="text"
                value={mockUser.phone}
                disabled
                className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-lg outline-none cursor-not-allowed shadow-sm"
              />
            </div>
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Selected Plan</label>
              <input
                type="text"
                value={mockUser.plan}
                disabled
                className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 font-bold text-lg outline-none cursor-not-allowed shadow-sm"
              />
            </div>
          </div>
        </div>
        {/* Right: Editable company info */}
        <div className="md:w-1/2 w-full p-12 flex flex-col justify-center bg-white">
          <form onSubmit={handleSubmit} className="space-y-10">
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Company Name</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={companyName}
                  disabled
                  className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-lg outline-none mr-2 cursor-not-allowed shadow-sm"
                />
                <span onClick={() => handleEditClick("Company Name")}>{PencilIcon}</span>
              </div>
            </div>
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Company Size</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={companySize}
                  disabled
                  className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-lg outline-none mr-2 cursor-not-allowed shadow-sm"
                />
                <span onClick={() => handleEditClick("Company Size")}>{PencilIcon}</span>
              </div>
            </div>
            <div>
              <label className="block text-[#22223b] font-semibold mb-2 text-lg">Company Location</label>
              <div className="flex items-center">
                <input
                  type="text"
                  value={companyLocation}
                  disabled
                  className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-lg outline-none mr-2 cursor-not-allowed shadow-sm"
                />
                <span onClick={() => handleEditClick("Company Location")}>{PencilIcon}</span>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-xl hover:from-purple-700 hover:to-violet-700 transition-colors duration-200 mt-8 shadow-lg"
            >
              Save Changes
            </button>
          </form>
        </div>
      </div>
      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s cubic-bezier(.4,0,.2,1); }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-slideDown { animation: slideDown 0.4s cubic-bezier(.4,0,.2,1); }
      `}</style>
    </div>
  );
};

export default AdminInfoEdit;
