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

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle form submission logic here
    alert("Employee registered! (Demo only)");
  };

  return (
    <form className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-purple-500" onSubmit={handleSubmit}>
      <h2 className="text-2xl font-bold mb-4 text-purple-600">Register Employee</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="First Name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Last Name" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input name="email" type="email" value={form.email} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Email" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="phone" value={form.phone} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Phone" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date of Birth</label>
          <input name="dob" type="date" value={form.dob} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Date of Birth" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Gender</label>
          <select name="gender" value={form.gender} onChange={handleChange} className="w-full border rounded px-3 py-2 text-gray-800" required>
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
          <label className="block text-sm font-medium mb-1">ZIP Code</label>
          <input name="zip" value={form.zip} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="ZIP Code" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Department</label>
          <input name="department" value={form.department} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Department" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <input name="role" value={form.role} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Role" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Employee ID</label>
          <input name="employeeId" value={form.employeeId} onChange={handleChange} className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" required placeholder="Employee ID" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Date Joined</label>
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
  );
} 