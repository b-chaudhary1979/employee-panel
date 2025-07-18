import React, { useState } from "react";

/**
 * Product Detail Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {Object} props.product
 * @param {function} [props.onSave] - Called with updated product on save
 */
export default function ProductDetailModal({ open, onClose, product, onSave }) {
  const [editMode, setEditMode] = useState(false);
  const [editedProduct, setEditedProduct] = useState(product || {});
  const [customQuestions, setCustomQuestions] = useState((product && (product.customQuestions || product.customQA)) || []);

  React.useEffect(() => {
    setEditedProduct(product || {});
    setCustomQuestions((product && (product.customQuestions || product.customQA)) || []);
  }, [product]);

  if (!open || !product) return null;

  // Helper for product icon
  const ProductIcon = () => (
    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center shadow-lg mb-2">
      <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2"/></svg>
    </div>
  );

  // Handle edit form changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditedProduct((prev) => ({ ...prev, [name]: value }));
  };

  // Handle status pill click
  const handleStatusChange = (status) => {
    setEditedProduct((prev) => ({ ...prev, status }));
  };

  // Handle custom Q&A changes
  const handleCustomQuestionChange = (idx, field, value) => {
    setCustomQuestions((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };
  const addCustomQuestion = () => {
    setCustomQuestions((prev) => [...prev, { question: '', answer: '' }]);
  };

  // Handle save (calls parent onSave)
  const handleSave = (e) => {
    e.preventDefault();
    if (onSave) {
      onSave({ ...editedProduct, customQuestions });
    }
    setEditMode(false);
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md p-2 sm:p-4">
      <div className="relative w-[95vw] max-w-[95vw] sm:w-full sm:max-w-[900px] mx-auto p-0 sm:p-6 pointer-events-auto max-h-[90vh] flex items-center justify-center">
        <div className="bg-white border-2 border-purple-400 rounded-2xl p-0 sm:p-0 overflow-y-auto w-full max-h-[85vh] flex flex-col shadow-2xl">
          {/* Top Card */}
          <div className="flex flex-col items-center justify-center pt-8 pb-4 bg-gradient-to-r from-purple-100 via-pink-50 to-blue-100 rounded-t-2xl border-b border-purple-200 relative">
            {/* Back Arrow Button */}
            <button
              className="absolute top-4 left-4 flex items-center gap-2 px-4 py-2 hover:bg-purple-300 rounded text-purple-700 font-semibold text-lg md:text-xl z-20"
              onClick={onClose}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
            </button>
            <ProductIcon />
            <h2 className="text-3xl font-extrabold text-purple-500 mb-1 tracking-tight">Product Detail</h2>
            <span className="text-gray-500 text-lg font-medium">ID: #{product.id || product.productId}</span>
          </div>

          {/* Product Details Section */}
          <div className="px-6 py-8 bg-white/90 rounded-2xl m-6 mt-6 border border-purple-100 shadow flex flex-col gap-6">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-7 h-7 text-purple-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="4" y="7" width="16" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/><path d="M16 3v4M8 3v4" stroke="currentColor" strokeWidth="2"/></svg>
              <h3 className="text-2xl font-bold text-purple-400 tracking-tight">Product Information</h3>
              <span className="text-sm font-semibold text-gray-500 ml-auto">Edit</span>
              <button onClick={() => setEditMode((v) => !v)} className={`w-10 h-6 rounded-full ${editMode ? 'bg-green-500' : 'bg-gray-300'} flex items-center transition-colors duration-300`} title="Edit">
                <span className={`w-5 h-5 rounded-full bg-white shadow-md transform transition-transform duration-300 ${editMode ? 'translate-x-4' : ''}`}></span>
              </button>
            </div>
            {!editMode ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6">
                <div><span className="text-xs text-purple-400 font-bold uppercase">Product Name</span><br/><span className="text-xl text-gray-800 font-bold">{product.name}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Brand</span><br/><span className="text-xl text-gray-800">{product.brand}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Price</span><br/><span className="text-xl text-gray-800">{product.price ? `$${Number(product.price).toFixed(2)}` : '-'}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Stock</span><br/><span className="text-xl text-gray-800">{product.stock ? `${product.stock} units` : '-'}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Category</span><br/><span className="text-xl text-gray-800">{product.category}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Status</span><br/><span className="text-xl text-green-700 font-semibold">{product.status || 'Active'}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Company</span><br/><span className="text-xl text-gray-800">{product.companyName}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Version</span><br/><span className="text-xl text-gray-800">{product.version}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Website</span><br/><span className="text-xl text-blue-700 underline">{product.website}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Support Hours</span><br/><span className="text-xl text-gray-800">{product.supportHours}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Address</span><br/><span className="text-xl text-gray-800">{product.address}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Contact Email</span><br/><span className="text-xl text-gray-800">{product.email}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Contact Number</span><br/><span className="text-xl text-gray-800">{product.contactNumber}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Launch Date</span><br/><span className="text-xl text-gray-800">{product.launchDate}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Tags</span><br/><span className="text-xl text-gray-800">{product.tags}</span></div>
                <div><span className="text-xs text-purple-400 font-bold uppercase">Description</span><br/><span className="text-base text-gray-700">{product.description}</span></div>
              </div>
            ) : (
              <form className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-6" onSubmit={handleSave}>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Product Name</label><input type="text" name="name" value={editedProduct.name || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" required /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Brand</label><input type="text" name="brand" value={editedProduct.brand || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Price</label><input type="number" name="price" value={editedProduct.price || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" min="0" step="0.01" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Stock</label><input type="number" name="stock" value={editedProduct.stock || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" min="0" step="1" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Category</label><input type="text" name="category" value={editedProduct.category || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Status</label><input type="text" name="status" value={editedProduct.status || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Company</label><input type="text" name="companyName" value={editedProduct.companyName || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Version</label><input type="text" name="version" value={editedProduct.version || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Website</label><input type="url" name="website" value={editedProduct.website || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Support Hours</label><input type="text" name="supportHours" value={editedProduct.supportHours || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Address</label><input type="text" name="address" value={editedProduct.address || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Contact Email</label><input type="email" name="email" value={editedProduct.email || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Contact Number</label><input type="text" name="contactNumber" value={editedProduct.contactNumber || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Launch Date</label><input type="date" name="launchDate" value={editedProduct.launchDate || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div><label className="block text-xs font-bold text-purple-400 mb-1">Tags</label><input type="text" name="tags" value={editedProduct.tags || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" /></div>
                <div className="md:col-span-2"><label className="block text-xs font-bold text-purple-400 mb-1">Description</label><textarea name="description" value={editedProduct.description || ''} onChange={handleChange} className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-xl text-gray-800" rows={3} /></div>
                {/* Status Pills */}
                <div className="md:col-span-2 mt-2 mb-2">
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Status</label>
                  <div className="flex gap-2 mt-1">
                    {['Active', 'Inactive', 'Pending'].map(option => (
                      <button
                        key={option}
                        type="button"
                        className={`px-2 py-1 rounded-full text-xs font-semibold focus:outline-none transition-colors duration-200 ${editedProduct.status === option ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700'} cursor-pointer`}
                        style={{ minWidth: 0, height: '28px', fontSize: '0.85rem' }}
                        onClick={() => handleStatusChange(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>
              </form>
            )}
          </div>

          {/* Custom Q&A Section */}
          <div className="px-6 pb-8">
            <div className="flex items-center gap-2 mb-3 mt-2">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 8.25v-1.5A2.25 2.25 0 0014.25 4.5h-4.5A2.25 2.25 0 007.5 6.75v1.5m9 0v8.25A2.25 2.25 0 0114.25 18H9.75A2.25 2.25 0 017.5 16.5V8.25m9 0H7.5" /></svg>
              <h3 className="text-xl font-bold text-blue-400 tracking-tight">Custom Q&A</h3>
            </div>
            {!editMode ? (
              <>
                {customQuestions.length === 0 && <div className="text-base text-gray-400">No custom questions.</div>}
                <div className="space-y-4">
                  {customQuestions.map((qa, idx) => (
                    <div key={idx} className="bg-white border border-blue-100 rounded-xl px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 shadow">
                      <div className="flex-1">
                        <span className="font-bold text-black text-lg md:text-xl">Q:</span> <span className="font-semibold text-black text-lg md:text-xl">{qa.question}</span>
                      </div>
                      <div className="flex-1 border-t md:border-t-0 md:border-l border-blue-100 md:pl-6 pt-3 md:pt-0 mt-3 md:mt-0">
                        <span className="font-bold text-black text-lg md:text-xl">A:</span> <span className="font-semibold text-black text-lg md:text-xl">{qa.answer}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {customQuestions.length === 0 && <div className="text-base text-gray-400">No custom questions.</div>}
                <div className="space-y-4">
                  {customQuestions.map((qa, idx) => (
                    <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                      <input
                        type="text"
                        placeholder="Question"
                        value={qa.question}
                        onChange={e => handleCustomQuestionChange(idx, 'question', e.target.value)}
                        className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-xl text-gray-800"
                      />
                      <input
                        type="text"
                        placeholder="Answer"
                        value={qa.answer}
                        onChange={e => handleCustomQuestionChange(idx, 'answer', e.target.value)}
                        className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-xl text-gray-800"
                      />
                    </div>
                  ))}
                </div>
                <button type="button" onClick={addCustomQuestion} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
              </>
            )}
          </div>

          {/* Save/Cancel in edit mode at bottom of modal */}
          {editMode && (
            <div className="flex justify-end gap-4 px-8 pb-8">
              <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded hover:bg-gray-400 transition font-semibold" onClick={() => { setEditMode(false); setEditedProduct(product); setCustomQuestions(product.customQuestions || product.customQA || []); }}>Cancel</button>
              <button type="button" className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 transition font-semibold" onClick={handleSave}>Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 