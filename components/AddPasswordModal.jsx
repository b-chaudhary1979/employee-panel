import React, { useState } from "react";
import { FaKey, FaTags } from "react-icons/fa";

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

export default function AddPasswordModalEmployee({ open, onClose, onAdd, initialData, employeeName }) {
  const [form, setForm] = useState(initialData ? {
    ...initialData,
    employee: [employeeName],
    createdAt: initialData.createdAt || new Date().toISOString(),
  } : {
    website: "",
    username: "",
    password: "",
    employee: [employeeName],
    url: "",
    notes: "",
    createdAt: new Date().toISOString(),
    securityLevel: "Medium",
    passwordHint: "",
    usageTag: "In Use",
  });

  const [showPassword, setShowPassword] = useState(false);

  if (!open) return null;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAdd({ ...form });
    if (!initialData) {
      setForm({
        website: "",
        username: "",
        password: "",
        employee: [employeeName],
        url: "",
        notes: "",
        createdAt: new Date().toISOString(),
        securityLevel: "Medium",
        passwordHint: "",
        usageTag: "In Use",
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 to-purple-100/80 backdrop-blur-[6px]">
      <div className="bg-white/80 border border-purple-200 rounded-3xl shadow-2xl w-full max-w-2xl p-0 relative animate-modalIn backdrop-blur-xl ring-1 ring-purple-100">
        <div className="w-full h-full max-h-[90vh] flex flex-col">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-purple-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-purple-300 bg-white/70 shadow-md hover:bg-purple-100"
            onClick={onClose}
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="2" fill="none" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-2xl font-extrabold mb-1 text-purple-700 tracking-tight drop-shadow-sm">{initialData ? "Edit Password" : "Add New Password"}</h2>
            <div className="h-1 w-24 bg-gradient-to-r from-purple-400 via-pink-400 to-purple-600 rounded-full mb-3 animate-shimmer" />
            <p className="mb-4 text-gray-500 text-sm">Fill in the details below to store your password securely.</p>
          </div>
          <div className="flex-1 overflow-x-auto px-4 pb-8">
            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6 text-gray-800 bg-white/70 rounded-2xl p-6 shadow-lg ring-1 ring-purple-50 animate-fadeIn">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700">Logged-in Employee</label>
                <input
                  type="text"
                  value={employeeName}
                  readOnly
                  className="w-full border rounded-xl px-4 py-2 bg-gray-100 text-gray-700 text-sm cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Website/Service</label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm bg-purple-50/60 shadow"
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
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm bg-purple-50/60 shadow"
                  placeholder="e.g. john.doe@gmail.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaKey className="text-purple-400" /> Password</label>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border-2 border-purple-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm font-mono bg-purple-50/80 shadow-md"
                  placeholder="Enter your password"
                />
                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="text-xs text-purple-500 hover:text-purple-700"
                  >
                    {showPassword ? "Hide Password" : "Show Password"}
                  </button>
                  <button
                    type="button"
                    className="text-xs font-semibold bg-purple-100 border border-purple-200 px-3 py-1 rounded-lg hover:bg-purple-200"
                    onClick={() => setForm(f => ({ ...f, password: generateStrongPassword() }))}
                  >
                    Generate Strong Password
                  </button>
                  <span className={`text-xs font-semibold ${getPasswordStrength(form.password) === "Strong" ? "text-green-600" : getPasswordStrength(form.password) === "Medium" ? "text-yellow-600" : "text-red-600"}`}>
                    Strength: {getPasswordStrength(form.password)}
                  </span>
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700">URL</label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm bg-purple-50/60 shadow"
                  placeholder="e.g. https://example.com"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2"><FaTags className="text-purple-400" /> Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm bg-purple-50/60 shadow"
                  rows={2}
                  placeholder="Optional notes..."
                />
              </div>
              <div>
                <label className="block text-xs font-semibold mb-1 text-gray-700">Security Level</label>
                <select
                  name="securityLevel"
                  value={form.securityLevel}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              <div className="lg:col-span-3 sm:col-span-2">
                <label className="block text-xs font-semibold mb-1 text-gray-700">Password Hint (optional)</label>
                <textarea
                  name="passwordHint"
                  value={form.passwordHint || ""}
                  onChange={handleChange}
                  className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-400 text-sm text-gray-800 bg-purple-50/60 shadow transition-all duration-200"
                  placeholder="e.g., Favorite childhood pet"
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
                className="sm:col-span-2 w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold py-3 rounded-2xl transition text-base shadow-xl mt-4 tracking-wide"
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
