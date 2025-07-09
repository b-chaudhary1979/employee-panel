import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";

function SecurityContent() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const router = useRouter();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);

  // Responsive marginLeft for content (matches header)
  const getContentMarginLeft = () => {
    if (!isHydrated) {
      return 270; // Default to expanded sidebar during SSR
    }
    if (isMobile) {
      return 0;
    }
    return isOpen ? 270 : 64;
  };

  // Dynamically set main content top padding to header height
  useEffect(() => {
    function updateHeaderHeight() {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    }
    updateHeaderHeight();
    window.addEventListener("resize", updateHeaderHeight);
    return () => window.removeEventListener("resize", updateHeaderHeight);
  }, []);

  // Hamburger handler for mobile
  const handleMobileSidebarToggle = () => setMobileSidebarOpen((v) => !v);
  const handleMobileSidebarClose = () => setMobileSidebarOpen(false);

  // Ensure mobile sidebar is closed by default when switching to mobile view
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth < 640) {
        setMobileSidebarOpen(false);
      }
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
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
        />
        <main
          className="transition-all duration-300 px-2 sm:px-8 py-12 md:py-6"
          style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
        >
          <div className="max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold">Passwords & Security</h1>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Security() {
  return (
    <SidebarProvider>
      <SecurityContent />
    </SidebarProvider>
  );
}
