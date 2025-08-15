import React, { useState } from "react";
import { FaCalendarAlt, FaFlag } from "react-icons/fa";
import useFetchInterns from "../hooks/useFetchInterns";

// TaskForm Component - Intern assignment only
const TaskForm = ({ onClose, onAdd, companyId, initialData }) => {
  const [form, setForm] = useState({
    assignedBy: initialData?.assignedBy || "",
    title: initialData?.title || "",
    description: initialData?.description || "",
    // Store selected intern IDs
    assignedIntern: Array.isArray(initialData?.assignedIntern)
      ? initialData.assignedIntern
      : [],
    priority: initialData?.priority || "Medium",
    dueDate: initialData?.dueDate || "",
    category: initialData?.category || "",
    status: initialData?.status || "Pending",
    notes: initialData?.notes || "",
    createdAt: initialData?.createdAt || new Date().toISOString(),
    links: initialData?.links || [],
  });
  const [error, setError] = useState("");
  const [showInternDropdown, setShowInternDropdown] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch real interns for this company
  const { interns, loading: internsLoading, error: internsError } = useFetchInterns(companyId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      // Create task entries for each selected intern id
      form.assignedIntern.forEach((internId) => {
        const intern = interns.find((int) => int.id === internId);
        if (intern) {
          const internName = `${intern.firstName || ""} ${intern.lastName || ""}`.trim();
          onAdd({
            name: internName || intern.email || intern.id,
            email: intern.email,
            role: "intern",
            type: "intern",
            internId: intern.id,
            taskName: form.title,
            description: form.description,
            assignedBy: form.assignedBy,
            links: (form.links || []).filter((link) => (link || "").trim() !== ""),
            dueDate: form.dueDate,
            priority: form.priority,
            category: form.category,
            notes: form.notes,
          });
        }
      });

      onClose();
    } catch (error) {
      setError("Failed to assign task. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInternChange = (internId) => {
    setForm((prev) => {
      const isSelected = prev.assignedIntern.includes(internId);
      if (isSelected) {
        return { ...prev, assignedIntern: prev.assignedIntern.filter((id) => id !== internId) };
      } else {
        return { ...prev, assignedIntern: [...prev.assignedIntern, internId] };
      }
    });
  };

  // Links helpers
  const addLink = () => setForm((prev) => ({ ...prev, links: [...prev.links, ""] }));
  const updateLink = (index, value) =>
    setForm((prev) => ({ ...prev, links: prev.links.map((l, i) => (i === index ? value : l)) }));
  const removeLink = (index) => setForm((prev) => ({ ...prev, links: prev.links.filter((_, i) => i !== index) }));

  return (
    <div className="bg-white/80 border border-green-200 rounded-3xl shadow-2xl w-full max-w-[772px] p-0 relative animate-modalIn backdrop-blur-xl ring-1 ring-green-100 animate-premiumModalIn">
      <div className="w-full h-full max-h-[90vh] flex flex-col">
        <button
          className="absolute top-3 right-3 text-gray-400 hover:text-green-500 text-2xl transition-colors rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-green-300 bg-white/70 shadow-md hover:bg-green-100"
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
          <h2 className="text-2xl font-extrabold mb-1 text-green-700 tracking-tight drop-shadow-sm">Assign New Task</h2>
          <div className="h-1 w-24 bg-gradient-to-r from-green-400 via-pink-400 to-green-600 rounded-full mb-3 animate-shimmer" />
          <p className="mb-4 text-gray-500 text-sm">Fill in the details below to assign a new task.</p>
        </div>
        <div className="flex-1 overflow-x-auto px-4 pb-8">
          <form
            onSubmit={handleSubmit}
            className="min-w-[340px] sm:min-w-0 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8 text-gray-800 bg-white/70 rounded-2xl p-6 shadow-lg ring-1 ring-green-50 animate-fadeIn"
          >
            {/* Task Info */}
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Assigned By <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="assignedBy"
                value={form.assignedBy}
                onChange={(e) => setForm({ ...form, assignedBy: e.target.value })}
                required
                className="w-full border-2 border-green-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400 text-base text-gray-800 bg-green-50/80 shadow-md transition-all duration-200 font-semibold animate-inputPulse"
                placeholder="Enter your name"
              />
            </div>
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Task Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                required
                className="w-full border-2 border-green-300 rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 placeholder:text-gray-400 text-base text-gray-800 bg-green-50/80 shadow-md transition-all duration-200 font-semibold animate-inputPulse"
                placeholder="Enter task title"
              />
            </div>
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
              <label className="block text-xs font-semibold mb-1 text-gray-700">
                Description <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                required
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200"
                placeholder="Enter task description..."
                rows={3}
              />
            </div>

            {/* Links */}
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-700">Links</label>
                <button
                  type="button"
                  onClick={addLink}
                  className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                >
                  Add Link
                </button>
              </div>
              {form.links.length > 0 && (
                <div className="space-y-2">
                  {form.links.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="url"
                        value={link}
                        onChange={(e) => updateLink(index, e.target.value)}
                        className="flex-1 border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 placeholder:text-gray-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200"
                        placeholder="Enter link URL..."
                      />
                      <button
                        type="button"
                        onClick={() => removeLink(index)}
                        className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-lg transition-colors duration-200"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2">
                <FaFlag className="text-green-400" /> Priority
              </label>
              <select
                name="priority"
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            {/* Due Date */}
            <div>
              <label className="text-xs font-semibold mb-1 text-gray-700 flex items-center gap-2">
                <FaCalendarAlt className="text-green-400" /> Due Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="dueDate"
                value={form.dueDate || ""}
                onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                required
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder:text-gray-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200"
                placeholder="Select due date"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold mb-1 text-gray-700">Category</label>
              <select
                name="category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200"
              >
                <option value="">Select Department</option>
                <option value="Software Development">Software Development</option>
                <option value="SEO">SEO</option>
                <option value="UI/UX Design">UI/UX Design</option>
                <option value="Content Writing">Content Writing</option>
                <option value="Social Media Management">Social Media Management (SMM)</option>
              </select>
            </div>

            {/* Assigned Intern */}
            <div className="col-span-1 sm:col-span-2 lg:col-span-3 mt-2">
              <div className="flex items-center gap-2 mb-2 mt-2">
                <span className="text-lg font-semibold text-green-600">Assigned Intern</span>
                <div className="flex-1 h-px bg-gradient-to-r from-green-200 to-transparent" />
              </div>
            </div>
            <div className="relative mb-8">
              <label className="block text-xs font-semibold mb-1 text-gray-700">Select Intern(s)</label>
              <button
                type="button"
                onClick={() => setShowInternDropdown(!showInternDropdown)}
                className="w-full border rounded-xl px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-400 text-sm text-gray-800 bg-green-50/60 shadow transition-all duration-200 text-left flex items-center justify-between"
                disabled={internsLoading}
              >
                <span>
                  {internsLoading
                    ? "Loading interns..."
                    : form.assignedIntern.length > 0
                      ? `${form.assignedIntern.length} intern(s) selected`
                      : "Select an intern..."}
                </span>
                <svg
                  className={`w-4 h-4 transition-transform ${showInternDropdown ? "rotate-180" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {showInternDropdown && !internsLoading && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                  {interns && interns.length > 0 ? (
                    interns.map((intern) => {
                      const internName = `${intern.firstName || ""} ${intern.lastName || ""}`.trim() || intern.email || intern.id;
                      const isSelected = form.assignedIntern.includes(intern.id);
                      return (
                        <label key={intern.id} className="flex items-start px-4 py-3 hover:bg-green-50 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleInternChange(intern.id)}
                            className="mr-3 mt-0.5 text-green-600 focus:ring-green-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-700">{internName}</div>
                            <div className="text-xs text-gray-500">{intern.id}</div>
                          </div>
                        </label>
                      );
                    })
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-500">No interns found.</div>
                  )}
                </div>
              )}
              {internsError && (
                <div className="mt-2 text-xs text-red-600">{internsError}</div>
              )}
            </div>

            {/* Created Date */}
            <div className="lg:col-span-3 sm:col-span-2 col-span-1">
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
              disabled={isSubmitting}
              className="lg:col-span-3 sm:col-span-2 w-full bg-gradient-to-r from-green-500 to-green-700 hover:from-green-600 hover:to-green-800 text-white font-semibold py-3 rounded-2xl transition text-base shadow-xl mt-4 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                <>Assign Task</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Main AssignTaskModal component
const AssignTaskModal = ({ open, onClose, initialData, onAdd, companyId }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-white/80 to-green-100/80 backdrop-blur-[6px]">
      <TaskForm onClose={onClose} onAdd={onAdd} companyId={companyId} initialData={initialData} />
    </div>
  );
};

export default AssignTaskModal;
