import React, { useEffect, useState } from "react";
import { useUserInfo } from "../context/UserInfoContext";
import useStoreData from "../hooks/useStoreData";
import BgAnimation from "./bg-animation";
import { UserIcon, EyeIcon, ArrowDownTrayIcon, ChatBubbleLeftRightIcon, XMarkIcon, TrashIcon } from '@heroicons/react/24/solid';
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";

function decryptToken(token) {
  try {
    const bytes = CryptoJS.AES.decrypt(token, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    const { ci, aid } = JSON.parse(decrypted);
    return { ci, aid };
  } catch {
    return { ci: null, aid: null };
  }
}

export default function LinksSection({ onDelete }) {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // For modal info
  const [confirmDelete, setConfirmDelete] = useState(null); // link to delete
  const [notification, setNotification] = useState("");
  const [comments, setComments] = useState([]); // To store comments for the current link
  const { user, aid: userAid } = useUserInfo();
  
  // Use ci from token as companyId (same as data.jsx page)
  const companyId = ci;
  const employeeId = aid;
  
  // Only initialize useStoreData when both companyId and employeeId are available
  const { loading: storeLoading, error: storeError, addComment, listenForComments } = useStoreData(
    companyId, 
    employeeId
  );

  useEffect(() => {
    if (!companyId || !employeeId) {
      return;
    }
    setLoading(true);
    setError("");
    
    // Real-time updates for links (new structure: each link is a document)
    let unsubscribe;
    import("firebase/firestore").then(({ getFirestore, collection, query, where, onSnapshot }) => {
      const db = getFirestore();
      const linksRef = collection(db, "users", companyId, "employees", employeeId, "data_links");
      const linksQuery = query(linksRef);

      unsubscribe = onSnapshot(linksQuery, (querySnapshot) => {
        const linksData = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          linksData.push({
            id: doc.id,
            ...data
          });
        });
        setLinks(linksData);
        setLoading(false);
      }, (err) => {
        setError("Failed to fetch links");
        setLoading(false);
      });
    });
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [companyId, employeeId]);

  const handleCopy = (url, id) => {
    navigator.clipboard.writeText(url);
    setCopied(id);
    setTimeout(() => setCopied(null), 1500);
  };

  const filteredLinks = links.filter(link => {
    const q = search.toLowerCase();
    // Normalize date for search (support both string and Date/Timestamp)
    let dateStr = "";
    if (link.date) {
      dateStr = String(link.date).toLowerCase();
    } else if (link.createdAt) {
      if (typeof link.createdAt === 'string') {
        dateStr = link.createdAt.toLowerCase();
      } else if (link.createdAt.seconds) {
        const d = new Date(link.createdAt.seconds * 1000);
        dateStr = d.toLocaleDateString().toLowerCase() + ' ' + d.toISOString().toLowerCase();
      }
    }
    // Added by: employee or submitterName
    const addedBy = (link.employee || link.submitterName || "").toLowerCase();
    // Link name: title
    const title = (link.title || "").toLowerCase();
    // URL
    const url = (link.url || link.linkData || "").toLowerCase();
    return (
      url.includes(q) ||
      dateStr.includes(q) ||
      addedBy.includes(q) ||
      title.includes(q)
    );
  });

  // Remove link from local state after deletion
  const handleDeleteAndUpdate = async (link) => {
    if (typeof onDelete === 'function') {
      await onDelete(link);
      setLinks(prev => prev.filter(l => l.id !== link.id && l.url !== link.url));
    }
  };

  // Feedback submit handler
  const handleFeedbackSubmit = async () => {
    if (modal && modal.feedback && modal.feedback.trim() !== "") {
      try {
        const result = await addComment(modal.id, modal.feedback.trim(), "links");
        if (result.success) {
          setNotification("Feedback submitted successfully!");
          setTimeout(() => setNotification("") , 1500);
          // Clear feedback after successful submission
          setModal(m => ({ ...m, feedback: "" }));
        } else {
          setNotification("Failed to submit feedback.");
          setTimeout(() => setNotification("") , 1500);
        }
      } catch (error) {
        setNotification("Failed to submit feedback.");
        setTimeout(() => setNotification("") , 1500);
      }
    } else {
      setNotification("Please enter feedback before submitting.");
      setTimeout(() => setNotification("") , 1500);
    }
  };

  // Delete comment from database
  const handleDeleteComment = async (commentToDelete) => {
    try {
      const { updateDoc, arrayRemove } = await import("firebase/firestore");
      const { getFirestore, doc } = await import("firebase/firestore");
      const db = getFirestore();
      const docRef = doc(db, 'users', companyId, 'employees', employeeId, 'data_links', modal.id);
      
      await updateDoc(docRef, {
        comments: arrayRemove(commentToDelete)
      });
      
      setNotification("Comment deleted successfully!");
      setTimeout(() => setNotification(""), 1500);
    } catch (error) {
      setNotification("Failed to delete comment.");
      setTimeout(() => setNotification(""), 1500);
    }
  };

  // Listen for comments when modal opens
  useEffect(() => {
    if (modal && modal.id) {
      const unsubscribe = listenForComments(modal.id, 'links', (result) => {
        if (result.success) {
          setComments(result.comments);
        }
      });
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [modal, listenForComments]);

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Links</h2>
        <p className="text-gray-500 text-base mt-1">Access and manage your saved links.</p>
      </div>
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-96">
          <input
            type="text"
            placeholder="Search by link, date, or employee..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-2 rounded-lg shadow border border-purple-400 focus:border-purple-600 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-600 text-gray-900 transition"
          />
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-white rounded-lg shadow-md">
          <thead>
            <tr className="bg-[#f3f4f6] text-[#7c3aed]">
              <th className="py-3 px-4 text-left">S.No</th>
              <th className="py-3 px-4 text-left">Date</th>
              <th className="py-3 px-4 text-left">Link</th>
              <th className="py-3 px-4 text-left">Actions</th>
              <th className="py-3 px-4 text-left">Added By</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400">Loading...</td></tr>
            ) : error ? (
              <tr><td colSpan={5} className="text-center py-6 text-red-400">{error}</td></tr>
            ) : filteredLinks.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-6 text-gray-400">No links found.</td></tr>
            ) : filteredLinks.map((link, idx) => (
              <tr key={link.id || idx} className="border-b hover:bg-[#f9f5ff] transition cursor-pointer" onClick={() => setModal(link)}>
                <td className="py-2 px-4 text-gray-600">{idx + 1}</td>
                <td className="py-2 px-4 text-gray-600">{link.date || (link.createdAt ? new Date(link.createdAt.seconds ? link.createdAt.seconds * 1000 : link.createdAt).toLocaleDateString() : "")}</td>
                <td className="py-2 px-4">
                  <a
                    href={link.url || link.linkData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[#7c3aed] underline break-all hover:text-[#5b21b6]"
                  >
                    {link.url || link.linkData}
                  </a>
                </td>
                <td className="py-2 px-4 flex gap-2">
                  <button
                    onClick={e => { e.stopPropagation(); handleCopy(link.url || link.linkData, link.id || idx); }}
                    className="px-3 py-1 bg-[#ede9fe] text-[#7c3aed] rounded hover:bg-[#c7d2fe] transition"
                  >
                    {copied === (link.id || idx) ? "Copied!" : "Copy"}
                  </button>
                  <a
                    href={link.url || link.linkData}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 bg-[#f3f4f6] text-[#7c3aed] rounded hover:bg-[#e0e7ff] transition"
                    onClick={e => e.stopPropagation()}
                  >
                    Open
                  </a>
                </td>
                <td className="py-2 px-4 text-gray-700 font-medium">{link.employee || link.submitterName || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Modal for full link info */}
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
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn bg-white border border-purple-200 rounded-2xl shadow-2xl flex flex-col items-center p-0" style={{animation: 'scaleIn 0.25s cubic-bezier(.4,2,.6,1)'}}>
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-white border border-purple-400 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-gray-700 shadow hover:bg-purple-50 hover:scale-110 transition-all duration-200 z-10"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {/* Info Row: Employee/Date */}
            <div className="flex w-full justify-between items-center mb-4">
              <div className="flex items-center gap-3 pl-6 pt-6">
                <UserIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-700 font-bold text-base">{modal.employee || modal.submitterName || '-'}</span>
                <span className="text-gray-700 text-sm">{modal.date || (modal.createdAt ? new Date(modal.createdAt.seconds ? modal.createdAt.seconds * 1000 : modal.createdAt).toLocaleDateString() : "-")}</span>
              </div>
            </div>
            {/* URL as main content */}
            <div className="flex justify-center w-full mb-4 px-6">
              <a
                href={modal.url || modal.linkData}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-xl shadow max-w-full max-h-64 object-contain border border-purple-100 bg-purple-50 px-6 py-4 text-purple-700 font-mono text-lg break-all underline text-center w-full"
                style={{ background: '#fff' }}
              >
                {modal.url || modal.linkData}
              </a>
            </div>
            {/* Title (removed as requested) */}
            {/* Work Link Section (copy only, removed open/eye icon) */}
            <div className="w-full flex items-center justify-between gap-2 px-6 mb-4">
              <span className="truncate text-purple-600 font-mono text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 select-all" title={modal.url || modal.linkData}>{modal.url || modal.linkData}</span>
              <button
                className={`ml-2 p-2 rounded-full border border-purple-300 bg-white shadow hover:bg-purple-50 transition flex items-center justify-center`}
                onClick={() => {navigator.clipboard.writeText(modal.url || modal.linkData); setCopied(modal.id || modal.url || modal.linkData); setTimeout(() => setCopied(null), 1500);}}
                aria-label={copied === (modal.id || modal.url || modal.linkData) ? 'Copied!' : 'Copy link'}
                title={copied === (modal.id || modal.url || modal.linkData) ? 'Copied!' : 'Copy link'}
              >
                {copied === (modal.id || modal.url || modal.linkData) ? (
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
            {/* Feedback */}
            <div className="w-full flex flex-col items-center mb-4 px-6">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 self-start">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                Feedback / Message
              </label>
              <textarea
                className="w-full bg-white border border-purple-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-purple-400 text-gray-700 placeholder-gray-400 shadow-sm transition mb-2"
                placeholder="Leave feedback or message..."
                value={modal.feedback || ''}
                onChange={e => setModal(m => ({ ...m, feedback: e.target.value }))}
                rows={3}
                style={{ minHeight: '3.5rem', maxHeight: '8rem' }}
              />
            </div>
            {/* Actions: Submit Feedback and Delete Button in the same row below feedback */}
            <div className="flex gap-3 w-full px-6 mb-8">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all"
                onClick={handleFeedbackSubmit}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                Submit Feedback
              </button>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-red-600 rounded-full px-5 py-2 font-bold shadow hover:bg-red-50 active:scale-95 transition-all text-center"
                onClick={() => setConfirmDelete(modal)}
              >
                <TrashIcon className="w-5 h-5 text-red-400" />
                Delete
              </button>
            </div>
            {/* Comments Section */}
            {comments && comments.length > 0 && (
              <div className="w-full px-6 mb-6">
                <h3 className="text-gray-700 font-semibold mb-3 text-center">Feedback</h3>
                <div className="space-y-2">
                  {comments.map((comment, index) => (
                    <div key={index} className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex justify-between items-start gap-2">
                      <p className="text-gray-700 text-sm flex-1">{comment}</p>
                      <button
                        onClick={() => handleDeleteComment(comment)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1"
                        aria-label="Delete comment"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Delete Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-red-200 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-red-600 mb-4">Delete Link?</h3>
                  <p className="text-gray-700 mb-6 text-center">Are you sure you want to delete this link? This action cannot be undone.</p>
                  <div className="flex gap-4 w-full justify-end">
                    <button
                      className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                      onClick={() => setConfirmDelete(null)}
                    >
                      Cancel
                    </button>
                    <button
                          className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                          onClick={async () => {
                            const { getFirestore, doc, deleteDoc } = await import("firebase/firestore");
                            const db = getFirestore();
                            const docRef = doc(db, "users", companyId, "employees", employeeId, "data_links", confirmDelete.id);
                            await deleteDoc(docRef);
                        
                            setLinks(prev => prev.filter(l => l.id !== confirmDelete.id));
                            setConfirmDelete(null);
                            setModal(null);
                            setNotification("Link deleted successfully!");
                            setTimeout(() => setNotification(""), 1500);
                             }}
                           >
                             Delete
                           </button>

                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
} 