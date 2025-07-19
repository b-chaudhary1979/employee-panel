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
import Head from "next/head";
import ProductDetailModal from "../components/ProductDetailModal";
import useStoreProducts from "../hooks/useStoreProducts";
import { Pen, Trash2 } from "lucide-react";

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
  const [headerHeight, setHeaderHeight] = useState(72);
  const [integrationType, setIntegrationType] = useState("auto");
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAutoPopup, setShowAutoPopup] = useState(false);
  const [showManualPopup, setShowManualPopup] = useState(false);
  const [showProductDetailModal, setShowProductDetailModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteProductId, setDeleteProductId] = useState(null);
  const { products, loading: productsLoading, error: productsError, deleteProduct, updateProduct } = useStoreProducts(ci);

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

  // Handler for delete
  const handleDeleteProduct = async (id) => {
    await deleteProduct(id);
    setShowDeleteConfirm(false);
    setDeleteProductId(null);
    setNotification({ show: true, message: "Product deleted successfully!", color: "red" });
    setTimeout(() => setNotification({ show: false, message: "", color: "red" }), 2000);
  };

  // Handler for product update from modal
  const handleUpdateProduct = async (updatedProduct) => {
    const id = updatedProduct.id || updatedProduct.productId;
    await updateProduct(id, updatedProduct);
    setSelectedProduct(updatedProduct); // Update modal with new data
    setShowProductDetailModal(false);
    setNotification({ show: true, message: "Product Updated Successfully", color: "green" });
    setTimeout(() => setNotification({ show: false, message: "", color: "green" }), 2000);
  };

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
  if (loading || productsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <Loader />
      </div>
    );
  }
  if (productsError) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full text-red-600 font-bold">
        Error loading products: {productsError}
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
      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-xl shadow-2xl p-6 max-w-sm w-full">
            <h2 className="text-lg font-bold mb-4 text-red-600 flex items-center gap-2">
              <Trash2 className="w-6 h-6 text-red-600" />
              Confirm Delete
            </h2>
            <p className="mb-6 text-gray-700">Are you sure you want to delete this product? This action cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold" onClick={() => { setShowDeleteConfirm(false); setDeleteProductId(null); }}>Cancel</button>
              <button className="px-4 py-2 rounded bg-red-600 hover:bg-red-700 text-white font-semibold" onClick={() => handleDeleteProduct(deleteProductId)}>Delete</button>
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
              <div className="flex flex-col md:flex-row gap-3 mb-4 items-center bg-white p-3 rounded-xl shadow border border-gray-100">
                <input
                  type="text"
                  placeholder="Search products, brands, categories..."
                  className="w-full md:flex-1 px-3 py-2 rounded-lg border text-gray-500 border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base mb-2 md:mb-0"
                />
                <div className="flex flex-row w-full md:w-auto gap-2">
                  <select className="flex-1 px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base">
                    <option>All Categories</option>
                  </select>
                  <select className="flex-1 px-3 py-2 text-gray-500 rounded-lg border border-gray-200 text-base">
                    <option>All Status</option>
                  </select>
                  <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-base text-gray-700 hover:bg-gray-50 whitespace-nowrap">
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
              </div>
              {/* Product Table */}
              <div className="bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRODUCT</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">BRAND</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">PRICE</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STOCK</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CATEGORY</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">STATUS</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {products.map((product) => (
                      <tr
                        key={product.id || product.productId}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap flex items-center gap-3">
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
                              ID: #{product.id || product.productId}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700 font-medium">
                          {product.brand || product.companyName || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-bold text-gray-900">
                          ${product.price ? Number(product.price).toFixed(2) : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-green-600">
                          {product.stock ? `${product.stock} units` : "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-700">
                          {product.category || "-"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${product.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {product.status || "Active"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center flex items-center justify-center gap-3" onClick={e => e.stopPropagation()}>
                          <button
                            className="text-[#a259f7] hover:text-[#7c3aed]"
                            title="Edit"
                            onClick={e => {
                              e.stopPropagation();
                              setSelectedProduct(product);
                              setShowProductDetailModal(true);
                            }}
                          >
                            <Pen className="w-5 h-5" />
                          </button>
                          <button
                            className="text-red-500 hover:text-red-700"
                            title="Delete"
                            onClick={e => {
                              e.stopPropagation();
                              setDeleteProductId(product.id || product.productId);
                              setShowDeleteConfirm(true);
                            }}
                          >
                            <Trash2 className="w-5 h-5" />
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
      {/* Product Detail Modal */}
      <ProductDetailModal
        open={showProductDetailModal}
        onClose={() => setShowProductDetailModal(false)}
        product={selectedProduct}
        onSave={handleUpdateProduct}
      />
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
