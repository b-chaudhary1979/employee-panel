import React, { useState, useEffect } from "react";
import useStoreProducts from "../hooks/useStoreProducts";
import { useRouter } from "next/router";

const generateProductId = () => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2);
  return `PROD-${timestamp}-${random}`;
};

const ManualProductIntegration = ({ 
  cid, 
  sharedFormData, 
  updateSharedFormData, 
  sharedCustomQuestions, 
  updateSharedCustomQuestions, 
  clearFormData 
}) => {
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [showErrorPopup, setShowErrorPopup] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const { addProduct, loading, error: hookError } = useStoreProducts(cid);

  const statusOptions = [
    "Active",
    "Inactive", 
    "Pending",
    "Coming Soon",
    "Maintenance"
  ];

  useEffect(() => {
    if (hookError) {
      setError(hookError);
      setShowErrorPopup(true);
      setSubmitted(false);
      setShowSuccessPopup(false);
    }
  }, [cid, hookError]);

  // Handle clicking outside dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown]);

  // Handle redirect after successful submission
  useEffect(() => {
    if (showSuccessPopup && submitted && !error) {
      const timer = setTimeout(() => {
        setShowSuccessPopup(false);
        // Only redirect if we're still in a success state (no errors occurred during the timeout)
        if (submitted && !error) {
          const token = router.query.token;
          if (token) {
            router.push({
              pathname: "/products",
              query: { token }
            });
          }
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessPopup, submitted, error, router]);

  // Cancel redirect if error occurs after success popup
  useEffect(() => {
    if (error && showSuccessPopup) {
      setShowSuccessPopup(false);
    }
  }, [error, showSuccessPopup]);

  // Auto-hide error popup after 5 seconds
  useEffect(() => {
    if (showErrorPopup) {
      const timer = setTimeout(() => {
        setShowErrorPopup(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showErrorPopup]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateSharedFormData({ [name]: value });
  };

  const handleCustomQuestionChange = (idx, field, value) => {
    const updated = [...sharedCustomQuestions];
    updated[idx] = { ...updated[idx], [field]: value };
    updateSharedCustomQuestions(updated);
  };

  const addCustomQuestion = () => {
    updateSharedCustomQuestions([...sharedCustomQuestions, { question: "", answer: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    if (!cid) {
      const errorMessage = "Company ID is missing. Please reload the page or contact support.";
      setError(errorMessage);
      setShowErrorPopup(true);
      return;
    }
    
    // Check all required fields
    const requiredFields = [
      'productId', 'name', 'url', 'screenshot', 'description', 'category', 'price', 
      'email', 'tags', 'contactNumber', 'launchDate', 'companyName', 
      'version', 'website', 'supportHours', 'address', 'stock', 'brand'
    ];
    
    const missingFields = requiredFields.filter(field => !sharedFormData[field]);
    
    if (missingFields.length > 0) {
      const errorMessage = `Please fill in all required fields: ${missingFields.join(', ')}`;
      setError(errorMessage);
      setShowErrorPopup(true);
      return;
    }

    // Process and validate categories
    const categoryInput = sharedFormData.category.trim();
    if (!categoryInput) {
      const errorMessage = "Please enter at least one category.";
      setError(errorMessage);
      setShowErrorPopup(true);
      return;
    }

    // Parse categories: split by comma, trim, convert to title case, remove duplicates
    const categories = categoryInput
      .split(',')
      .map(cat => cat.trim())
      .filter(cat => cat.length > 0) // Remove empty categories
      .map(cat => cat.charAt(0).toUpperCase() + cat.slice(1).toLowerCase()) // Title case
      .filter((cat, index, arr) => arr.indexOf(cat) === index); // Remove duplicates

    if (categories.length === 0) {
      const errorMessage = "Please enter at least one valid category.";
      setError(errorMessage);
      setShowErrorPopup(true);
      return;
    }

    // Check if either status or customStatus is provided
    if (!sharedFormData.status && !sharedFormData.customStatus) {
      const errorMessage = "Please select a status or enter a custom status.";
      setError(errorMessage);
      setShowErrorPopup(true);
      return;
    }
    
    try {
      // Use custom status if provided, otherwise use dropdown status
      const finalStatus = sharedFormData.customStatus || sharedFormData.status;
      
      await addProduct({
        ...sharedFormData,
        categories: categories, // Store as array
        category: categories[0], // Keep first category for display
        status: finalStatus, // Use the final status value
        customQuestions: sharedCustomQuestions,
      });
      
      // Only set success states if no error occurred
      setSubmitted(true);
      setShowSuccessPopup(true);
      setShowErrorPopup(false); // Clear any existing error popup
      clearFormData(); // Clear the shared form data
    } catch (err) {
      // Show the specific error message from the hook
      const errorMessage = err.message || "Failed to submit product. Please try again.";
      setError(errorMessage);
      setShowErrorPopup(true);
      // Ensure success states are not set on error
      setSubmitted(false);
      setShowSuccessPopup(false);
      // DO NOT clear form data on error
    }
  };

  return (
    <>
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-green-500 to-green-400 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            Product added successfully!
          </div>
        </div>
      )}

      {/* Error Popup */}
      {showErrorPopup && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-red-400 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown max-w-md">
            <svg className="w-6 h-6 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <span className="break-words">{error}</span>
          </div>
        </div>
      )}






      
      <div className="p-2 sm:p-4 bg-white rounded-xl shadow-md w-full">
        <h2 className="text-3xl font-bold text-[#7c3aed] mb-4">Add Your Product</h2>
        <p className="text-lg text-gray-700 mb-2">Fill out the form below to manually add your product for advanced control and customization.</p>
        <ol className="list-decimal pl-6 text-gray-600 mb-6">
          <li>Download the integration template</li>
          <li>Fill in your product details as per the instructions</li>
          <li>Upload the completed template to our platform</li>
          <li>Verify and activate your integration</li>
        </ol>
        <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Product ID <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="productId"
              value={sharedFormData.productId}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="e.g. PROD-12345"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Product Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="name"
              value={sharedFormData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Enter product name"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Product URL <span className="text-red-500">*</span></label>
            <input
              type="url"
              name="url"
              value={sharedFormData.url}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="https://yourproduct.com"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Screenshot URL <span className="text-red-500">*</span></label>
            <input
              type="url"
              name="screenshot"
              value={sharedFormData.screenshot}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="https://example.com/screenshot.png"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Description <span className="text-red-500">*</span></label>
            <textarea
              name="description"
              value={sharedFormData.description}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              rows={3}
              placeholder="Describe your product"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Category <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="category"
              value={sharedFormData.category}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="e.g. SaaS, E-commerce, Tool"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Price <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="price"
              value={sharedFormData.price}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Enter price in USD"
              min="0"
              step="0.01"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Contact Email <span className="text-red-500">*</span></label>
            <input
              type="email"
              name="email"
              value={sharedFormData.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="contact@yourproduct.com"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Tags <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="tags"
              value={sharedFormData.tags}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="e.g. productivity, ai, finance"
              required
            />
          </div>
          {/* New fields start here */}
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Contact Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              name="contactNumber"
              value={sharedFormData.contactNumber}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="+1 234 567 8900"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Product Launch Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="launchDate"
              value={sharedFormData.launchDate}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-gray-900"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Company Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="companyName"
              value={sharedFormData.companyName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Your company name"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Product Version <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="version"
              value={sharedFormData.version}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="e.g. 1.0.0"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Website (if different) <span className="text-red-500">*</span></label>
            <input
              type="url"
              name="website"
              value={sharedFormData.website}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="https://companywebsite.com"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Support Hours <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="supportHours"
              value={sharedFormData.supportHours}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="e.g. 9am - 5pm, Mon-Fri"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Address <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="address"
              value={sharedFormData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Company address"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Stock <span className="text-red-500">*</span></label>
            <input
              type="number"
              name="stock"
              value={sharedFormData.stock}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Available units"
              min="0"
              required
            />
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Brand <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="brand"
              value={sharedFormData.brand}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Product brand"
              required
            />
          </div>
          <div className="col-span-1 relative status-dropdown-container">
            <label className="block text-gray-700 font-medium mb-1">Status</label>
            <div className="relative">
              <button
                type="button"
                onClick={() => !sharedFormData.customStatus && setShowStatusDropdown(!showStatusDropdown)}
                disabled={!!sharedFormData.customStatus}
                className={`w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-gray-900 bg-white text-left flex items-center justify-between ${sharedFormData.customStatus ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{sharedFormData.customStatus || sharedFormData.status || "Select Status"}</span>
                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showStatusDropdown && !sharedFormData.customStatus && (
                <div className="absolute top-full left-0 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto">
                  {statusOptions.map((option) => (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        updateSharedFormData({ status: option });
                        setShowStatusDropdown(false);
                      }}
                      className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none first:rounded-t-lg last:rounded-b-lg transition-colors duration-200"
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <div className="col-span-1">
            <label className="block text-gray-700 font-medium mb-1">Custom Status</label>
            <input
              type="text"
              name="customStatus"
              value={sharedFormData.customStatus || ""}
              onChange={(e) => {
                const customStatus = e.target.value;
                updateSharedFormData({ 
                  customStatus: customStatus,
                  status: customStatus ? "" : sharedFormData.status // Clear dropdown status if custom status is entered
                });
                if (customStatus) {
                  setShowStatusDropdown(false);
                }
              }}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
              placeholder="Enter custom status (optional)"
            />
          </div>
          {/* Custom Questions Section */}
          <div className="col-span-1 lg:col-span-2">
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-3">Custom Questions</h3>
              {sharedCustomQuestions.map((question, idx) => (
                <div key={idx} className="flex flex-col lg:flex-row gap-2 mb-2">
                  <input
                    type="text"
                    placeholder="Question"
                    value={question.question}
                    onChange={(e) => handleCustomQuestionChange(idx, "question", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
                    required
                  />
                  <input
                    type="text"
                    placeholder="Answer"
                    value={question.answer}
                    onChange={(e) => handleCustomQuestionChange(idx, "answer", e.target.value)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
                    required
                  />
                </div>
              ))}
              <button
                type="button"
                onClick={addCustomQuestion}
                className="text-[#7c3aed] hover:text-[#5b21b6] font-medium"
              >
                + Add Custom Question
              </button>
            </div>
          </div>
          {/* Submit Button */}
          <div className="col-span-1 lg:col-span-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#7c3aed] text-white py-3 px-6 rounded-lg font-semibold hover:bg-[#5b21b6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Submitting..." : "Submit Product"}
            </button>
          </div>

        </form>
      </div>
    </>
  );
};

export default ManualProductIntegration;
