import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import AutoIntegration from "../components/autointegration";
import ManualProductIntegration from "../components/manualproductintegration";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import { Fragment } from "react";
import Head from "next/head";

// Utility to decrypt token into ci and aid
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

function ProductsContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [integrationType, setIntegrationType] = useState("auto");
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [showManualPopup, setShowManualPopup] = useState(false);

  // Placeholder product data
  const products = [
    {
      id: 1,
      name: "Ray-Ban Aviator Classic",
      brand: "Ray-Ban",
      price: 129.99,
      stock: 45,
      category: "Sunglasses",
      status: "Active",
      image: "",
    },
    {
      id: 2,
      name: "Oakley Holbrook",
      brand: "Oakley",
      price: 89.99,
      stock: 12,
      category: "Sunglasses",
      status: "Active",
      image: "",
    },
  ];

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

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

  // Only return after all hooks
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            {notification.message}
          </div>
        </div>
      )}
      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-xs flex flex-col items-center relative border-2 border-[#a259f7]">
            <h2 className="text-xl font-bold mb-6 text-gray-800">
              Add Product
            </h2>
            <button
              className="w-full mb-4 py-3 rounded-lg bg-[#a259f7] text-white font-semibold text-lg hover:bg-[#7c3aed] transition-colors"
              onClick={() => {
                setShowAddModal(false);
                setTimeout(() => setShowAutoPopup(true), 200);
              }}
            >
              Auto Integration
            </button>
            <button
              className="w-full py-3 rounded-lg bg-[#f3f4f6] text-[#a259f7] font-semibold text-lg border border-[#a259f7] hover:bg-[#ede9fe] transition-colors"
              onClick={() => {
                setShowAddModal(false);
                setTimeout(() => setShowManualPopup(true), 200);
              }}
            >
              Manual Integration
            </button>
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 text-2xl"
              onClick={() => setShowAddModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
          </div>
        </div>
      )}
      {/* Auto Integration Fullscreen Popup */}
      {showAutoPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 backdrop-blur-xl">
          <button
            className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-4xl z-10"
            onClick={() => setShowAutoPopup(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 overflow-auto flex flex-col">
              <AutoIntegration />
            </div>
          </div>
        </div>
      )}
      {/* Manual Integration Fullscreen Popup */}
      {showManualPopup && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-white/90 backdrop-blur-xl">
          <button
            className="absolute top-6 right-8 text-gray-400 hover:text-gray-600 text-4xl z-10"
            onClick={() => setShowManualPopup(false)}
            aria-label="Close"
          >
            &times;
          </button>
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-full h-full max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8 overflow-auto flex flex-col">
              <ManualProductIntegration />
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
            username={user?.name || "admin"}
            companyName={user?.company || "company name"}
          />
          <main
            className="transition-all duration-300 px-2 mt-6 sm:px-8 py-12 md:py-6"
            style={{ marginLeft: 0, paddingTop: headerHeight + 16 }}
          >
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-extrabold text-[#7c3aed]  mb-1">Product Management</h1>
                  <p className="text-gray-500 text-lg">Manage your eyewear inventory and product catalog</p>
                </div>
                <button
                  className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold py-2 px-4 rounded-lg shadow text-base flex items-center gap-2"
                  onClick={() =>
                    router.push({
                      pathname: "/product-dashboard",
                      query: { token },
                    })
                  }
                >
                  <span className="text-xl font-bold">+</span> Add Product
                </button>
              </div>
              {/* Search and Filters */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4 items-center bg-white p-3 rounded-xl shadow border border-gray-100">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="flex-1 px-3 py-2 rounded-lg border text-gray-500 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base"
                />
                <select className="px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base">
                  <option>All Categories</option>
                </select>
                <select className="px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base">
                  <option>All Status</option>
                </select>
                <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-base text-gray-700 hover:bg-gray-50">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                    <path
                      d="M3 6h18M3 12h18M3 18h18"
                      stroke="#a259f7"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  Filter
                </button>
              </div>
              {/* Product Table */}
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 font-semibold border-b text-xs">
                      <th className="py-3 px-4">PRODUCT</th>
                      <th className="py-3 px-4">BRAND</th>
                      <th className="py-3 px-4">PRICE</th>
                      <th className="py-3 px-4">STOCK</th>
                      <th className="py-3 px-4">CATEGORY</th>
                      <th className="py-3 px-4">STATUS</th>
                      <th className="py-3 px-4">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((product) => (
                      <tr
                        key={product.id}
                        className="border-b hover:bg-gray-50 transition"
                      >
                        <td className="py-3 px-4 flex items-center gap-3">
                          <div className="w-9 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                            {/* Placeholder for image */}
                            <svg
                              width="18"
                              height="18"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="#e5e7eb"
                                strokeWidth="2"
                              />
                            </svg>
                          </div>
                          <div>
                            <div className="font-bold text-base text-gray-900">
                              {product.name}
                            </div>
                            <div className="text-gray-400 text-xs">
                              ID: #{product.id}
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-gray-700 font-medium">
                          {product.brand}
                        </td>
                        <td className="py-3 px-4 font-bold text-gray-900">
                          ${product.price.toFixed(2)}
                        </td>
                        <td
                          className={`py-3 px-4 font-semibold ${
                            product.stock > 20
                              ? "text-green-600"
                              : "text-orange-500"
                          }`}
                        >
                          {product.stock} units
                        </td>
                        <td className="py-3 px-4 text-gray-700">
                          {product.category}
                        </td>
                        <td className="py-3 px-4">
                          <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                            {product.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 flex gap-2 items-center">
                          <button
                            className="text-[#a259f7] hover:text-[#7c3aed]"
                            title="View"
                          >
                            <svg
                              width="16"
                              height="16"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M12 5c-7 0-9 7-9 7s2 7 9 7 9-7 9-7-2-7-9-7zm0 10a3 3 0 100-6 3 3 0 000 6z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                          <button
                            className="text-[#a259f7] hover:text-[#7c3aed]"
                            title="Edit"
                          >
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M15.232 5.232l3.536 3.536M9 13l6.586-6.586a2 2 0 112.828 2.828L11.828 15.828a4 4 0 01-1.414.828l-4.243 1.414 1.414-4.243a4 4 0 01.828-1.414z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                          >
                            <svg
                              width="20"
                              height="20"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <path
                                d="M6 7h12M9 7V4a1 1 0 011-1h4a1 1 0 011 1v3m2 0v12a2 2 0 01-2 2H8a2 2 0 01-2-2V7h12z"
                                stroke="currentColor"
                                strokeWidth="2"
                              />
                            </svg>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function Products() {
  return (
    <SidebarProvider>
      <ProductsContent />
    </SidebarProvider>
  );
}
