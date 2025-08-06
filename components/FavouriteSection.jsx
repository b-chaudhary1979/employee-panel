import React, { useState, useRef } from "react";
import BgAnimation from "./bg-animation";
import { XMarkIcon, UserIcon, ChatBubbleLeftRightIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

export default function FavouriteSection({ images = [], videos = [], music = [], onRemoveFavourite }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // {item}
  const inputRef = useRef();

  const allFavourites = [
    ...images.map(img => ({ ...img, type: "image" })),
    ...videos.map(vid => ({ ...vid, type: "video" })),
    ...music.map(m => ({ ...m, type: "music" })),
  ];

  const filteredFavourites = allFavourites.filter(item => {
    const q = search.toLowerCase();
    return (
      (item.title && item.title.toLowerCase().includes(q)) ||
      (item.date && item.date.toLowerCase().includes(q)) ||
      (item.employee && item.employee.toLowerCase().includes(q)) ||
      (item.submitterName && item.submitterName.toLowerCase().includes(q)) ||
      (item.uploadedAt && item.uploadedAt.toLowerCase().includes(q))
    );
  });

  const handlePreview = (item) => {
    try {
      if (item.cloudinaryUrl) {
        // Open Cloudinary URL directly
        window.open(item.cloudinaryUrl, '_blank');
      } else if (item.url) {
        // Fallback to URL if cloudinaryUrl is not available
        window.open(item.url, '_blank');
      }
    } catch (error) {
      // Silently handle any errors
    }
  };



  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Favourites</h2>
        <p className="text-gray-500 text-base mt-1">Your premium collection of favourite items.</p>
      </div>
      {/* Premium Search Bar */}
      <div className="flex justify-between items-center mb-6 flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-96 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, date, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-purple-400 focus:border-purple-600 bg-gradient-to-r from-white via-[#f3e8ff] to-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-600 text-gray-900 transition"
            style={{ boxShadow: '0 2px 12px 0 rgba(124,58,237,0.08)' }}
          />
        </div>
      </div>
      {filteredFavourites.length === 0 ? (
        <div className="text-center text-gray-400 py-8">No favourites yet.</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredFavourites.map(item => (
            <div key={item.type + item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col items-stretch relative group cursor-pointer" onClick={() => setModal({ item })}>
              {/* Star icon */}
              <button
                className="absolute top-2 right-2 z-10 p-0.5 bg-[#7c3aed] rounded-full shadow-md hover:bg-[#5b21b6] transition"
                onClick={(e) => {
                  e.stopPropagation();
                  onRemoveFavourite && onRemoveFavourite(item);
                }}
                aria-label="Remove from Premium Favourites"
                title="Remove from Premium Favourites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </button>
              {item.type === "image" && (
                <img src={item.cloudinaryUrl} alt={item.title || 'Image'} className="w-full h-32 object-cover" />
              )}
              {item.type === "video" && (
                <video src={item.cloudinaryUrl} controls className="w-full h-32 object-cover" />
              )}
              {item.type === "music" && (
                <audio src={item.cloudinaryUrl} controls className="w-full mb-2" />
              )}
              <div className="flex justify-between items-center p-2 w-full">
                <span className="text-gray-700 font-medium text-xs">{item.submitterName || item.employee || 'Unknown'}</span>
                <span className="text-[#7c3aed] font-semibold text-sm">{item.title || 'Untitled'}</span>
              </div>
              <div className="px-2 pb-2 text-gray-500 text-xs">
                {item.date || (item.uploadedAt ? new Date(item.uploadedAt.seconds ? item.uploadedAt.seconds * 1000 : item.uploadedAt).toLocaleDateString() : '')}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn">
          <div className="absolute inset-0 -z-10">
            <BgAnimation />
          </div>

          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn bg-white border border-purple-200 rounded-2xl shadow-2xl flex flex-col items-center p-0" style={{animation: 'scaleIn 0.25s cubic-bezier(.4,2,.6,1)'}}>
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-white border border-purple-400 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-gray-700 shadow hover:bg-purple-50 hover:scale-110 transition-all duration-200 z-10"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {/* Info Row: Employee/Date left */}
            <div className="flex w-full justify-between items-center mb-4 p-6 pb-0">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-700 font-bold text-base">{modal.item.submitterName || modal.item.employee || 'Unknown'}</span>
                <span className="text-gray-700 text-sm">{modal.item.date || (modal.item.uploadedAt ? new Date(modal.item.uploadedAt.seconds ? modal.item.uploadedAt.seconds * 1000 : modal.item.uploadedAt).toLocaleDateString() : "-")}</span>
              </div>
            </div>
            {/* Media */}
            <div className="flex justify-center w-full mb-4 px-6">
              {modal.item.type === "image" && (
                <img
                  src={modal.item.cloudinaryUrl}
                  alt={modal.item.title || 'Image'}
                  className="rounded-xl shadow max-w-full max-h-64 object-contain border border-purple-100"
                  style={{ background: '#fff' }}
                />
              )}
              {modal.item.type === "video" && (
                <video
                  src={modal.item.cloudinaryUrl}
                  controls
                  className="rounded-xl shadow max-w-full max-h-64 object-contain border border-purple-100"
                  style={{ background: '#fff' }}
                />
              )}
              {modal.item.type === "music" && (
                <audio
                  src={modal.item.cloudinaryUrl}
                  controls
                  className="w-full"
                />
              )}
            </div>
            {/* Title */}
            <div className="text-gray-700 font-bold text-lg mb-2 text-center w-full px-6">{modal.item.title || 'Untitled'}</div>
            {/* Work Link Section */}
            <WorkLinkSection url={modal.item.cloudinaryUrl} />

            {/* Actions */}
            <div className="flex gap-3 w-full px-6 mb-6">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all"
                onClick={() => handlePreview(modal.item)}
              >
                <EyeIcon className="w-5 h-5 text-purple-400" />
                Preview
              </button>
              <button
                onClick={() => {
                  onRemoveFavourite && onRemoveFavourite(modal.item);
                  setModal(null);
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-red-600 rounded-full px-5 py-2 font-bold shadow hover:bg-red-50 active:scale-95 transition-all text-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="w-5 h-5 text-red-400">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
                Remove from Favourites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function WorkLinkSection({ url }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="w-full flex items-center justify-between gap-2 px-6 mb-4">
      <span className="truncate text-purple-600 font-mono text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 select-all" title={url}>{url}</span>
      <button
        className={`ml-2 p-2 rounded-full border border-purple-300 bg-white shadow hover:bg-purple-50 transition flex items-center justify-center ${copied ? 'bg-purple-100 border-purple-400' : ''}`}
        onClick={() => {navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1500);}}
        aria-label={copied ? 'Copied!' : 'Copy link'}
        title={copied ? 'Copied!' : 'Copy link'}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7c3aed" className="w-5 h-5 animate-bounce">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="#7c3aed" className="w-5 h-5">
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <rect x="3" y="3" width="13" height="13" rx="2" />
          </svg>
        )}
      </button>
    </div>
  );
} 