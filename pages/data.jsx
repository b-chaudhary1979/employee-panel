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

// Placeholder components
function ImagesSection() {
  return <div className="p-6 text-center text-lg text-[#7c3aed] font-semibold">Images content goes here (fetch from Firebase).</div>;
}
function SoundsSection() {
  return <div className="p-6 text-center text-lg text-blue-500 font-semibold">Sounds content goes here.</div>;
}
function MusicSection() {
  return <div className="p-6 text-center text-lg text-green-500 font-semibold">Music content goes here.</div>;
}
function LinksSection() {
  return <div className="p-6 text-center text-lg text-pink-500 font-semibold">Links content goes here.</div>;
}

function DataContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({ show: false, message: "" });
  const [activeTab, setActiveTab] = useState("images");

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
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
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
                </div>
              </div>
              {/* Horizontal options bar */}
              <div className="flex gap-4 mb-8 border-b border-gray-200">
                {[
                  { key: "images", label: "Images" },
                  { key: "sounds", label: "Sounds" },
                  { key: "music", label: "Music" },
                  { key: "links", label: "Links" },
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
                {activeTab === "images" && <ImagesSection />}
                {activeTab === "sounds" && <SoundsSection />}
                {activeTab === "music" && <MusicSection />}
                {activeTab === "links" && <LinksSection />}
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function Data() {
  return (
    <SidebarProvider>
      <DataContent />
    </SidebarProvider>
  );
} 