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
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedStatus, setSelectedStatus] = useState("All Status");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const { products, loading: productsLoading, error: productsError, deleteProduct, updateProduct } = useStoreProducts(ci);

  // Get all unique statuses from products (including custom statuses)
  const allStatuses = [...new Set(products.map(p => p.status).filter(Boolean))];
  
  // Get all unique categories from products
  const allCategories = [...new Set(
    products.flatMap(product => {
      if (product.categories && Array.isArray(product.categories)) {
        return product.categories; // New array format
      }
      if (product.category && typeof product.category === 'string') {
        return [product.category]; // Fallback for old format
      }
      return [];
    }).filter(Boolean)
  )];
  
  // Predefined status options from the form
  const predefinedStatuses = [
    "Active",
    "Inactive", 
    "Pending",
    "Coming Soon",
    "Maintenance"
  ];

  // Filter products based on search query, category, and status
  const filteredProducts = products.filter(product => {
    // Search filter
    if (searchQuery.trim()) {
      const productName = (product.name || "").toLowerCase();
      const query = searchQuery.toLowerCase();
      if (!productName.startsWith(query)) return false;
    }

    // Category filter
    if (selectedCategory !== "All Categories") {
      const hasCategory = product.categories?.includes(selectedCategory) || 
                         product.category === selectedCategory;
      if (!hasCategory) {
        return false;
      }
    }

    // Status filter
    if (selectedStatus !== "All Status" && product.status !== selectedStatus) {
      return false;
    }

    return true;
  });

  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);

  // Handle clicking outside dropdowns to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showStatusDropdown && !event.target.closest('.status-dropdown-container')) {
        setShowStatusDropdown(false);
      }
      if (showCategoryDropdown && !event.target.closest('.category-dropdown-container')) {
        setShowCategoryDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showStatusDropdown, showCategoryDropdown]);

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
            className="transition-all duration-300 pl-0 pr-2 sm:pl-2 sm:pr-8 py-12 md:py-6"
            style={{
              marginLeft: 0,
              paddingTop: Math.max(headerHeight, 72) + 16,
            }}
          >
            <div className="pl-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-3xl text-[#7c3aed] font-bold">
                    Product Management
                  </h1>
                  <p className="text-gray-500 mb-6">
                    Manage your eyewear inventory and product catalog
                  </p>
                </div>
                <button
                  className="w-full sm:w-auto bg-[#7c3aed] hover:bg-[#a259f7] text-white font-semibold px-5 py-2 rounded-lg shadow flex items-center justify-center gap-2"
                  aria-label="Add Product"
                  onClick={() => router.push(`/product-dashboard?token=${encodeURIComponent(CryptoJS.AES.encrypt(JSON.stringify({ ci, aid }), ENCRYPTION_KEY).toString())}`)}
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Product
                </button>
              </div>
              
              {/* Mobile Search and Filter Card */}
              <div className="sm:hidden mt-8 mb-8 bg-white rounded-xl shadow border border-gray-100 p-6 flex flex-col gap-4">
                {/* Search Bar - First Row */}
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value.trim())}
                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-gray-900 placeholder:text-gray-400"
                  />
                </div>
                
                {/* Categories - Second Row */}
                <div className="relative category-dropdown-container">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-gray-900 bg-white text-left flex items-center justify-between"
                  >
                    <span>{selectedCategory}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                      >
                        All Categories
                      </button>
                      
                      {allCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                {/* Status - Third Row */}
                <div className="relative status-dropdown-container">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-gray-900 bg-white text-left flex items-center justify-between"
                  >
                    <span>{selectedStatus}</span>
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                      <button
                        onClick={() => {
                          setSelectedStatus("All Status");
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-4 py-3 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                      >
                        All Status
                      </button>
                      
                      {/* Predefined Statuses */}
                      {predefinedStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-4 py-3 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                        >
                          {status}
                        </button>
                      ))}
                      
                      {/* Custom Statuses (if any) */}
                      {allStatuses.filter(status => !predefinedStatuses.includes(status)).length > 0 && (
                        <>
                          <div className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-t border-b bg-gray-50">
                            Custom Statuses
                          </div>
                          {allStatuses
                            .filter(status => !predefinedStatuses.includes(status))
                            .map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-4 py-3 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                              >
                                {status}
                              </button>
                            ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Desktop Search and Filter Bar */}
              <div className="hidden sm:flex flex-col sm:flex-row items-center gap-3 mb-6">
                <input
                  type="text"
                  placeholder="Search products by name..."
                  className="flex-1 border text-gray-600 border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 placeholder-gray-500"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <div className="relative category-dropdown-container">
                  <button
                    onClick={() => setShowCategoryDropdown(!showCategoryDropdown)}
                    className="flex items-center gap-2 border border-gray-300 text-gray-500 rounded-lg px-3 py-2 focus:outline-none hover:bg-gray-50"
                  >
                    {selectedCategory}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showCategoryDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 w-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory("All Categories");
                          setShowCategoryDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                      >
                        All Categories
                      </button>
                      
                      {allCategories.map((category) => (
                        <button
                          key={category}
                          onClick={() => {
                            setSelectedCategory(category);
                            setShowCategoryDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                        >
                          {category}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="relative status-dropdown-container">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className="flex items-center gap-2 border border-gray-300 text-gray-500 rounded-lg px-3 py-2 focus:outline-none hover:bg-gray-50"
                  >
                    {selectedStatus}
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-48 w-auto">
                      <button
                        onClick={() => {
                          setSelectedStatus("All Status");
                          setShowStatusDropdown(false);
                        }}
                        className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                      >
                        All Status
                      </button>
                      
                      {/* Predefined Statuses */}
                      {predefinedStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => {
                            setSelectedStatus(status);
                            setShowStatusDropdown(false);
                          }}
                          className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                        >
                          {status}
                        </button>
                      ))}
                      
                      {/* Custom Statuses (if any) */}
                      {allStatuses.filter(status => !predefinedStatuses.includes(status)).length > 0 && (
                        <>
                          <div className="px-3 py-2 text-xs font-semibold text-gray-600 uppercase tracking-wider border-t border-b bg-gray-50">
                            Custom Statuses
                          </div>
                          {allStatuses
                            .filter(status => !predefinedStatuses.includes(status))
                            .map((status) => (
                              <button
                                key={status}
                                onClick={() => {
                                  setSelectedStatus(status);
                                  setShowStatusDropdown(false);
                                }}
                                className="w-full px-3 py-2 text-left text-gray-900 font-medium hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none transition-colors duration-200"
                              >
                                {status}
                              </button>
                            ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Product Table (Desktop/Tablet) */}
              <div className="hidden sm:block bg-white rounded-xl shadow border border-gray-100 overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">S.NO</th>
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
                    {filteredProducts.map((product, index) => (
                      <tr
                        key={product.id || product.productId}
                        className="hover:bg-gray-50 cursor-pointer"
                        onClick={() => {
                          setSelectedProduct(product);
                          setShowProductDetailModal(true);
                        }}
                      >
                        <td className="px-6 py-4 whitespace-nowrap text-center text-gray-500 font-medium">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                          {(() => {
                            const categories = product.categories || [product.category];
                            if (categories.length === 0) return "-";
                            if (categories.length <= 2) {
                              return categories.join(", ");
                            }
                            return `${categories.slice(0, 2).join(", ")}, ...`;
                          })()}
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
              
              {/* Card-based Product List (Mobile) */}
              <div className="sm:hidden mt-8">
                {filteredProducts.length === 0 ? (
                  <div className="text-center text-gray-500 text-lg">
                    No products found.
                  </div>
                ) : (
                  filteredProducts.map((product, idx) => (
                    <div
                      key={product.id || product.productId}
                      className="bg-white rounded-xl shadow border border-gray-100 p-6 mb-6 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => {
                        setSelectedProduct(product);
                        setShowProductDetailModal(true);
                      }}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <div className="font-bold text-black text-lg mb-1">
                            {product.name}
                          </div>
                          <div className="text-gray-500 text-sm">
                            ID: #{product.id || product.productId}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ml-2 ${
                            product.status === 'Active' 
                              ? 'bg-green-100 text-green-700' 
                              : product.status === 'Inactive'
                              ? 'bg-red-100 text-red-700'
                              : product.status === 'Pending'
                              ? 'bg-yellow-100 text-yellow-700'
                              : product.status === 'Coming Soon'
                              ? 'bg-blue-100 text-blue-700'
                              : product.status === 'Maintenance'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {product.status || "Active"}
                        </span>
                      </div>
                      <div className="flex gap-3 self-end">
                        <button
                          className="text-[#a259f7] hover:text-[#7c3aed]"
                          title="View Product"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedProduct(product);
                            setShowProductDetailModal(true);
                          }}
                        >
                          <svg
                            className="w-7 h-7"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                            />
                          </svg>
                        </button>
                        <button
                          className="text-red-500 hover:text-red-700"
                          title="Delete Product"
                          onClick={(e) => {
                            e.stopPropagation();
                            setDeleteProductId(product.id || product.productId);
                            setShowDeleteConfirm(true);
                          }}
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
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
