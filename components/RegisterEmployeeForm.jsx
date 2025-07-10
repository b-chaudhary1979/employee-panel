import React, { useState } from "react";

export default function RegisterEmployeeForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    gender: "",
    address: "",
    city: "",
    state: "",
    country: "",
    zip: "",
    department: "",
    role: "",
    employeeId: "",
    dateJoined: "",
    photo: null,
  });
  const [customQA, setCustomQA] = useState([{ question: "", answer: "" }]);
  const [employeeIdEditable, setEmployeeIdEditable] = useState(false);
  const [lastClicked, setLastClicked] = useState(""); // "manual" or "generate"
  const [copied, setCopied] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "file" ? files[0] : value,
    }));
  };

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

  // Helper to generate employee ID
  const generateEmployeeId = () => {
    // Only generate if all required fields are present
    if (!form.firstName || !form.lastName || !form.dateJoined || !form.company || !form.department) {
      return;
    }
    const company = (form.company || "").replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    const dept = (form.department || "").replace(/[^a-zA-Z]/g, '').toUpperCase().slice(0, 2);
    const first = (form.firstName || "").replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    const last = (form.lastName || "").replace(/[^a-zA-Z]/g, '').slice(0, 2).toUpperCase();
    let doj = "";
    if (form.dateJoined) {
      const d = new Date(form.dateJoined);
      doj = d.getFullYear().toString().slice(-2) + String(d.getMonth() + 1).padStart(2, '0') + String(d.getDate()).padStart(2, '0');
    }
    const random = Math.floor(10 + Math.random() * 90).toString(); // 2-digit random number
    let base = `${company}${dept}${first}${last}${doj}${random}`;
    // Ensure exactly 12 chars
    const id = base.slice(0, 12);
    setForm((prev) => ({ ...prev, employeeId: id }));
    setEmployeeIdEditable(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 2000);
  };

  return (
    <>
      {showSuccess && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg font-semibold text-lg transition-all animate-fade-in-out">
          Employee registered successfully!
        </div>
      )}
      <form className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-purple-500" onSubmit={handleSubmit}>
        <h2 className="text-2xl font-bold mb-4 text-purple-600">Register Employee</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name <span className='text-red-600'>*</span></label>
            <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="First Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name <span className='text-red-600'>*</span></label>
            <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Last Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Email <span className='text-red-600'>*</span></label>
            <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Email" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Phone" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date of Birth</label>
            <input name="dob" type="date" value={form.dob} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" placeholder="Date of Birth" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Gender</label>
            <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2 text-gray-800">
              <option value="">Select</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Address</label>
            <input name="address" value={form.address} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Address" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">City</label>
            <input name="city" value={form.city} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="City" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">State</label>
            <input name="state" value={form.state} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="State" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Country</label>
            <input name="country" value={form.country} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Country" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Company Name <span className='text-red-600'>*</span></label>
            <input name="company" value={form.company || ""} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Company Name" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">ZIP Code</label>
            <input name="zip" value={form.zip} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="ZIP Code" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Department <span className='text-red-600'>*</span></label>
            <input name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Department" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Role <span className='text-red-600'>*</span></label>
            <input name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Role" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Employee ID</label>
            {form.employeeId && (
              <div className="mb-1 flex items-center gap-2">
                <span className="text-red-600 font-bold">{form.employeeId}</span>
                <button
                  type="button"
                  className="p-1 text-gray-400 hover:text-gray-700 focus:outline-none"
                  title={copied ? 'Copied!' : 'Copy'}
                  onClick={() => {
                    navigator.clipboard.writeText(form.employeeId);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 1200);
                  }}
                >
                  {copied ? (
                    <span className="text-green-600 text-xs font-semibold">Copied!</span>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <rect x="9" y="9" width="13" height="13" rx="2" className="stroke-current"/>
                      <rect x="3" y="3" width="13" height="13" rx="2" className="stroke-current"/>
                    </svg>
                  )}
                </button>
              </div>
            )}
            <div className="flex gap-2 items-center">
              <input
                name="employeeId"
                value={form.employeeId}
                onChange={handleChange}
                className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800"
                required
                placeholder="Employee ID"
                disabled={!employeeIdEditable}
                onFocus={() => setEmployeeIdEditable(true)}
              />
              <button
                type="button"
                className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${lastClicked === 'generate' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'}`}
                onClick={() => { generateEmployeeId(); setLastClicked('generate'); }}
              >
                Generate
              </button>
              <button
                type="button"
                className={`px-2 py-1 rounded text-xs font-semibold border transition-colors ${lastClicked === 'manual' ? 'bg-green-100 text-green-700 border-green-300' : 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-blue-200'}`}
                onClick={() => { setEmployeeIdEditable(true); setLastClicked('manual'); }}
              >
                Manual
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Date Joined <span className='text-red-600'>*</span></label>
            <input name="dateJoined" type="date" value={form.dateJoined} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Date Joined" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium mb-1">Employee Photo</label>
            <input name="photo" type="file" accept="image/*" onChange={handleChange} className="w-full text-gray-800" />
          </div>
        </div>
        <div>
          <h3 className="font-semibold mb-2">Custom Questions & Answers</h3>
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
        <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mt-4">Register Employee</button>
      </form>
    </>
  );
} 