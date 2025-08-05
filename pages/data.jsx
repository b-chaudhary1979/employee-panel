import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import Head from "next/head";
import ImagesSection from "../components/ImagesSection";
import VideosSection from "../components/VideosSection";
import MusicSection from "../components/MusicSection";
import LinksSection from "../components/LinksSection";
import FavouriteSection from "../components/FavouriteSection";

import DocumentsSection from "../components/DocumentsSection";
import useStoreData from "../hooks/useStoreData";

const ENCRYPTION_KEY = "cyberclipperSecretKey123!";

// Utility to encrypt ci and aid into a token
function encryptToken(ci, aid) {
  const data = JSON.stringify({ ci, aid });
  return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
}

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

// Import mock arrays from the components (since they are not exported, redefine here for now)
const mockImages = [
  {
    id: 1,
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80",
    title: "Mountain",
    date: "2024-06-01",
    employee: "Alice",
  },
  {
    id: 2,
    url: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=format&fit=crop&w=400&q=80",
    title: "Forest",
    date: "2024-06-01",
    employee: "Bob",
  },
  {
    id: 3,
    url: "https://images.unsplash.com/photo-1519125323398-675f0ddb6308?auto=format&fit=crop&w=400&q=80",
    title: "Beach",
    date: "2024-06-02",
    employee: "Charlie",
  },
  {
    id: 4,
    url: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=400&q=80",
    title: "Desert",
    date: "2024-06-03",
    employee: "Alice",
  },
];
const mockVideos = [
  {
    id: 1,
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    title: "Big Buck Bunny",
    date: "2024-06-01",
    employee: "Alice",
  },
  {
    id: 2,
    url: "https://www.w3schools.com/html/movie.mp4",
    title: "Bear Video",
    date: "2024-06-02",
    employee: "Bob",
  },
];
const mockMusic = [
  {
    id: 1,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    title: "SoundHelix Song 1",
    date: "2024-06-01",
    employee: "Alice",
  },
  {
    id: 2,
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3",
    title: "SoundHelix Song 2",
    date: "2024-06-02",
    employee: "Bob",
  },
];

const mockDocuments = [
  {
    id: 1,
    title: "Q1 Financial Report",
    submitterName: "Alice Johnson",
    category: "Report",
    linkData: "https://example.com/q1-report",
    textData: "Quarterly financial summary and analysis",
    tags: "finance, quarterly, important",
    date: "2024-06-01",
    files: [
      { name: "Q1_Report.pdf", type: "pdf", size: "2.3 MB" },
      { name: "Supporting_Data.xlsx", type: "excel", size: "1.1 MB" },
    ],
    notes: "Review required by end of week",
  },
  {
    id: 2,
    title: "Employee Handbook Update",
    submitterName: "Bob Smith",
    category: "Contract",
    linkData: "",
    textData: "Updated employee handbook with new policies",
    tags: "hr, policies, handbook",
    date: "2024-06-02",
    files: [{ name: "Employee_Handbook_v2.pdf", type: "pdf", size: "5.2 MB" }],
    notes: "Distribute to all employees",
  },
];

function DataContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error } = useUserInfo();
  // Use ci from token consistently - same as employee page
  const companyId = ci;
  const { addFavourite, removeFavourite, deleteMedia, fetchFavourites } =
    useStoreData(companyId,aid);
  const { addLink } = useStoreData(companyId,aid); // for completeness, but not used for delete
  const { loading: storeLoading, error: storeError } = useStoreData(companyId,aid);
  // Delete handler for links
  const handleDeleteLink = async (link) => {
    try {
      // Remove from Firestore using deleteDoc
      import("firebase/firestore").then(
        async ({ getFirestore, doc, deleteDoc }) => {
          const db = getFirestore();
          // Delete the specific link document using its ID from the links subcollection
          const linkDocRef = doc(
            db,
            "users",
            companyId,
            "employees",
            aid,
            "data_links",
            link.id
          );
          await deleteDoc(linkDocRef);

          setNotification({
            show: true,
            message: "Link deleted successfully!",
            color: "green",
          });
          setTimeout(
            () => setNotification({ show: false, message: "", color: "green" }),
            1500
          );
        }
      );
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || "Delete failed",
        color: "red",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", color: "red" }),
        1500
      );
    }
  };
  const [notification, setNotification] = useState({
    show: false,
    message: "",
    color: "green",
  });
  const [activeTab, setActiveTab] = useState("images");
  // Favourites state
  const [favImages, setFavImages] = useState([]);
  const [favVideos, setFavVideos] = useState([]);
  const [favMusic, setFavMusic] = useState([]);
  const [favouritesLoading, setFavouritesLoading] = useState(false);

  const totalMedia = 0; // Documents are now handled by DocumentsSection component

  // Load favourites from Firestore with real-time updates
  const loadFavourites = async () => {
    if (!companyId || !aid) return;

    setFavouritesLoading(true);
    try {
      const unsubscribe = await fetchFavourites((result) => {
        if (result.success) {
          const favourites = result.favourites;

          // Separate favourites by type
          const images = favourites.filter(
            (fav) =>
              fav.originalType === "image" || fav.fileCategory === "image"
          );
          const videos = favourites.filter(
            (fav) =>
              fav.originalType === "video" || fav.fileCategory === "video"
          );
          const music = favourites.filter(
            (fav) =>
              fav.originalType === "music" || fav.fileCategory === "music"
          );

          setFavImages(images);
          setFavVideos(videos);
          setFavMusic(music);
        }
        setFavouritesLoading(false);
      });

      // Store unsubscribe function for cleanup
      if (unsubscribe) {
        // Clean up previous listener if exists
        if (window.favouritesUnsubscribe) {
          window.favouritesUnsubscribe();
        }
        window.favouritesUnsubscribe = unsubscribe;
      }
    } catch (err) {
      setFavouritesLoading(false);
    }
  };

  const handleEditDocument = (documentData) => {
    setNotification({
      show: true,
      message: "Document updated successfully!",
      color: "green",
    });
    setTimeout(
      () => setNotification({ show: false, message: "", color: "green" }),
      1500
    );
  };

  // Delete handler for documents
  const [confirmDeleteDoc, setConfirmDeleteDoc] = useState(null); // document to delete
  const handleDeleteDocument = (doc) => {
    setConfirmDeleteDoc(doc);
  };
  const confirmDeleteDocument = async () => {
    if (!confirmDeleteDoc) return;
    try {
      // Remove from Firestore using deleteDoc
      import("firebase/firestore").then(
        async ({ getFirestore, doc, deleteDoc }) => {
          const db = getFirestore();

          // Delete all documents in the group if documentIds exist, otherwise delete single document
          const documentIds = confirmDeleteDoc.documentIds || [
            confirmDeleteDoc.id,
          ];
          const deletePromises = documentIds.map((docId) => {
            const documentRef = doc(
              db,
              "users",
              companyId,
              "data_documents",
              docId
            );
            return deleteDoc(documentRef);
          });

          await Promise.all(deletePromises);

          setNotification({
            show: true,
            message: "Document deleted successfully!",
            color: "green",
          });
          setTimeout(
            () => setNotification({ show: false, message: "", color: "green" }),
            1500
          );
        }
      );
    } catch (err) {
      setNotification({
        show: true,
        message: err.message || "Delete failed",
        color: "red",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", color: "red" }),
        1500
      );
    }
    setConfirmDeleteDoc(null);
  };

  // Handlers for adding/removing favourites
  const handleFavourite = async (item, isFav, type) => {
    if (isFav) {
      // Add to Firestore
      await addFavourite({ ...item, type });
      setNotification({
        show: true,
        message: "Added to Favourites",
        color: "green",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", color: "green" }),
        1500
      );
      // No need to refresh - real-time listener will update automatically
    }
  };

  const handleRemoveFavourite = async (item) => {
    // Remove from Firestore
    await removeFavourite(item);
    setNotification({
      show: true,
      message: "Removed from Favourites",
      color: "red",
    });
    setTimeout(
      () => setNotification({ show: false, message: "", color: "red" }),
      1500
    );
    // No need to refresh - real-time listener will update automatically
  };

  // Delete handler for images, videos, music using custom modal only
  const [confirmDeleteMedia, setConfirmDeleteMedia] = useState({
    item: null,
    type: null,
  });
  const handleDeleteMedia = (item, type) => {
    setConfirmDeleteMedia({ item, type });
  };
  const confirmDeleteMediaAction = async () => {
    const { item, type } = confirmDeleteMedia;
    if (!item || !type) return;
    const result = await deleteMedia(item);
    if (result.success) {
      // No need to manually update state - real-time listener will handle it
      setNotification({
        show: true,
        message: "Deleted successfully!",
        color: "red",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", color: "red" }),
        1500
      );
    } else {
      setNotification({
        show: true,
        message: result.error || "Delete failed",
        color: "red",
      });
      setTimeout(
        () => setNotification({ show: false, message: "", color: "red" }),
        1500
      );
    }
    setConfirmDeleteMedia({ item: null, type: null });
  };

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      // Add a small delay to allow router.query to stabilize after navigation
      const timer = setTimeout(() => {
        if (!ci || !aid) {
          router.replace("/auth/login");
        }
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [router.isReady, ci, aid]);

  // Load favourites when component mounts or companyId changes
  useEffect(() => {
    if (companyId) {
      loadFavourites();
    }

    // Cleanup function to unsubscribe from real-time listener
    return () => {
      if (window.favouritesUnsubscribe) {
        window.favouritesUnsubscribe();
        window.favouritesUnsubscribe = null;
      }
    };
  }, [companyId]);

  useEffect(() => {
    if (error) {
      setNotification({
        show: true,
        message: `Error loading user info: ${error}`,
      });
      const timer = setTimeout(
        () => setNotification({ show: false, message: "" }),
        2000
      );
      return () => clearTimeout(timer);
    }
  }, [error]);

  const getContentMarginLeft = () => {
    if (!isHydrated) return 270;
    if (isMobile) return 0;
    return isOpen ? 270 : 64;
  };

  useEffect(() => {
    function updateHeaderHeight() {
      if (headerRef.current) setHeaderHeight(headerRef.current.offsetHeight);
    }
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  const handleMobileSidebarToggle = () => setMobileSidebarOpen((v) => !v);
  const handleMobileSidebarClose = () => setMobileSidebarOpen(false);

  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) setMobileSidebarOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  if (!ci || !aid) return null;
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }

  return (
    <>
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {/* Notification Popup */}
      {notification.show && (
        <div
          className={`fixed top-8 left-1/2 z-[9999] transform -translate-x-1/2 transition-all duration-500 ease-in-out ${
            notification.show ? "opacity-100" : "opacity-0"
          }`}
        >
          <div
            className={`px-6 py-4 rounded-lg shadow-lg border-l-4 ${
              notification.color === "green"
                ? "bg-green-50 border-green-500 text-green-800"
                : "bg-red-50 border-red-500 text-red-800"
            }`}
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  notification.color === "green" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <span className="font-medium">{notification.message}</span>
            </div>
          </div>
        </div>
      )}
      <div className="bg-[#fbf9f4] min-h-screen flex relative">
        {/* Sidebar for desktop */}
        <div
          className="hidden sm:block fixed top-0 left-0 h-full z-40"
          style={{ width: 270 }}
        >
          <SideMenu />
        </div>
        {/* Sidebar for mobile (full screen overlay) */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button
              className="absolute top-4 right-4 z-60 text-3xl text-gray-500"
              aria-label="Close sidebar"
              onClick={handleMobileSidebarClose}
            >
              &times;
            </button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}
        {/* Main content area */}
        <div
          className="flex-1 flex flex-col min-h-screen transition-all duration-300"
          style={{ marginLeft: getContentMarginLeft() }}
        >
          {/* Header */}
          <Header
            ref={headerRef}
            onMobileSidebarToggle={handleMobileSidebarToggle}
            mobileSidebarOpen={mobileSidebarOpen}
            username={`${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Employee"}
            companyName={user?.company || "company name"}
          />
          <main
            className="transition-all duration-300 px-2 mt-6 sm:px-8 py-12 md:py-6"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#7c3aed] mb-1">
                    Data Management
                  </h1>
                  <p className="text-gray-500 text-lg">
                    Manage your data and view analytics here.
                  </p>
                </div>
                {/* Add Data Button */}
                <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/add-documents?cid=${ci}&aid=${aid}`)}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Add Data
                  </button>
                </div>
              </div>
              {/* Horizontal options bar */}
              <div className="flex gap-4 mb-8 border-b border-gray-200">
                {[
                  { key: "images", label: "Images" },
                  { key: "videos", label: "Videos" },
                  { key: "music", label: "Music" },
                  { key: "links", label: "Links" },
                  { key: "documents", label: "Documents" },
                  { key: "favourites", label: "Favourites" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={`px-6 py-3 text-lg font-semibold border-b-2 transition-colors duration-200 focus:outline-none ${
                      activeTab === tab.key
                        ? "border-purple-500 text-[#7c3aed] bg-white"
                        : "border-transparent text-gray-500 hover:text-[#7c3aed]"
                    }`}
                    style={{
                      background: activeTab === tab.key ? "#fff" : "#f3f4f6",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Tab content */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
                {activeTab === "images" && (
                  <ImagesSection
                    images={mockImages}
                    onFavourite={(item, isFav) =>
                      handleFavourite(item, isFav, "image")
                    }
                    onDelete={(item) => handleDeleteMedia(item, "image")}
                  />
                )}
                {activeTab === "videos" && (
                  <VideosSection
                    videos={mockVideos}
                    onFavourite={(item, isFav) =>
                      handleFavourite(item, isFav, "video")
                    }
                    onDelete={(item) => handleDeleteMedia(item, "video")}
                  />
                )}
                {activeTab === "music" && (
                  <MusicSection
                    music={mockMusic}
                    onFavourite={(item, isFav) =>
                      handleFavourite(item, isFav, "music")
                    }
                    onDelete={(item) => handleDeleteMedia(item, "music")}
                  />
                )}
                {activeTab === "links" && (
                  <LinksSection onDelete={handleDeleteLink} />
                )}
                {activeTab === "documents" && (
                  <DocumentsSection
                    onEdit={handleEditDocument}
                    onAdd={() => router.push(`/add-documents?cid=${ci}&aid=${aid}`)}
                    onDelete={handleDeleteDocument}
                  />
                )}
                {activeTab === "favourites" && (
                  <FavouriteSection
                    images={favImages}
                    videos={favVideos}
                    music={favMusic}
                    onRemoveFavourite={handleRemoveFavourite}
                    loading={favouritesLoading}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* Delete Confirmation Modal for Documents */}
      {confirmDeleteDoc && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-red-200 flex flex-col items-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete Document?
            </h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete this document? This action cannot
              be undone.
            </p>
            <div className="flex gap-4 w-full justify-end">
              <button
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() => setConfirmDeleteDoc(null)}
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                onClick={confirmDeleteDocument}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Modal for Media */}
      {confirmDeleteMedia.item && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full border-2 border-red-200 flex flex-col items-center">
            <h3 className="text-xl font-bold text-red-600 mb-4">
              Delete{" "}
              {confirmDeleteMedia.type.charAt(0).toUpperCase() +
                confirmDeleteMedia.type.slice(1)}
              ?
            </h3>
            <p className="text-gray-700 mb-6 text-center">
              Are you sure you want to delete this {confirmDeleteMedia.type}?
              This action cannot be undone.
            </p>
            <div className="flex gap-4 w-full justify-end">
              <button
                className="px-6 py-2 rounded-lg bg-gray-200 text-gray-700 font-semibold hover:bg-gray-300 transition"
                onClick={() =>
                  setConfirmDeleteMedia({ item: null, type: null })
                }
              >
                Cancel
              </button>
              <button
                className="px-6 py-2 rounded-lg bg-red-500 text-white font-semibold hover:bg-red-600 transition"
                onClick={confirmDeleteMediaAction}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// Export totalMedia for dashboard usage
// export { totalMedia };

export default function Data() {
  return (
    <SidebarProvider>
      <DataContent />
    </SidebarProvider>
  );
}
