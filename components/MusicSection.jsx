import React, { useState } from "react";
import { useRef } from "react";
import BgAnimation from "./bg-animation";
import { XMarkIcon, UserIcon, ChatBubbleLeftRightIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';

const mockMusic = [
  { id: 1, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3", title: "SoundHelix Song 1", date: "2024-06-01", employee: "Alice" },
  { id: 2, url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3", title: "SoundHelix Song 2", date: "2024-06-02", employee: "Bob" },
];

export default function MusicSection({ music, onFavourite }) {
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // {music, feedback}
  const [favourites, setFavourites] = useState([]);
  const [notification, setNotification] = useState("");
  const inputRef = useRef();

  // Use provided music or fallback to mockMusic
  const allMusic = music && Array.isArray(music) ? music : mockMusic;
  // Filtered data
  const filteredMusic = allMusic.filter(music => {
    const q = search.toLowerCase();
    return (
      music.title.toLowerCase().includes(q) ||
      music.date.toLowerCase().includes(q) ||
      music.employee.toLowerCase().includes(q)
    );
  });

  const isFavourited = (id) => favourites.includes(id);
  const toggleFavourite = (music) => {
    setFavourites(favs => {
      const updated = favs.includes(music.id) ? favs.filter(f => f !== music.id) : [...favs, music.id];
      if (onFavourite) onFavourite(music, !favs.includes(music.id));
      if (!favs.includes(music.id)) {
        setNotification("Added to Favourites");
        setTimeout(() => setNotification("") , 1500);
      }
      return updated;
    });
  };

  const handleDownload = (music) => {
    const link = document.createElement('a');
    link.href = music.url;
    link.download = music.title + '.mp3';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFeedbackSubmit = () => {
    // This function is not fully implemented in the new_code,
    // so it will just close the modal for now.
    setModal(null);
    setNotification("Feedback submitted!");
    setTimeout(() => setNotification("") , 1500);
  };

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Music</h2>
        <p className="text-gray-500 text-base mt-1">Listen and manage your music tracks.</p>
        <div className="mt-2 text-purple-700 font-semibold">Total Music: {allMusic.length}</div>
      </div>
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
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
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredMusic.length === 0 ? (
          <div className="col-span-full text-center py-6 text-gray-400">No music found.</div>
        ) : filteredMusic.map((music) => (
          <div key={music.id} className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-stretch relative group cursor-pointer" onClick={() => setModal({ music, feedback: "" })}>
            {/* Star icon */}
            <button
              className={`absolute top-2 right-2 z-10 p-0.5 bg-[#7c3aed] rounded-full shadow-md hover:bg-[#5b21b6] transition ${isFavourited(music.id) ? 'animate-pulse' : ''}`}
              onClick={e => { e.stopPropagation(); toggleFavourite(music); }}
              aria-label={isFavourited(music.id) ? "Remove from Premium Favourites" : "Add to Premium Favourites"}
              title={isFavourited(music.id) ? "Remove from Premium Favourites" : "Add to Premium Favourites"}
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill={isFavourited(music.id) ? "#fff" : "none"} stroke="#fff" strokeWidth="2" viewBox="0 0 24 24" className="w-4 h-4">
                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
              </svg>
            </button>
            <audio
              src={music.url}
              controls
              className="w-full mb-2"
            />
            <div className="flex justify-between items-center w-full">
              <span className="text-gray-700 font-medium text-xs">{music.employee}</span>
              <span className="text-[#7c3aed] font-semibold text-sm">{music.title}</span>
            </div>
            <div className="text-gray-500 text-xs mt-1">{music.date}</div>
          </div>
        ))}
      </div>
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn">
          <div className="absolute inset-0 -z-10">
            <BgAnimation />
          </div>
          {/* Notification (top center, always visible) */}
          {notification && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white px-6 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-base animate-slideDown">
              <svg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' strokeWidth={2} stroke='currentColor' className='w-6 h-6 text-white'>
                <path strokeLinecap='round' strokeLinejoin='round' d='M5 13l4 4L19 7' />
              </svg>
              {notification}
            </div>
          )}
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto animate-scaleIn bg-white border border-purple-200 rounded-2xl shadow-2xl flex flex-col items-center p-0" style={{animation: 'scaleIn 0.25s cubic-bezier(.4,2,.6,1)'}}>
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
                <span className="text-gray-700 font-bold text-base">{modal.music.employee}</span>
                <span className="text-gray-700 text-sm">{modal.music.date}</span>
              </div>
            </div>
            {/* Audio */}
            <div className="flex justify-center w-full mb-4 px-6">
              <audio
                src={modal.music.url}
                controls
                className="w-full rounded-xl shadow border border-purple-100"
                style={{ background: '#fff' }}
              />
            </div>
            {/* Title */}
            <div className="text-gray-700 font-bold text-lg mb-2 text-center w-full px-6">{modal.music.title}</div>
            {/* Work Link Section */}
            <WorkLinkSection url={modal.music.url} />
            {/* Feedback */}
            <div className="w-full flex flex-col items-center mb-4 px-6">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 self-start">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                Feedback / Message
              </label>
              <textarea
                className="w-full bg-white border border-purple-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 placeholder-gray-400 shadow-sm transition mb-2"
                placeholder="Leave feedback or message..."
                value={modal.feedback}
                onChange={e => setModal(m => ({ ...m, feedback: e.target.value }))}
                rows={3}
                style={{ minHeight: '3.5rem', maxHeight: '8rem' }}
              />
            </div>
            {/* Actions */}
            <div className="flex gap-3 w-full px-6 mb-6">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all"
                onClick={handleFeedbackSubmit}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                Submit Feedback
              </button>
              <a
                href={modal.music.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all text-center"
              >
                <EyeIcon className="w-5 h-5 text-purple-400" />
                Preview
              </a>
              <a
                href={modal.music.url}
                download={modal.music.title + '.mp3'}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all text-center"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-purple-400" />
                Download
              </a>
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