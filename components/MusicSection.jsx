import React, { useEffect, useState, useRef } from "react";
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

export default function MusicSection({ onFavourite }) {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // For modal info
  const [confirmDelete, setConfirmDelete] = useState(null); // music to delete
  const [notification, setNotification] = useState("");
  const [comments, setComments] = useState([]); // To store comments for the current music
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation
  const inputRef = useRef();
  const { user, aid: userAid } = useUserInfo();
  
  // Use ci from token as companyId (same as data.jsx page)
  const companyId = ci;
  const employeeId = aid;
  const {
    data: musicData,
    loading,
    error,
    deleteMedia,
    addComment,
    listenForComments,
  } = useStoreData(companyId, employeeId);
  const [music, setMusic] = useState([]); // To be populated with real data

  // Use local music state or fallback to empty array
  const allMusic = music && Array.isArray(music) ? music : [];
  // Filtered data
  const filteredMusic = allMusic.filter((music) => {
    const q = search.toLowerCase();
    return (
      (music.title && music.title.toLowerCase().includes(q)) ||
      (music.uploadedAt && music.uploadedAt.toLowerCase().includes(q)) ||
      (music.submitterName && music.submitterName.toLowerCase().includes(q))
    );
  });

  const toggleFavourite = (music) => {
    if (onFavourite) onFavourite(music, true);
  };

  const handleDownload = (music) => {
    const link = document.createElement("a");
    link.href = music.url;
    link.download = music.title + ".mp3";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (music) => {
    try {
      if (music.cloudinaryUrl) {
        window.open(music.cloudinaryUrl, "_blank");
      }
    } catch (error) {
      // Silently handle any errors
    }
  };

  const handleFeedbackSubmit = async () => {
    if (modal && modal.feedback && modal.feedback.trim() !== "") {
      try {
        const result = await addComment(
          modal.music.id,
          modal.feedback.trim(),
          "audios"
        );
        if (result.success) {
          setNotification("Feedback submitted successfully!");
          setTimeout(() => setNotification(""), 1500);
          // Clear feedback after successful submission
          setModal((m) => ({ ...m, feedback: "" }));
        } else {
          setNotification("Failed to submit feedback.");
          setTimeout(() => setNotification(""), 1500);
        }
      } catch (error) {
        setNotification("Failed to submit feedback.");
        setTimeout(() => setNotification(""), 1500);
      }
    } else {
      setNotification("Please enter feedback before submitting.");
      setTimeout(() => setNotification(""), 1500);
    }
  };

  // Delete comment from database
  const handleDeleteComment = async (commentToDelete) => {
    try {
      const { updateDoc, arrayRemove } = await import("firebase/firestore");
      const { getFirestore, doc } = await import("firebase/firestore");
      const db = getFirestore();
      const docRef = doc(db, "users", companyId, "employees", employeeId, "data_audios", modal.music.id);

      await updateDoc(docRef, {
        comments: arrayRemove(commentToDelete),
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
    if (modal && modal.music && modal.music.id) {
      const unsubscribe = listenForComments(
        modal.music.id,
        "audios",
        (result) => {
          if (result.success) {
            setComments(result.comments);
          }
        }
      );
      return () => {
        if (unsubscribe) unsubscribe();
      };
    }
  }, [modal, listenForComments]);

  // --- Firestore real-time music fetching (updated for individual document structure) ---
  useEffect(() => {
    if (!companyId) return;
    let unsubscribe;
    import("firebase/firestore").then(
      ({ getFirestore, collection, query, where, onSnapshot }) => {
        const db = getFirestore();
        const musicRef = collection(db, "users", companyId, "employees", employeeId, "data_audios");
        const musicQuery = query(musicRef);
        unsubscribe = onSnapshot(musicQuery, (querySnapshot) => {
          const musicData = [];
          querySnapshot.forEach((doc) => {
            musicData.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setMusic(musicData);
        });
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [companyId]);

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#28BD78]">Music</h2>
        <p className="text-gray-500 text-base mt-1">
          Listen and manage your music tracks.
        </p>
        <div className="mt-2 text-green-700 font-semibold">
          Total Music: {allMusic.length}
        </div>
      </div>
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-96 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 pointer-events-none">
            <svg
              width="20"
              height="20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
          </span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Search by title, date, or employee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-green-400 focus:border-green-600 bg-gradient-to-r from-white via-[#bbf7d0] to-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#28BD78] placeholder-gray-600 text-gray-900 transition"
            style={{ boxShadow: "0 2px 12px 0 rgba(124,58,237,0.08)" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filteredMusic.length === 0 ? (
          <div className="col-span-full text-center py-6 text-gray-400">
            No music found.
          </div>
        ) : (
          filteredMusic.map((music) => (
            <div
              key={music.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition p-4 flex flex-col items-stretch relative group cursor-pointer"
              onClick={() => setModal({ music, feedback: "" })}
            >
              {/* Star icon */}
              <button
                className="absolute top-2 right-2 z-10 p-0.5 bg-[#28BD78] rounded-full shadow-md hover:bg-[#5b21b6] transition"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(music);
                }}
                aria-label="Add to Premium Favourites"
                title="Add to Premium Favourites"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                >
                  <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                </svg>
              </button>
              <audio
                src={music.cloudinaryUrl}
                controls
                className="w-full mb-2"
              />
              <div className="flex justify-between items-center w-full">
                <span className="text-gray-700 font-medium text-xs">
                  {music.submitterName}
                </span>
                <span className="text-[#28BD78] font-semibold text-sm">
                  {music.title}
                </span>
              </div>
              <div className="text-gray-500 text-xs mt-1">
                {music.date ||
                  (music.uploadedAt
                    ? new Date(
                        music.uploadedAt.seconds
                          ? music.uploadedAt.seconds * 1000
                          : music.uploadedAt
                      ).toLocaleDateString()
                    : "")}
              </div>
            </div>
          ))
        )}
      </div>
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fadeIn">
          <div className="absolute inset-0 -z-10">
            <BgAnimation />
          </div>
          {/* Notification (top center, always visible) */}
          {notification && (
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-[#28BD78] to-[#a78bfa] text-white px-6 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-base animate-slideDown">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6 text-white"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M5 13l4 4L19 7"
                />
              </svg>
              {notification}
            </div>
          )}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn bg-white border border-green-200 rounded-2xl shadow-2xl flex flex-col items-center p-0"
            style={{ animation: "scaleIn 0.25s cubic-bezier(.4,2,.6,1)" }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-white border border-green-400 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-gray-700 shadow hover:bg-green-50 hover:scale-110 transition-all duration-200 z-10"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {/* Info Row: Employee/Date left */}
            <div className="flex w-full justify-between items-center mb-4 p-6 pb-0">
              <div className="flex items-center gap-3">
                <UserIcon className="w-5 h-5 text-green-400" />
                <span className="text-gray-700 font-bold text-base">
                  {modal.music.submitterName}
                </span>
                <span className="text-gray-700 text-sm">
                  {modal.music.date ||
                    (modal.music.uploadedAt
                      ? new Date(
                          modal.music.uploadedAt.seconds
                            ? modal.music.uploadedAt.seconds * 1000
                            : modal.music.uploadedAt
                        ).toLocaleDateString()
                      : "-")}
                </span>
              </div>
            </div>
            {/* Audio */}
            <div className="flex justify-center w-full mb-4 px-6">
              <audio
                src={modal.music.cloudinaryUrl}
                controls
                className="w-full rounded-xl shadow border border-green-100"
                style={{ background: "#fff" }}
              />
            </div>
            {/* Title */}
            <div className="text-gray-700 font-bold text-lg mb-2 text-center w-full px-6">
              {modal.music.title}
            </div>
            {/* Work Link Section */}
            <WorkLinkSection url={modal.music.cloudinaryUrl} />
            {/* Feedback */}
            <div className="w-full flex flex-col items-center mb-4 px-6">
              <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 self-start">
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-400" />
                Feedback / Message
              </label>
              <textarea
                className="w-full bg-white border border-green-200 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-green-400 text-gray-700 placeholder-gray-400 shadow-sm transition mb-2"
                placeholder="Leave feedback or message..."
                value={modal.feedback}
                onChange={(e) =>
                  setModal((m) => ({ ...m, feedback: e.target.value }))
                }
                rows={3}
                style={{ minHeight: "3.5rem", maxHeight: "8rem" }}
              />
            </div>
            {/* Actions */}
            <div className="flex gap-3 w-full px-6 mb-6">
              <button
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-green-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-green-50 active:scale-95 transition-all"
                onClick={handleFeedbackSubmit}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-green-400" />
                Submit Feedback
              </button>
              <button
                onClick={() => handlePreview(modal.music)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-green-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-green-50 active:scale-95 transition-all text-center"
              >
                <EyeIcon className="w-5 h-5 text-green-400" />
                Preview
              </button>
            </div>
            {/* Download and Delete Button in the same row below actions */}
            <div className="flex gap-3 w-full px-6 mb-8">
              <a
                href={modal.music.cloudinaryUrl}
                download={modal.music.fileName || modal.music.title + ".mp3"}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-green-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-green-50 active:scale-95 transition-all text-center"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-green-400" />
                Download
              </a>

              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-green-400 text-red-600 rounded-full px-5 py-2 font-bold shadow hover:bg-red-50 active:scale-95 transition-all text-center"
                onClick={() => setConfirmDelete(modal.music)}
              >
                <TrashIcon className="w-5 h-5 text-red-400" />
                Delete
              </button>
            </div>
            {/* Comments Section */}
            {comments && comments.length > 0 && (
              <div className="w-full px-6 mb-6">
                <h3 className="text-gray-700 font-semibold mb-3 text-center">
                  Feedback
                </h3>
                <div className="space-y-2">
                  {comments.map((comment, index) => (
                    <div
                      key={index}
                      className="bg-green-50 border border-green-200 rounded-lg p-3 flex justify-between items-start gap-2"
                    >
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
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-red-200 flex flex-col items-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Music?
            </h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete this music? This action cannot be
              undone.
            </p>
            <div className="flex gap-4 w-full justify-end">
              <button
                className={`px-6 py-2 rounded-lg text-gray-700 font-semibold transition ${isDeleting ? "bg-gray-300 cursor-not-allowed" : "bg-gray-200 hover:bg-gray-300"}`}
                onClick={() => !isDeleting && setConfirmDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className={`px-6 py-2 rounded-lg text-white font-semibold transition flex items-center gap-2 ${isDeleting ? "bg-red-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"}`}
                onClick={async () => {
                  if (isDeleting || typeof deleteMedia !== "function") return;

                  setIsDeleting(true);
                  try {
                    const result = await deleteMedia(confirmDelete, "audios");
                    if (result.success) {
                      setNotification("Music deleted successfully!");
                      setTimeout(() => setNotification(""), 1500);
                    } else {
                      setNotification("Failed to delete music");
                      setTimeout(() => setNotification(""), 1500);
                    }
                  } catch (error) {
                    
                    setNotification(
                      "An error occurred while deleting the music"
                    );
                    setTimeout(() => setNotification(""), 1500);
                  } finally {
                    setIsDeleting(false);
                    setConfirmDelete(null);
                    setModal(null);
                  }
                }}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
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
      <span
        className="truncate text-green-600 font-mono text-sm bg-green-50 px-3 py-2 rounded-lg border border-green-100 select-all"
        title={url}
      >
        {url}
      </span>
      <button
        className={`ml-2 p-2 rounded-full border border-green-300 bg-white shadow hover:bg-green-50 transition flex items-center justify-center ${copied ? "bg-green-100 border-green-400" : ""}`}
        onClick={() => {
          navigator.clipboard.writeText(url);
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        }}
        aria-label={copied ? "Copied!" : "Copy link"}
        title={copied ? "Copied!" : "Copy link"}
      >
        {copied ? (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#28BD78"
            className="w-5 h-5 animate-bounce"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M5 13l4 4L19 7"
            />
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="#28BD78"
            className="w-5 h-5"
          >
            <rect x="9" y="9" width="13" height="13" rx="2" />
            <rect x="3" y="3" width="13" height="13" rx="2" />
          </svg>
        )}
      </button>
    </div>
  );
}
