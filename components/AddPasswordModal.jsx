import React, { useState } from "react";
import { FaUserShield, FaKey, FaTags, FaCalendarAlt } from "react-icons/fa";

function getPasswordStrength(password) {
  if (!password) return "Weak";
  if (
    password.length > 12 &&
    /[A-Z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  )
    return "Strong";
  if (password.length > 8) return "Medium";
  return "Weak";
}

function generateStrongPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()_+~";
  let pass = "";
  for (let i = 0; i < 16; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

export default function AddPasswordModal({ open, onClose, onAdd, initialData }) {
  const [form, setForm] = useState(initialData ? {
    ...initialData,
    employee: Array.isArray(initialData.employee) ? initialData.employee : initialData.employee ? [initialData.employee] : [""],
    createdAt: initialData.createdAt || new Date().toISOString(),
    usageTag: initialData.usageTag || 'In Use',
  } : {
    website: "",
    username: "",
    password: "",
    employee: [""],
    category: "",
    url: "",
    notes: "",
    createdAt: new Date().toISOString(),
    securityLevel: "Medium",
    customFields: [],
    usageTag: 'In Use',
  });
  const [customFields, setCustomFields] = useState(initialData?.customFields || []); // [{question: '', answer: ''}]
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleCustomFieldChange = (idx, key, value) => {
    const updated = [...customFields];
    updated[idx][key] = value;
    setCustomFields(updated);
  };

  const handleAddCustomField = () => {
    setCustomFields([...customFields, { question: "", answer: "" }]);
  };

  const handleRemoveCustomField = (idx) => {
    setCustomFields(customFields.filter((_, i) => i !== idx));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    onAdd({ ...form, customFields });
    if (!initialData) {
      setForm({ website: "", username: "", password: "", employee: [""], category: "", url: "", notes: "", createdAt: new Date().toISOString(), securityLevel: "Medium", customFields: [] });
      setCustomFields([]);
    }
    onClose();
  };

  // Helper for employee display
  const employeeDisplay = form.employee.filter(Boolean).join(", ");

  // Responsive modal with side scroller for form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 to-purple-100/80 backdrop-blur-[6px]">
      <div className="bg-white/80 border border-purple-200 rounded-3xl shadow-2xl w-full max-w-2xl p-0 relative animate-modalIn backdrop-blur-xl ring-1 ring-purple-100 animate-premiumModalIn">
        <div className="w-full h-full max-h-[90vh] flex flex-col">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-purple-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow-md hover:bg-purple-100"
            onClick={onClose}
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" /><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-extrabold mb-1 text-purple-700 tracking-tight drop-shadow-sm">{initialData ? "Edit Password" : "Add New Password"}</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-full mb-3 animate-shimmer" />
            <p className="mb-4 text-gray-500 text-sm">Fill in the details below to securely store a new password.</p>
          </div>
          <div className="flex-1 overflow-x-auto px-4 pb-8">
            <form onSubmit={handleSubmit} className="min-w-[340px] sm:min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 text-gray-800 bg-white/70 rounded-2xl p-6 shadow-lg ring-1 ring-purple-50 animate-fadeIn">
              {/* Password Submitted By */}
              <div className="lg:col-span-3 sm:col-span-2 col-span-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaUserShield className="text-purple-400" /> Password Submitted By <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="submittedBy"
                  value={form.submittedBy || ""}
                  onChange={handleChange}
                  required
                  className="w-full border-2 border-purple-200 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200 font-semibold animate-inputPulse"
                  placeholder="Enter admin name"
                />
              </div>
              {/* Credential Info Section */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 mb-2">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg font-semibold text-purple-600">Credentail Information</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-200 via-pink-200 to-transparent animate-shimmer" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Website/Service</label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g. Gmail"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g. john.doe@company.com"
                />
              </div>
              <div className="lg:col-span-3 sm:col-span-2 col-span-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaKey className="text-purple-400" /> Password</label>
                <div className="flex flex-col gap-2">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className="w-full border-2 border-purple-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 placeholder:text-gray-400 text-base text-gray-800 bg-purple-50/80 shadow-md transition-all duration-200 font-mono font-semibold animate-inputPulse"
                    placeholder="Enter password"
                  />
                  <button
                    type="button"
                    className="text-purple-400 hover:text-purple-700 focus:outline-none text-xs self-start mt-1 transition-colors"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" /><path strokeLinecap="round" strokeLinejoin="round" d="M17.94 17.94A10.97 10.97 0 0112 19c-5.52 0-10-4.48-10-10 0-2.21.72-4.25 1.94-5.94M9.88 9.88A3 3 0 0112 9c1.66 0 3 1.34 3 3 0 .39-.07.76-.18 1.11" /></svg>Hide Password</span>
                    ) : (
                      <span className="flex items-center gap-1"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>Show Password</span>
                    )}
                  </button>
                  <button
                    type="button"
                    className="w-full mt-1 px-3 py-2 text-sm font-semibold rounded-xl bg-gradient-to-r from-purple-100 to-purple-200 text-purple-700 hover:from-purple-200 hover:to-purple-300 border border-purple-200 shadow transition-all duration-150 animate-btnPulse"
                    onClick={() => setForm(f => ({ ...f, password: generateStrongPassword() }))}
                  >
                    Generate Strong Password
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <span className={`text-xs font-semibold ${getPasswordStrength(form.password) === "Strong" ? "text-green-600" : getPasswordStrength(form.password) === "Medium" ? "text-yellow-600" : "text-red-600"}`}>
                      Strength: {getPasswordStrength(form.password)}
                    </span>
                  </div>
                </div>
              </div>
              {/* Password Expiry Date */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaCalendarAlt className="text-purple-400" /> Password Expiry Date</label>
                <input
                  type="date"
                  name="expiryDate"
                  value={form.expiryDate || ""}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="Select expiry date (optional)"
                />
              </div>
              {/* Tags */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaTags className="text-purple-400" /> Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={form.tags || ""}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g. work, email, finance (optional)"
                />
              </div>
              {/* Employee Section */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
                <div className="flex items-center gap-2 mb-2 mt-2">
                  <span className="text-lg font-semibold text-purple-600">Employee/User(s)</span>
                  <div className="flex-1 h-px bg-gradient-to-r from-purple-200 to-transparent" />
                </div>
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-semibold mb-1 text-gray-700">Employee/User(s)</label>
                {form.employee.map((emp, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-1">
                    <input
                      type="text"
                      value={emp}
                      onChange={e => {
                        const updated = [...form.employee];
                        updated[idx] = e.target.value;
                        setForm(f => ({ ...f, employee: updated }));
                      }}
                      className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                      placeholder="e.g. John Doe"
                    />
                    {form.employee.length > 1 && (
                      <button type="button" className="text-red-500 hover:text-red-700 px-2 rounded-full bg-red-50 hover:bg-red-100 transition" onClick={() => {
                        setForm(f => ({ ...f, employee: f.employee.filter((_, i) => i !== idx) }));
                      }} title="Remove">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="text-xs text-purple-600 hover:text-purple-800 font-semibold px-2 py-1 rounded-xl border border-purple-100 bg-purple-50 mt-1 transition" onClick={() => setForm(f => ({ ...f, employee: [...f.employee, ""] }))}>
                  + Add Employee
                </button>
                {/* Display comma-separated employees below */}
                {employeeDisplay && (
                  <div className="mt-1 text-xs text-gray-500">Employees: <span className="font-semibold text-gray-700">{employeeDisplay}</span></div>
                )}
              </div>
              {/* Other Info Section */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g. Work, Personal"
                />
              </div>
              {/* Password Status/Usage Tag */}
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Password Status / Usage Tag</label>
                <select
                  name="usageTag"
                  value={form.usageTag}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                >
                  <option value="In Use">In Use</option>
                  <option value="Not In Use">Not In Use</option>
                  <option value="Expired">Expired</option>
                  <option value="Compromised">Compromised</option>
                  <option value="Pending">Pending</option>
                  <option value="Other">Other (specify in notes)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">URL</label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g. https://mail.google.com"
                />
              </div>
              <div className="lg:col-span-3 sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Created Date</label>
                <input
                  type="text"
                  name="createdAt"
                  value={new Date(form.createdAt).toLocaleString()}
                  readOnly
                  className="w-full border rounded-xl px-4 py-2 bg-gray-100 text-gray-500 text-xs cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="lg:col-span-3 sm:col-span-2 w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-3 rounded-2xl transition text-base shadow-xl mt-4 tracking-wide"
              >
                {initialData ? "Update Password" : "Add Password"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 