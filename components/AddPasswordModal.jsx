import React, { useState } from "react";

export default function AddPasswordModal({ open, onClose, onAdd, initialData }) {
  const [form, setForm] = useState(initialData ? {
    ...initialData,
    employee: Array.isArray(initialData.employee) ? initialData.employee : initialData.employee ? [initialData.employee] : [""],
    createdAt: initialData.createdAt || new Date().toISOString(),
  } : {
    website: "",
    username: "",
    password: "",
    employee: [""],
    category: "",
    url: "",
    notes: "",
    Created: "",
    securityLevel: "Medium",
    createdAt: new Date().toISOString(),
  });
  const [customFields, setCustomFields] = useState([]); // [{question: '', answer: ''}]
  const [error, setError] = useState("");

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
      setForm({ website: "", username: "", password: "", employee: "", category: "", url: "", notes: "", Created: "", securityLevel: "Medium", createdAt: new Date().toISOString() });
      setCustomFields([]);
    }
    onClose();
  };

  // Responsive modal with side scroller for form
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm">
      <div className="bg-white border-2 border-purple-400 rounded-2xl shadow-2xl w-full max-w-2xl p-0 relative animate-modalIn">
        <div className="w-full h-full max-h-[90vh] flex flex-col">
          <button
            className="absolute top-3 right-3 text-gray-400 hover:text-purple-400 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-purple-300"
            onClick={onClose}
            aria-label="Close"
            style={{ lineHeight: 1 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
          <h2 className="text-lg font-bold mb-2 text-purple-400 px-6 pt-6">{initialData ? "Edit Password" : "Add New Password"}</h2>
          <p className="mb-4 text-gray-500 text-xs px-6">Fill in the details below to securely store a new password.</p>
          <div className="flex-1 overflow-x-auto px-2 pb-6">
            <form onSubmit={handleSubmit} className="min-w-[340px] sm:min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-3 gap-y-3 text-gray-800">
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Website/Service</label>
                <input
                  type="text"
                  name="website"
                  value={form.website}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="e.g. Gmail"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Username</label>
                <input
                  type="text"
                  name="username"
                  value={form.username}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="e.g. john.doe@company.com"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Password</label>
                <input
                  type="password"
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="Enter password"
                />
              </div>
              <div className="sm:col-span-2 lg:col-span-1">
                <label className="block text-xs font-medium mb-1 text-gray-800">Employee/User(s)</label>
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
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                      placeholder="e.g. John Doe"
                    />
                    {form.employee.length > 1 && (
                      <button type="button" className="text-red-500 hover:text-red-700 px-2" onClick={() => {
                        setForm(f => ({ ...f, employee: f.employee.filter((_, i) => i !== idx) }));
                      }} title="Remove">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="text-xs text-purple-600 hover:text-purple-800 font-semibold px-2 py-1 rounded border border-purple-100 bg-purple-50 mt-1" onClick={() => setForm(f => ({ ...f, employee: [...f.employee, ""] }))}>
                  + Add Employee
                </button>
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Category</label>
                <input
                  type="text"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="e.g. Work, Personal"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">URL</label>
                <input
                  type="url"
                  name="url"
                  value={form.url}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="e.g. https://mail.google.com"
                />
              </div>
              <div className="lg:col-span-3 sm:col-span-2">
                <label className="block text-xs font-medium mb-1 text-gray-800">Notes</label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                  placeholder="Any additional notes..."
                  rows={2}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Created Date</label>
                <input
                  type="date"
                  name="created"
                  value={form.created}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-sm text-gray-800 bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Security Level</label>
                <select
                  name="securityLevel"
                  value={form.securityLevel}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 text-sm text-gray-800 bg-gray-50"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>
              {/* Custom Q&A fields */}
              <div className="lg:col-span-3 sm:col-span-2 mt-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-medium text-gray-800">Custom Questions & Answers</label>
                  <button
                    type="button"
                    className="text-xs text-purple-600 hover:text-purple-800 font-semibold px-2 py-1 rounded border border-purple-100 bg-purple-50 ml-2"
                    onClick={handleAddCustomField}
                  >
                    + Add Custom Field
                  </button>
                </div>
                {customFields.map((field, idx) => (
                  <div key={idx} className="flex gap-2 mb-2 items-center">
                    <input
                      type="text"
                      value={field.question}
                      onChange={e => handleCustomFieldChange(idx, "question", e.target.value)}
                      className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-xs text-gray-800 bg-gray-50"
                      placeholder="Custom Question"
                    />
                    <input
                      type="text"
                      value={field.answer}
                      onChange={e => handleCustomFieldChange(idx, "answer", e.target.value)}
                      className="flex-1 border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-purple-400 placeholder:text-gray-500 text-xs text-gray-800 bg-gray-50"
                      placeholder="Answer"
                    />
                    <button
                      type="button"
                      className="text-xs text-red-500 hover:text-red-700 px-2"
                      onClick={() => handleRemoveCustomField(idx)}
                      title="Remove"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                ))}
              </div>
              {error && <div className="lg:col-span-3 sm:col-span-2 text-red-500 text-xs">{error}</div>}
              <div>
                <label className="block text-xs font-medium mb-1 text-gray-800">Created At</label>
                <input
                  type="text"
                  name="createdAt"
                  value={new Date(form.createdAt).toLocaleString()}
                  readOnly
                  className="w-full border rounded px-3 py-2 bg-gray-100 text-gray-500 text-xs cursor-not-allowed"
                />
              </div>
              <button
                type="submit"
                className="lg:col-span-3 sm:col-span-2 w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded transition text-sm shadow"
              >
                Add Password
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 