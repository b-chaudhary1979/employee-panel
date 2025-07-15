import React, { useState, useRef } from "react";

export default function FavouriteSection({ images = [], videos = [], music = [], onRemoveFavourite }) {
  const [search, setSearch] = useState("");
  const inputRef = useRef();

  const allFavourites = [
    ...images.map(img => ({ ...img, type: "image" })),
    ...videos.map(vid => ({ ...vid, type: "video" })),
    ...music.map(m => ({ ...m, type: "music" })),
  ];

  const filteredFavourites = allFavourites.filter(item => {
    const q = search.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.date.toLowerCase().includes(q) ||
      item.employee.toLowerCase().includes(q)
    );
  });

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
            <div key={item.type + item.id} className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col items-stretch relative">
              {/* Star icon */}
              <button
                className="absolute top-2 right-2 z-10 p-0.5 bg-[#7c3aed] rounded-full shadow-md hover:bg-[#5b21b6] transition"
                onClick={() => onRemoveFavourite && onRemoveFavourite(item)}
                aria-label="Remove from Premium Favourites"
                title="Remove from Premium Favourites"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="#fff" stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
                </svg>
              </button>
              {item.type === "image" && (
                <img src={item.url} alt={item.title} className="w-full h-32 object-cover" />
              )}
              {item.type === "video" && (
                <video src={item.url} controls className="w-full h-32 object-cover" />
              )}
              {item.type === "music" && (
                <audio src={item.url} controls className="w-full mb-2" />
              )}
              <div className="flex justify-between items-center p-2 w-full">
                <span className="text-gray-700 font-medium text-xs">{item.employee}</span>
                <span className="text-[#7c3aed] font-semibold text-sm">{item.title}</span>
              </div>
              <div className="px-2 pb-2 text-gray-500 text-xs">{item.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 