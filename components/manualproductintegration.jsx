import React, { useState, useEffect } from "react";
import useStoreProducts from "../hooks/useStoreProducts";

const generateProductId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

const ManualProductIntegration = ({ cid }) => {
  const [form, setForm] = useState({
    name: "",
    url: "",
    screenshot: "",
    description: "",
    category: "",
    price: "",
    email: "",
    tags: "",
    contactNumber: "",
    launchDate: "",
    companyName: "",
    version: "",
    website: "",
    supportHours: "",
    address: "",
    stock: "", // NEW FIELD
    brand: "", // NEW FIELD
  });
  const [customQuestions, setCustomQuestions] = useState([]);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const { addProduct, loading, error: hookError } = useStoreProducts(cid);

  useEffect(() => {
    console.log("ManualProductIntegration: cid=", cid);
    if (hookError) {
      setError(hookError);
      console.error("Firestore error:", hookError);
    }
  }, [cid, hookError]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCustomQuestionChange = (idx, field, value) => {
    setCustomQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const addCustomQuestion = () => {
    setCustomQuestions((prev) => [...prev, { question: "", answer: "" }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);
    if (!cid) {
      setError("Company ID is missing. Please reload the page or contact support.");
      return;
    }
    if (!form.name) {
      setError("Product name is required.");
      return;
    }
    try {
      await addProduct({
        ...form,
        customQuestions,
        productId: generateProductId(),
      });
      setSubmitted(true);
      setForm({
        name: "",
        url: "",
        screenshot: "",
        description: "",
        category: "",
        price: "",
        email: "",
        tags: "",
        contactNumber: "",
        launchDate: "",
        companyName: "",
        version: "",
        website: "",
        supportHours: "",
        address: "",
        stock: "", // NEW FIELD
        brand: "", // NEW FIELD
      });
      setCustomQuestions([]);
    } catch (err) {
      setError("Failed to submit product. Please try again.");
    }
  };

  return (
    <div className="p-2 sm:p-4 bg-white rounded-xl shadow-md w-full">
      <h2 className="text-3xl font-bold text-[#7c3aed] mb-4">Add Your Product</h2>
      <p className="text-lg text-gray-700 mb-2">Fill out the form below to manually add your product for advanced control and customization.</p>
      <ol className="list-decimal pl-6 text-gray-600 mb-6">
        <li>Download the integration template</li>
        <li>Fill in your product details as per the instructions</li>
        <li>Upload the completed template to our platform</li>
        <li>Verify and activate your integration</li>
      </ol>
      <form onSubmit={handleSubmit} className="space-y-4 grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Product Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="Enter product name"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Product URL</label>
          <input
            type="url"
            name="url"
            value={form.url}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="https://yourproduct.com"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Screenshot URL</label>
          <input
            type="url"
            name="screenshot"
            value={form.screenshot}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="https://example.com/screenshot.png"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            rows={3}
            placeholder="Describe your product"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Category</label>
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="e.g. SaaS, E-commerce, Tool"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Price</label>
          <input
            type="number"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="Enter price in USD"
            min="0"
            step="0.01"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Contact Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="contact@yourproduct.com"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Tags</label>
          <input
            type="text"
            name="tags"
            value={form.tags}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="e.g. productivity, ai, finance"
          />
        </div>
        {/* New fields start here */}
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Contact Number</label>
          <input
            type="tel"
            name="contactNumber"
            value={form.contactNumber}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="+1 234 567 8900"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Product Launch Date</label>
          <input
            type="date"
            name="launchDate"
            value={form.launchDate}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] text-gray-900"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Company Name</label>
          <input
            type="text"
            name="companyName"
            value={form.companyName}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="Your company name"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Product Version</label>
          <input
            type="text"
            name="version"
            value={form.version}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="e.g. 1.0.0"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Website (if different)</label>
          <input
            type="url"
            name="website"
            value={form.website}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="https://companywebsite.com"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Support Hours</label>
          <input
            type="text"
            name="supportHours"
            value={form.supportHours}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="e.g. 9am - 5pm, Mon-Fri"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Stock</label>
          <input
            type="number"
            name="stock"
            value={form.stock}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="Enter available stock"
            min="0"
            step="1"
          />
        </div>
        <div className="col-span-1">
          <label className="block text-gray-700 font-medium mb-1">Brand</label>
          <input
            type="text"
            name="brand"
            value={form.brand}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="Enter brand name"
          />
        </div>
        <div className="col-span-1 sm:col-span-2">
          <label className="block text-gray-700 font-medium mb-1">Address/Location</label>
          <input
            type="text"
            name="address"
            value={form.address}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
            placeholder="123 Main St, City, Country"
          />
        </div>
        {/* Custom Questions */}
        <div className="col-span-1 sm:col-span-2">
          <button
            type="button"
            onClick={addCustomQuestion}
            className="mb-2 bg-gray-100 text-[#7c3aed] px-4 py-2 rounded hover:bg-gray-200 transition w-full sm:w-auto"
          >
            + Add Custom Question
          </button>
          {customQuestions.map((q, idx) => (
            <div key={idx} className="flex flex-col sm:flex-row gap-2 mb-2">
              <input
                type="text"
                value={q.question}
                onChange={e => handleCustomQuestionChange(idx, 'question', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
                placeholder={`Custom question #${idx + 1}`}
              />
              <input
                type="text"
                value={q.answer}
                onChange={e => handleCustomQuestionChange(idx, 'answer', e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-500 text-gray-900"
                placeholder="Answer"
              />
            </div>
          ))}
        </div>
        <div className="col-span-1 sm:col-span-2 flex justify-center">
          <button
            type="submit"
            className="bg-[#7c3aed] text-white px-6 py-2 rounded hover:bg-[#5b21b6] transition w-full sm:w-auto"
          >
            Submit Product
          </button>
        </div>
        {submitted && (
          <div className="col-span-1 sm:col-span-2 mt-4 text-green-600 font-semibold text-center">Product submitted successfully!</div>
        )}
        {error && (
          <div className="col-span-1 sm:col-span-2 mt-4 text-red-600 font-semibold text-center">{error}</div>
        )}
      </form>
    </div>
  );
};

export default ManualProductIntegration;
