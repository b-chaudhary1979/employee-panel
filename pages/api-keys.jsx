import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
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

import { useSidebar } from "../context/SidebarContext";
import { useRouter } from "next/router";
import { useUserInfo } from "../context/UserInfoContext";
import Loader from "../loader/Loader";
import { Lock, Eye, EyeOff, Shield, Key } from "lucide-react";

function APIKeysContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const { isOpen, isMobile, isHydrated } = useSidebar();
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  const { user, loading, error } = useUserInfo();
  const [notification, setNotification] = useState({
    show: false,
    message: "",
  });

  // Vault security state
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultKey, setVaultKey] = useState("");
  const [showVaultKey, setShowVaultKey] = useState(false);
  const [vaultAttempts, setVaultAttempts] = useState(0);
  const [isVaultLoading, setIsVaultLoading] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  // Correct vault key (in production, this should be stored securely)
  const CORRECT_VAULT_KEY = "CyberClipper2024!";

  // Dummy API keys data (in production, this will be fetched from database)
  const [apiKeys, setApiKeys] = useState([
    {
      id: 1,
      serialNo: 1,
      keyName: "Stripe Payment API",
      storeDate: "2024-01-15",
      storedBy: "John Doe",
      key: "sk_live_1234567890abcdef",
      isEncrypted: true,
      isDecrypted: false,
    },
    {
      id: 2,
      serialNo: 2,
      keyName: "AWS Access Key",
      storeDate: "2024-01-20",
      storedBy: "Jane Smith",
      key: "AKIAIOSFODNN7EXAMPLE",
      isEncrypted: false,
      isDecrypted: true,
    },
    {
      id: 3,
      serialNo: 3,
      keyName: "Google Maps API",
      storeDate: "2024-01-25",
      storedBy: "Mike Johnson",
      key: "AIzaSyBweOkTz2iTZQiN45P6IeWOA-jlWVL8hQY",
      isEncrypted: true,
      isDecrypted: false,
    },
  ]);

  // Calculate totals
  const totalKeys = apiKeys.length;
  const activeKeys = apiKeys.filter((key) => !key.isEncrypted).length;

  const handleEncrypt = (keyId) => {
    setApiKeys((prevKeys) =>
      prevKeys.map((key) =>
        key.id === keyId
          ? { ...key, isEncrypted: true, isDecrypted: false }
          : key
      )
    );
    setNotification({
      show: true,
      message: "API key encrypted successfully!",
    });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  const handleDecrypt = (keyId) => {
    setApiKeys((prevKeys) =>
      prevKeys.map((key) =>
        key.id === keyId
          ? { ...key, isEncrypted: false, isDecrypted: true }
          : key
      )
    );
    setNotification({
      show: true,
      message: "API key decrypted successfully!",
    });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

  // Check if vault is locked on component mount
  useEffect(() => {
    const storedLockout = localStorage.getItem("vaultLockoutUntil");
    if (storedLockout) {
      const lockoutTime = new Date(storedLockout);
      const now = new Date();
      if (lockoutTime > now) {
        setIsVaultLocked(true);
        setLockoutUntil(lockoutTime);
      } else {
        // Lockout expired, clear storage
        localStorage.removeItem("vaultLockoutUntil");
        localStorage.removeItem("vaultFailedAttempts");
      }
    }

    // Check for existing failed attempts
    const storedAttempts = localStorage.getItem("vaultFailedAttempts");
    if (storedAttempts) {
      const attempts = JSON.parse(storedAttempts);
      const now = new Date();
      const timeDiff = now - new Date(attempts.lastAttempt);

      // If more than 24 hours have passed, reset attempts
      if (timeDiff > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("vaultFailedAttempts");
        setVaultAttempts(0);
      } else {
        setVaultAttempts(attempts.count);
      }
    }
  }, []);

  const handleVaultSubmit = async (e) => {
    e.preventDefault();
    setIsVaultLoading(true);

    // Simulate processing delay for security
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (vaultKey === CORRECT_VAULT_KEY) {
      setIsVaultUnlocked(true);
      // Reset failed attempts on successful login
      localStorage.removeItem("vaultFailedAttempts");
      setVaultAttempts(0);
      setNotification({
        show: true,
        message:
          "Vault unlocked successfully! Welcome to your secure API keys.",
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    } else {
      const newAttempts = vaultAttempts + 1;
      setVaultAttempts(newAttempts);
      setVaultKey("");

      // Store failed attempt with timestamp
      const failedAttempts = {
        count: newAttempts,
        lastAttempt: new Date().toISOString(),
      };
      localStorage.setItem(
        "vaultFailedAttempts",
        JSON.stringify(failedAttempts)
      );

      if (newAttempts >= 3) {
        // Lock vault for 24 hours
        const lockoutTime = new Date();
        lockoutTime.setHours(lockoutTime.getHours() + 24);
        setLockoutUntil(lockoutTime);
        setIsVaultLocked(true);
        localStorage.setItem("vaultLockoutUntil", lockoutTime.toISOString());

        setNotification({
          show: true,
          message: "Too many failed attempts. Vault locked for 24 hours.",
        });
        setTimeout(() => setNotification({ show: false, message: "" }), 5000);
      } else {
        setNotification({
          show: true,
          message: `Incorrect vault key. ${
            3 - newAttempts
          } attempts remaining.`,
        });
        setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      }
    }
    setIsVaultLoading(false);
  };

  // Format remaining lockout time
  const getRemainingLockoutTime = () => {
    if (!lockoutUntil) return "";
    const now = new Date();
    const diff = lockoutUntil - now;
    if (diff <= 0) return "";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Temporary reset function for development (remove in production)
  const resetVaultLockout = () => {
    localStorage.removeItem("vaultLockoutUntil");
    localStorage.removeItem("vaultFailedAttempts");
    setIsVaultLocked(false);
    setLockoutUntil(null);
    setVaultAttempts(0);
    setNotification({
      show: true,
      message: "Vault lockout reset for development.",
    });
    setTimeout(() => setNotification({ show: false, message: "" }), 3000);
  };

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
          className="flex-1 flex flex-col min-h-screen transition-all duration-300 relative"
          style={{
            marginLeft: getContentMarginLeft(),
            zIndex: !mobileSidebarOpen && !isOpen ? 50 : 0, // lift above collapsed sidebar
          }}
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
            className="transition-all duration-300 px-2 mt-6 sm:px-8 py-12 md:py-6 relative"
            style={{
              marginLeft: 0,
              paddingTop: Math.max(headerHeight, 72) + 16,
              zIndex: 1, // ensure content stays above header
            }}
          >
            <div className="max-w-6xl mx-auto">
              {!isVaultUnlocked ? (
                // Vault Lock Screen
                <div className="flex items-center justify-center min-h-[60vh]">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 w-full max-w-md">
                    <div className="text-center mb-8">
                      <div
                        className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${
                          isVaultLocked ? "bg-red-100" : "bg-red-100"
                        }`}
                      >
                        <Shield
                          className={`w-8 h-8 ${
                            isVaultLocked ? "text-red-600" : "text-red-600"
                          }`}
                        />
                      </div>
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                        {isVaultLocked ? "Vault Locked" : "Secure Vault"}
                      </h1>
                      <p className="text-gray-500 text-lg">
                        {isVaultLocked
                          ? "Vault is temporarily locked due to multiple failed attempts"
                          : "Enter your vault key to access API keys"}
                      </p>
                      {isVaultLocked && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-sm font-semibold">
                            Locked for: {getRemainingLockoutTime()}
                          </p>
                          <button
                            onClick={resetVaultLockout}
                            className="mt-2 text-xs text-blue-600 hover:text-blue-800 underline"
                          >
                            Reset for Development
                          </button>
                        </div>
                      )}
                    </div>

                    {!isVaultLocked && (
                      <form onSubmit={handleVaultSubmit} className="space-y-6">
                        <div>
                          <label className="block text-lg font-semibold text-gray-700 mb-2">
                            Vault Key
                          </label>
                          <div className="relative">
                            <input
                              type={showVaultKey ? "text" : "password"}
                              value={vaultKey}
                              onChange={(e) => setVaultKey(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-lg text-gray-900"
                              placeholder="Enter vault key..."
                              required
                              disabled={isVaultLoading}
                            />
                            <button
                              type="button"
                              onClick={() => setShowVaultKey(!showVaultKey)}
                              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                              {showVaultKey ? (
                                <EyeOff size={20} />
                              ) : (
                                <Eye size={20} />
                              )}
                            </button>
                          </div>
                          {vaultAttempts > 0 && (
                            <p className="text-red-500 text-sm mt-1">
                              Incorrect key. {3 - vaultAttempts} attempts
                              remaining.
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isVaultLoading || vaultAttempts >= 3}
                          className="w-full bg-[#a259f7] hover:bg-[#7c3aed] disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-lg"
                        >
                          {isVaultLoading ? (
                            <>
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <Lock size={20} />
                              Unlock Vault
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    <div className="mt-6 text-center">
                      <p className="text-sm text-gray-500">
                        {isVaultLocked
                          ? "The vault will automatically unlock after the lockout period expires."
                          : "This vault contains sensitive API keys. Access is restricted to authorized personnel only."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // API Keys Content (when vault is unlocked)
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                        API Keys
                      </h1>
                      <p className="text-gray-500 text-lg">
                        Your secure API key management
                      </p>
                    </div>
                    <div className="flex items-center gap-2 bg-green-100 text-green-700 px-4 py-2 rounded-lg border border-green-200">
                      <Shield size={18} />
                      <span className="text-sm font-semibold">
                        Vault Unlocked
                      </span>
                    </div>
                  </div>

                  {/* API Keys Summary Boxes */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Total API Keys */}
                      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                        <div className="flex flex-col justify-center w-full">
                          <span className="text-lg text-gray-500 font-semibold">
                            Total API Keys
                          </span>
                          <span className="text-3xl font-bold text-blue-600">
                            {totalKeys}
                          </span>
                        </div>
                        <div className="p-3 bg-blue-100 border-2 border-blue-600 rounded-lg self-center ml-4">
                          <Key size={28} className="text-blue-600" />
                        </div>
                      </div>
                      {/* Active API Keys */}
                      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-6 py-6 flex items-stretch w-full cursor-pointer">
                        <div className="flex flex-col justify-center w-full">
                          <span className="text-lg text-gray-500 font-semibold">
                            Active API Keys
                          </span>
                          <span className="text-3xl font-bold text-green-600">
                            {activeKeys}
                          </span>
                        </div>
                        <div className="p-3 bg-green-100 border-2 border-green-600 rounded-lg self-center ml-4">
                          <Key size={28} className="text-green-600" />
                        </div>
                      </div>
                      {/* Add API Key Button */}
                      <div className="flex-1 flex items-center justify-center">
                        <button
                          className="bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg shadow transition-colors duration-200 px-6 py-6 text-lg flex items-center gap-2 w-full h-full"
                          onClick={() => {
                            // TODO: Open add API key modal
                            console.log("Add API Key clicked");
                          }}
                        >
                          <span className="text-2xl font-bold">+</span>
                          Add API Key
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* API Keys Table */}
                  <div className="bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-left">
                        <thead>
                          <tr className="bg-[#f3e8ff] text-gray-900">
                            <th className="py-4 px-6 text-left font-semibold">
                              Serial No
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                              Key Name
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                              Store Date
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                              Stored By
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                              Key
                            </th>
                            <th className="py-4 px-6 text-left font-semibold">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {apiKeys.map((key) => (
                            <tr
                              key={key.id}
                              className="border-t border-gray-100 text-gray-900 hover:bg-gray-50 transition-colors"
                            >
                              <td className="py-4 px-6 font-bold text-lg">
                                {key.serialNo}
                              </td>
                              <td className="py-4 px-6 text-gray-700 font-semibold">
                                {key.keyName}
                              </td>
                              <td className="py-4 px-6 text-gray-700">
                                {key.storeDate}
                              </td>
                              <td className="py-4 px-6 text-gray-700">
                                {key.storedBy}
                              </td>
                              <td className="py-4 px-6">
                                <div className="flex items-center gap-2">
                                  <span className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                                    {key.isEncrypted
                                      ? "••••••••••••••••"
                                      : key.key}
                                  </span>
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                      key.isEncrypted
                                        ? "bg-red-100 text-red-600"
                                        : "bg-green-100 text-green-600"
                                    }`}
                                  >
                                    {key.isEncrypted
                                      ? "Encrypted"
                                      : "Decrypted"}
                                  </span>
                                </div>
                              </td>
                              <td className="py-4 px-6">
                                {key.isEncrypted ? (
                                  <button
                                    onClick={() => handleDecrypt(key.id)}
                                    className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-3 py-1 text-sm transition-colors duration-200"
                                  >
                                    Decrypt
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleEncrypt(key.id)}
                                    className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-3 py-1 text-sm transition-colors duration-200"
                                  >
                                    Encrypt
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
}

export default function APIKeys() {
  return (
    <SidebarProvider>
      <APIKeysContent />
    </SidebarProvider>
  );
}
