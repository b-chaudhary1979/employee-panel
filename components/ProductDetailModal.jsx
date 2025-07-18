import React from "react";

/**
 * Product Detail Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {Object} props.product
 */
export default function ProductDetailModal({ open, onClose, product }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open || !product) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-2 sm:p-4">
      <div className="relative w-[95vw] max-w-[95vw] sm:w-full sm:max-w-[850px] mx-auto p-0 sm:p-6 pointer-events-auto max-h-[80vh] sm:max-h-[640px] flex items-center justify-center">
        <div className="bg-white border-2 border-purple-500 rounded-xl p-4 sm:p-6 overflow-y-auto w-full max-h-[75vh] sm:max-h-[500px] flex flex-col">
          <h2 className="text-xl font-bold mb-4 text-black text-center">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-[15px] mb-4">
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Product Name</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{product.name}</span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Brand</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{product.brand}</span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Price</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">
                {typeof product.price === 'number' && !isNaN(product.price)
                  ? `$${product.price.toFixed(2)}`
                  : product.price && !isNaN(Number(product.price))
                  ? `$${Number(product.price).toFixed(2)}`
                  : '-'}
              </span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Stock</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{product.stock} units</span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Category</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{product.category}</span>
            </div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Status</span>
              <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-green-700 font-semibold">{product.status}</span>
            </div>
            {/* Product ID field removed as per user request */}
            {/* Add more fields here if your product object has more properties */}
          </div>
          <div className="flex justify-start items-center mt-4">
            <button className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-6 rounded-xl" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>
    </div>
  );
} 