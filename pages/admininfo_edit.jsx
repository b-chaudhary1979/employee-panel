import React, { useState } from "react";

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
  const [companyName, setCompanyName] = useState(mockUser.companyName);
  const [companySize, setCompanySize] = useState(mockUser.companySize);
  const [companyLocation, setCompanyLocation] = useState(
    mockUser.companyLocation
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Save logic here
    alert("Company info updated!");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#FBF6F1] py-10">
      <div className="bg-white/80 rounded-2xl shadow-2xl p-10 w-full max-w-xl border border-purple-100">
        <h2 className="text-3xl font-extrabold text-[#a259f7] mb-6 text-center">
          Admin Info
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Non-editable user info */}
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Name
            </label>
            <input
              type="text"
              value={mockUser.name}
              disabled
              className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Email
            </label>
            <input
              type="email"
              value={mockUser.email}
              disabled
              className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none cursor-not-allowed"
            />
          </div>
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Phone Number
            </label>
            <input
              type="text"
              value={mockUser.phone}
              disabled
              className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none cursor-not-allowed"
            />
          </div>
          {/* Editable company info */}
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Company Name
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none focus:ring-2 focus:ring-[#a259f7]"
            />
          </div>
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Company Size
            </label>
            <input
              type="text"
              value={companySize}
              onChange={(e) => setCompanySize(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none focus:ring-2 focus:ring-[#a259f7]"
            />
          </div>
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Company Location
            </label>
            <input
              type="text"
              value={companyLocation}
              onChange={(e) => setCompanyLocation(e.target.value)}
              className="w-full py-3 px-4 rounded-lg border border-[#a259f7] bg-[#f8f9fa] text-gray-700 text-[15px] outline-none focus:ring-2 focus:ring-[#a259f7]"
            />
          </div>
          {/* Plan info */}
          <div>
            <label className="block text-[#22223b] font-semibold mb-1">
              Selected Plan
            </label>
            <input
              type="text"
              value={mockUser.plan}
              disabled
              className="w-full py-3 px-4 rounded-lg border border-[#e0dfea] bg-gradient-to-r from-purple-100 to-violet-100 text-purple-700 font-bold text-[15px] outline-none cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-lg bg-gradient-to-r from-purple-600 to-violet-600 text-white font-bold text-lg hover:from-purple-700 hover:to-violet-700 transition-colors duration-200"
          >
            Save Changes
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminInfoEdit;
