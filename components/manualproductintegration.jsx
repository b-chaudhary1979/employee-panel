import React from "react";

export default function ManualProductIntegration({ onBack }) {
  return (
    <div className="w-full min-h-[80vh] flex flex-col gap-12 px-0 sm:px-12 py-12 bg-gradient-to-br from-[#f8f6ff] via-[#f3f4f6] to-[#e9e4fa] relative">
      <div className="flex items-center mb-8">
        <button
          className="flex items-center gap-2 px-6 py-3 bg-[#a259f7] hover:bg-[#7c3aed] text-white font-bold text-lg rounded-full shadow-lg transition-all duration-200 active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#a259f7] border-2 border-[#a259f7]"
          onClick={onBack || (() => window.history.back())}
        >
          <span className="text-2xl">&#8592;</span>
          <span>Back</span>
        </button>
      </div>
      <header className="mb-4">
        <h1 className="text-5xl sm:text-6xl font-extrabold text-[#a259f7] mb-3 tracking-tight drop-shadow-sm">Manual Product Integration</h1>
        <p className="text-2xl sm:text-3xl text-gray-600 font-medium max-w-3xl">Manually add your product details below. This method is ideal for custom or unique products.</p>
      </header>
      <section className="flex flex-col gap-10 w-full max-w-6xl mx-auto">
        <form className="flex flex-col gap-8 w-full">
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Product Name</label>
              <input type="text" className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl" placeholder="Enter product name" />
            </div>
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Brand</label>
              <input type="text" className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl" placeholder="Enter brand name" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Price ($)</label>
              <input type="number" className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl" placeholder="Enter price" />
            </div>
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Stock</label>
              <input type="number" className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl" placeholder="Enter stock quantity" />
            </div>
          </div>
          <div className="flex flex-col md:flex-row gap-8 w-full">
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Category</label>
              <input type="text" className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl" placeholder="Enter category" />
            </div>
            <div className="flex-1">
              <label className="block text-xl font-semibold text-gray-700 mb-2">Status</label>
              <select className="w-full px-6 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-[#a259f7] text-xl">
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>
          </div>
          <div className="w-full">
            <label className="block text-xl font-semibold text-gray-700 mb-2">Product Image</label>
            <input type="file" className="w-full px-6 py-3 rounded-xl border-2 border-gray-300 text-xl" />
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-10 py-4 bg-[#a259f7] hover:bg-[#7c3aed] text-white font-bold rounded-xl text-xl shadow-lg transition-all duration-200 active:scale-95">Add Product</button>
          </div>
        </form>
        <div className="border-t border-gray-200 pt-10">
          <h2 className="text-2xl font-bold text-gray-800 mb-3">Need Help?</h2>
          <p className="text-gray-600">Check our <a href="#" className="text-[#a259f7] underline">manual integration guide</a> or <a href="#" className="text-[#a259f7] underline">contact support</a> for assistance.</p>
        </div>
      </section>
    </div>
  );
} 