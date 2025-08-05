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

export default function ImagesSection({ onFavourite }) {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  
  const [copied, setCopied] = useState(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // For modal info
  const [confirmDelete, setConfirmDelete] = useState(null); // image to delete
  const [notification, setNotification] = useState("");
  const [comments, setComments] = useState([]); // To store comments for the current image
  const [isDeleting, setIsDeleting] = useState(false); // Loading state for delete operation
  const inputRef = useRef();
  const { user, aid: userAid } = useUserInfo();
  
  // Use ci from token as companyId (same as data.jsx page)
  const companyId = ci;
  const employeeId = aid;
  const {
    data: imagesData,
    loading,
    error,
    deleteMedia,
    addComment,
    listenForComments,
  } = useStoreData(companyId, employeeId);
  const [images, setImages] = useState([]); // To be uncommented when the real data is fetched
  // const [images, setImages] = useState(mockImages);

  // Use local images state or fallback to empty array
  const allImages = images && Array.isArray(images) ? images : [];
  // Filtered data
  const filteredImages = allImages.filter((img) => {
    const q = search.toLowerCase();
    return (
      (img.title && img.title.toLowerCase().includes(q)) ||
      (img.uploadedAt && img.uploadedAt.toLowerCase().includes(q)) ||
      (img.submitterName && img.submitterName.toLowerCase().includes(q))
    );
  });

  const toggleFavourite = (img) => {
    if (onFavourite) onFavourite(img, true);
  };

  const handleDownload = (img) => {
    const link = document.createElement("a");
    link.href = img.url;
    link.download = img.title + ".jpg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePreview = (img) => {
    try {
      if (img.cloudinaryUrl) {
        window.open(img.cloudinaryUrl, "_blank");
      }
    } catch (error) {
      console.log("Failed to preview image:", error);
    }
  };

  // Feedback submit handler
  const handleFeedbackSubmit = async () => {
    if (modal && modal.feedback && modal.feedback.trim() !== "") {
      try {
        const result = await addComment(
          modal.image.id,
          modal.feedback.trim(),
          "images"
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
      const docRef = doc(db, "users", companyId, "employees", employeeId, "data_images", modal.image.id);

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

  // --- Firestore real-time images fetching (updated for individual document structure) ---
  useEffect(() => {
    if (!companyId) return;
    let unsubscribe;
    import("firebase/firestore").then(
      ({ getFirestore, collection, query, where, onSnapshot }) => {
        const db = getFirestore();
        const dataRef = collection(db, "users", companyId, "employees", employeeId, "data_images");
        unsubscribe = onSnapshot(dataRef, (querySnapshot) => {
          const imagesData = [];
          querySnapshot.forEach((doc) => {
            imagesData.push({ id: doc.id, ...doc.data() });
          });
          setImages(imagesData);
        });
      }
    );
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [companyId]);

  // Listen for comments when modal opens
  useEffect(() => {
    if (modal && modal.image && modal.image.id) {
      const unsubscribe = listenForComments(
        modal.image.id,
        "images",
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

  return (
    <div>
      <div className="mb-6 text-left">
        <h2 className="text-2xl font-bold text-[#7c3aed]">Images</h2>
        <p className="text-gray-500 text-base mt-1">
          Browse and manage your uploaded images.
        </p>
        <div className="mt-2 text-purple-700 font-semibold">
          Total Images: {allImages.length}
        </div>
      </div>
      {/* Search Bar */}
      <div className="flex justify-between items-center mb-4 flex-col sm:flex-row gap-2">
        <div className="w-full sm:w-96 relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400 pointer-events-none">
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
            className="w-full pl-10 pr-4 py-2 rounded-lg border-2 border-purple-400 focus:border-purple-600 bg-gradient-to-r from-white via-[#f3e8ff] to-white shadow-lg focus:outline-none focus:ring-2 focus:ring-[#7c3aed] placeholder-gray-600 text-gray-900 transition"
            style={{ boxShadow: "0 2px 12px 0 rgba(124,58,237,0.08)" }}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {filteredImages.length === 0 ? (
          <div className="col-span-full text-center py-6 text-gray-400">
            No images found.
          </div>
        ) : (
          filteredImages.map((img) => (
            <div
              key={img.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex flex-col items-stretch relative group cursor-pointer"
              onClick={() => setModal({ image: img, feedback: "" })}
            >
              {/* Star icon */}
              <button
                className="absolute top-2 right-2 z-10 p-0.5 bg-[#7c3aed] rounded-full shadow-md hover:bg-[#5b21b6] transition"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFavourite(img);
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
              <img
                src={img.cloudinaryUrl}
                alt={img.title}
                className="w-full h-32 object-cover"
              />
              <div className="flex justify-between items-center p-2 w-full">
                <span className="text-gray-700 font-medium text-xs">
                  {img.submitterName}
                </span>
                <span className="text-[#7c3aed] font-semibold text-sm">
                  {img.title}
                </span>
              </div>
              <div className="px-2 pb-2 text-gray-500 text-xs">
                {img.date ||
                  (img.uploadedAt
                    ? new Date(
                        img.uploadedAt.seconds
                          ? img.uploadedAt.seconds * 1000
                          : img.uploadedAt
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
            <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] text-white px-6 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-base animate-slideDown">
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
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scaleIn bg-white border border-purple-200 rounded-2xl shadow-2xl flex flex-col items-center p-0"
            style={{ animation: "scaleIn 0.25s cubic-bezier(.4,2,.6,1)" }}
          >
            {/* Close Button */}
            <button
              className="absolute top-4 right-4 bg-white border border-purple-400 rounded-full w-10 h-10 flex items-center justify-center text-2xl text-gray-700 shadow hover:bg-purple-50 hover:scale-110 transition-all duration-200 z-10"
              onClick={() => setModal(null)}
              aria-label="Close"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {/* Info Row: Employee/Date left */}
            <div className="flex w-full justify-between items-center mb-4">
              <div className="flex items-center gap-3 pl-6 pt-6">
                <UserIcon className="w-5 h-5 text-purple-400" />
                <span className="text-gray-700 font-bold text-base">
                  {modal.image.submitterName}
                </span>
                <span className="text-gray-700 text-sm">
                  {modal.image.date ||
                    (modal.image.uploadedAt
                      ? new Date(
                          modal.image.uploadedAt.seconds
                            ? modal.image.uploadedAt.seconds * 1000
                            : modal.image.uploadedAt
                        ).toLocaleDateString()
                      : "-")}
                </span>
              </div>
            </div>
            {/* Image */}
            <div className="flex justify-center w-full mb-4 px-6">
              <img
                src={modal.image.cloudinaryUrl}
                alt={modal.image.title}
                className="rounded-xl shadow max-w-full max-h-64 object-contain border border-purple-100"
                style={{ background: "#fff" }}
              />
            </div>
            {/* Title */}
            <div className="text-gray-700 font-bold text-lg mb-2 text-center w-full px-6">
              {modal.image.title}
            </div>
            {/* Work Link Section */}
            <WorkLinkSection url={modal.image.cloudinaryUrl} />
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
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all"
                onClick={handleFeedbackSubmit}
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 text-purple-400" />
                Submit Feedback
              </button>
              <button
                onClick={() => handlePreview(modal.image)}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all text-center"
              >
                <EyeIcon className="w-5 h-5 text-purple-400" />
                Preview
              </button>
            </div>
            {/* Download and Delete Button in the same row below actions */}
            <div className="flex gap-3 w-full px-6 mb-8">
              <a
                href={modal.image.cloudinaryUrl}
                download={modal.image.title + ".jpg"}
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-gray-700 rounded-full px-5 py-2 font-bold shadow hover:bg-purple-50 active:scale-95 transition-all text-center"
              >
                <ArrowDownTrayIcon className="w-5 h-5 text-purple-400" />
                Download
              </a>
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 bg-white border border-purple-400 text-red-600 rounded-full px-5 py-2 font-bold shadow hover:bg-red-50 active:scale-95 transition-all text-center"
                onClick={() => setConfirmDelete(modal.image)}
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
                      className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex justify-between items-start gap-2"
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
            {/* Delete Confirmation Modal */}
            {confirmDelete && (
              <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
                <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-red-200 flex flex-col items-center">
                  <h3 className="text-xl font-bold text-red-600 mb-4">
                    Delete Image?
                  </h3>
                  <p className="text-gray-700 mb-6 text-center">
                    Are you sure you want to delete this image? This action
                    cannot be undone.
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
                        if (isDeleting || typeof deleteMedia !== "function")
                          return;

                        setIsDeleting(true);
                        try {
                          const result = await deleteMedia({
                            ...confirmDelete,
                            originalCollection: "images",
                            cloudinaryPublicId:
                              confirmDelete.cloudinaryPublicId,
                            cloudinaryResourceType:
                              confirmDelete.cloudinaryResourceType || "image",
                          });
                          if (result.success) {
                            setNotification("Image deleted successfully!");
                            setTimeout(() => setNotification(""), 1500);
                          } else {
                            setNotification("Failed to delete image");
                            setTimeout(() => setNotification(""), 1500);
                          }
                        } catch (error) {
                          console.error("Delete error:", error);
                          setNotification(
                            "An error occurred while deleting the image"
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
        </div>
      )}
    </div>
  );
}

// Add WorkLinkSection component at the bottom of the file
function WorkLinkSection({ url }) {
  const [copied, setCopied] = React.useState(false);
  return (
    <div className="w-full flex items-center justify-between gap-2 px-6 mb-4">
      <span
        className="truncate text-purple-600 font-mono text-sm bg-purple-50 px-3 py-2 rounded-lg border border-purple-100 select-all"
        title={url}
      >
        {url}
      </span>
      <button
        className={`ml-2 p-2 rounded-full border border-purple-300 bg-white shadow hover:bg-purple-50 transition flex items-center justify-center ${copied ? "bg-purple-100 border-purple-400" : ""}`}
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
            stroke="#7c3aed"
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
            stroke="#7c3aed"
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
