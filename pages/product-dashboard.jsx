import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import CryptoJS from "crypto-js";
import AutoIntegration from "../components/autointegration";
import ManualProductIntegration from "../components/manualproductintegration";
import { SidebarProvider } from "../context/SidebarContext";
import { useSidebar } from "../context/SidebarContext";
import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import Loader from "../loader/Loader";
import { useUserInfo } from "../context/UserInfoContext";;

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

function ProductDashboardContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const [activeTab, setActiveTab] = useState("auto");
  const [headerHeight, setHeaderHeight] = useState(72);
  const { user, loading, error } = useUserInfo();

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  if (!ci || !aid) return null;
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen w-full"><Loader /></div>;
  }

  return (
    <div className="bg-gradient-to-br from-[#faf6ff] to-[#e9e4fa] min-h-screen flex flex-col sm:flex-row relative">
      {/* Sidebar for desktop */}
      <div className="hidden sm:block fixed top-0 left-0 h-full z-40" style={{ width: 270 }}>
        <SideMenu />
      </div>
      {/* Main content area */}
      <div
        className="flex-1 flex flex-col min-h-screen transition-all duration-300 w-full"
        style={{ marginLeft: isMobile ? 0 : isOpen ? 270 : 64 }}
      >
        <Header
          username={user?.name || "admin"}
          companyName={user?.company || "company name"}
        />
        <main className="w-full px-3 sm:px-8 py-8 sm:py-12 mt-20 sm:mt-16 md:py-10">
          <div className="w-full">
            <h1 className="text-3xl sm:text-5xl font-extrabold text-[#7c3aed] mb-2 pl-1 sm:pl-2">Product Dashboard</h1>
            <p className="text-lg sm:text-2xl text-gray-500 mb-6 sm:mb-10 pl-1 sm:pl-2">Manage your product settings and configurations</p>
            {/* Premium horizontal options */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 mb-8 sm:mb-12 w-full pl-0 sm:pl-2">
              <button
                className={`w-full sm:w-50 py-2 px-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 shadow-sm focus:outline-none ${
                  activeTab === "auto"
                    ? "bg-[#a259f7] text-white border-[#a259f7] scale-105"
                    : "bg-white text-[#a259f7] border-[#a259f7] hover:bg-[#f3e8ff]"
                }`}
                onClick={() => setActiveTab("auto")}
              >
               Integrate Product
              </button>

              <button
                className={`w-full sm:w-50 py-2 px-4 rounded-xl font-semibold text-base transition-all duration-200 border-2 shadow-sm focus:outline-none ${
                  activeTab === "manual"
                    ? "bg-[#a259f7] text-white border-[#a259f7] scale-105"
                    : "bg-white text-[#a259f7] border-[#a259f7] hover:bg-[#f3e8ff]"
                }`}
                onClick={() => setActiveTab("manual")}
              >
                List your Product
              </button>
            </div>
            {/* Integration component below options, full width, no card */}
            <div className="w-full mt-2">
              {activeTab === "auto" ? <AutoIntegration /> : <ManualProductIntegration cid={ci} />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function ProductDashboard() {
  return (
    <SidebarProvider>
      <ProductDashboardContent />
    </SidebarProvider>
  );
} 