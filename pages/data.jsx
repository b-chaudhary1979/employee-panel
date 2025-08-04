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
import useFetchEmployeeData from "../hooks/useFetchEmployeeData";

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

// Data structure is now fetched from employee-specific collections

function DataContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading: userLoading, error: userError } = useUserInfo();
  const [notification, setNotification] = useState({ show: false, message: "", color: "green" });
  const [activeTab, setActiveTab] = useState("images");
  
  // Fetch employee data from the new structure
  const { data: employeeData, loading: dataLoading, error: dataError } = useFetchEmployeeData(ci, aid);
  
  // Favourites state
  const [favImages, setFavImages] = useState([]);
  const [favVideos, setFavVideos] = useState([]);
  const [favMusic, setFavMusic] = useState([]);

  // Handlers for adding/removing favourites
  const handleFavourite = (item, isFav, type) => {
    if (type === "image") {
      setFavImages(favs => {
        if (isFav) {
          if (favs.some(i => i.id === item.id)) return favs;
          setNotification({ show: true, message: 'Added to Favourites', color: 'green' });
          setTimeout(() => setNotification({ show: false, message: '', color: 'green' }), 1500);
          return [...favs, item];
        } else {
          return favs.filter(i => i.id !== item.id);
        }
      });
    } else if (type === "video") {
      setFavVideos(favs => {
        if (isFav) {
          if (favs.some(i => i.id === item.id)) return favs;
          setNotification({ show: true, message: 'Added to Favourites', color: 'green' });
          setTimeout(() => setNotification({ show: false, message: '', color: 'green' }), 1500);
          return [...favs, item];
        } else {
          return favs.filter(i => i.id !== item.id);
        }
      });
    } else if (type === "music") {
      setFavMusic(favs => {
        if (isFav) {
          if (favs.some(i => i.id === item.id)) return favs;
          setNotification({ show: true, message: 'Added to Favourites', color: 'green' });
          setTimeout(() => setNotification({ show: false, message: '', color: 'green' }), 1500);
          return [...favs, item];
        } else {
          return favs.filter(i => i.id !== item.id);
        }
      });
    }
  };

  const handleRemoveFavourite = (item) => {
    if (item.type === "image") setFavImages(favs => {
      const updated = favs.filter(i => i.id !== item.id);
      if (favs.length !== updated.length) {
        setNotification({ show: true, message: 'Removed from Favourites', color: 'red' });
        setTimeout(() => setNotification({ show: false, message: '', color: 'red' }), 1500);
      }
      return updated;
    });
    if (item.type === "video") setFavVideos(favs => {
      const updated = favs.filter(i => i.id !== item.id);
      if (favs.length !== updated.length) {
        setNotification({ show: true, message: 'Removed from Favourites', color: 'red' });
        setTimeout(() => setNotification({ show: false, message: '', color: 'red' }), 1500);
      }
      return updated;
    });
    if (item.type === "music") setFavMusic(favs => {
      const updated = favs.filter(i => i.id !== item.id);
      if (favs.length !== updated.length) {
        setNotification({ show: true, message: 'Removed from Favourites', color: 'red' });
        setTimeout(() => setNotification({ show: false, message: '', color: 'red' }), 1500);
      }
      return updated;
    });
  };

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  useEffect(() => {
    if (error) {
      setNotification({ show: true, message: `Error loading user info: ${error}` });
      const timer = setTimeout(() => setNotification({ show: false, message: "" }), 2000);
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
  if (userLoading || dataLoading) {
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
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className={`bg-gradient-to-r ${notification.color === 'green' ? 'from-green-500 to-green-400' : 'from-red-500 to-pink-500'} text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown`}>
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            {notification.message}
          </div>
        </div>
      )}
      <div className="bg-[#fbf9f4] min-h-screen flex relative">
        {/* Sidebar for desktop */}
        <div className="hidden sm:block fixed top-0 left-0 h-full z-40" style={{ width: 270 }}>
          <SideMenu />
        </div>
        {/* Sidebar for mobile (full screen overlay) */}
        {mobileSidebarOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-white">
            <button className="absolute top-4 right-4 z-60 text-3xl text-gray-500" aria-label="Close sidebar" onClick={handleMobileSidebarClose}>
              &times;
            </button>
            <SideMenu mobileOverlay={true} />
          </div>
        )}
        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-screen transition-all duration-300" style={{ marginLeft: getContentMarginLeft() }}>
          {/* Header */}
          <Header ref={headerRef} onMobileSidebarToggle={handleMobileSidebarToggle} mobileSidebarOpen={mobileSidebarOpen} username={user?.name || "admin"} companyName={user?.company || "company name"} />
          <main className="transition-all duration-300 px-2 mt-6 sm:px-8 py-12 md:py-6" style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}>
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#7c3aed] mb-1">Data Management</h1>
                  <p className="text-gray-500 text-lg">Manage your data and view analytics here.</p>
                  {/* Total Media Card UI */}
                  <div className="w-64 bg-white rounded-2xl shadow border border-gray-100 p-6 flex items-center gap-4 mt-4">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                      {/* Media icon (play button) */}
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-6.518-3.759A1 1 0 007 8.118v7.764a1 1 0 001.234.97l6.518-1.757A1 1 0 0016 14.882V9.118a1 1 0 00-1.248-.95z" />
                      </svg>
                    </div>
                    <div>
                      <div className="text-gray-500 text-lg font-medium">Total Media</div>
                      <div className="text-3xl font-bold text-gray-700">
                    {employeeData.images.length + employeeData.videos.length + employeeData.audio.length + employeeData.documents.length + employeeData.links.length}
                  </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                  <button
                    onClick={() => router.push(`/add-documents?cid=${ci}`)}
                    className="bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg transition-all duration-200 flex items-center gap-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add Data
                  </button>
                </div>
              {/* Horizontal options bar */}
              <div className="flex gap-4 mb-8 border-b border-gray-200">
                {[
                  { key: "images", label: "Images" },
                  { key: "videos", label: "Videos" },
                  { key: "music", label: "Music" },
                  { key: "links", label: "Links" },
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
                    style={{ background: activeTab === tab.key ? "#fff" : "#f3f4f6" }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
              {/* Tab content */}
              <div className="bg-white rounded-2xl shadow border border-gray-100 p-8">
                {activeTab === "images" && <ImagesSection images={employeeData.images} onFavourite={(item, isFav) => handleFavourite(item, isFav, "image")} />}
                {activeTab === "videos" && <VideosSection videos={employeeData.videos} onFavourite={(item, isFav) => handleFavourite(item, isFav, "video")} />}
                {activeTab === "music" && <MusicSection music={employeeData.audio} onFavourite={(item, isFav) => handleFavourite(item, isFav, "music")} />}
                {activeTab === "links" && <LinksSection links={employeeData.links} />}
                {activeTab === "favourites" && (
                  <FavouriteSection
                    favourites={employeeData.favourites}
                    onRemoveFavourite={handleRemoveFavourite}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

// Data is now fetched from employee-specific collections

export default function Data() {
  return (
    <SidebarProvider>
      <DataContent />
    </SidebarProvider>
  );
} 