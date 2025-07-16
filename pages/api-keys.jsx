import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState, useEffect, useRef } from "react";
import { SidebarProvider } from "../context/SidebarContext";
import Head from "next/head";
import useStoreApiKeys from "../hooks/useStoreApiKeys";
import {
  EncryptModal,
  DecryptModal,
  AddKeyModal,
  AddKeyEncryptModal,
  KeyDetailVaultModal,
  KeyDetailModal,
  DeleteKeyModal, // <-- import the new modal
} from "../components/ApikeyModal";
import {
  decryptToken,
  encryptKey,
} from "../utils/apiKeys";
import useVault from "../hooks/useVault.jsx";
import useApiKeyModals from "../hooks/useApiKeyModals.jsx";
import { useRouter } from "next/router";
import { useSidebar } from "../context/SidebarContext";
import { useUserInfo } from "../context/UserInfoContext";
import { Shield, Eye, EyeOff, Lock as LockIcon, Key } from "lucide-react";
import Loader from "../loader/Loader";
import ApiKeysTable from "../components/ApiKeysTable";

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
    type: "", // 'add', 'delete', 'error', etc.
  });

  // Add state for Add Key modal fields
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyStatus, setNewKeyStatus] = useState("Active");
  const [customKey, setCustomKey] = useState("");
  const [apiCost, setApiCost] = useState("");

  // Use the API keys hook
  const {
    addKey,
    importFromFile,
    fetchKeys,
    decryptKey: serverDecryptKey,
    deleteKey, // <-- use deleteKey
    updateKeyEncryption, // <-- add this line
    updateKeyStatus, // <-- add this line
    keys: dbKeys,
    error: apiKeysError,
    fetchingKeys,
  } = useStoreApiKeys(ci, user);

  // Show loading state for API keys operations
  const [isAddingKey, setIsAddingKey] = useState(false);
  const [isImportingKeys, setIsImportingKeys] = useState(false);

  // Replace all vault-related state and logic with useVault
  const {
    isVaultUnlocked,
    vaultKey,
    setVaultKey,
    showVaultKey,
    setShowVaultKey,
    vaultAttempts,
    isVaultLoading,
    isVaultLocked,
    lockoutUntil,
    handleVaultSubmit,
    resetVaultLockout,
  } = useVault(ci);

  // API keys data from database
  const [apiKeys, setApiKeys] = useState([]);

  // Replace all modal state and handlers with useApiKeyModals
  const modals = useApiKeyModals();
  // Destructure all modal state/handlers from modals
  const {
    showEncryptModal,
    setShowEncryptModal,
    showDecryptModal,
    setShowDecryptModal,
    selectedKeyId,
    encryptionPassword,
    setEncryptionPassword,
    decryptionPassword,
    setDecryptionPassword,
    showEncryptionPassword,
    setShowEncryptionPassword,
    showDecryptionPassword,
    setShowDecryptionPassword,
    isProcessing,
    setIsProcessing,
    showAddKeyModal,
    setShowAddKeyModal,
    showAddKeyChoiceModal,
    setShowAddKeyChoiceModal,
    showImportModal,
    setShowImportModal,
    showAddKeyEncryptModal,
    setShowAddKeyEncryptModal,
    addKeyVaultKey,
    setAddKeyVaultKey,
    showAddKeyVaultKey,
    setShowAddKeyVaultKey,
    pendingAddKey,
    setPendingAddKey,
    addKeyError,
    setAddKeyError,
    showApiKey,
    setShowApiKey,
    showKeyDetailModal,
    setShowKeyDetailModal,
    selectedKey,
    setSelectedKey,
    showKeyDetailVaultModal,
    setShowKeyDetailVaultModal,
    keyDetailVaultKey,
    setKeyDetailVaultKey,
    showKeyDetailVaultKey,
    setShowKeyDetailVaultKey,
    handleEncrypt,
    handleDecrypt,
  } = modals;

  // New fields state
  const [description, setDescription] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [linkedProject, setLinkedProject] = useState("");
  const [usageLimit, setUsageLimit] = useState("");
  const [environment, setEnvironment] = useState("development");
  const [platform, setPlatform] = useState("");
  const [customPlatform, setCustomPlatform] = useState("");
  const [showCustomPlatform, setShowCustomPlatform] = useState(false);

  // Custom QA state
  const [customQA, setCustomQA] = useState([{ question: "", answer: "" }]);

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Add these state variables at the top of APIKeysContent:
  const [deleteVaultKey, setDeleteVaultKey] = useState("");
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [deleteInputKeyName, setDeleteInputKeyName] = useState("");

  // Add state for status update loading
  const [statusUpdating, setStatusUpdating] = useState(false);

  // Calculate totals
  const totalKeys = apiKeys.length;
  const activeKeys = apiKeys.filter((key) => key.status === "Active").length;
  const inactiveKeys = apiKeys.filter((key) => key.status !== "Active").length;

  // Handle platform change
  const handlePlatformChange = (e) => {
    const value = e.target.value;
    setPlatform(value);
    if (value === "custom") {
      setShowCustomPlatform(true);
    } else {
      setShowCustomPlatform(false);
      setCustomPlatform("");
    }
  };

  // Handle vault verification for key details
  const handleKeyDetailVaultSubmit = (e) => {
    e.preventDefault();
    if (keyDetailVaultKey === ci) {
      setShowKeyDetailVaultModal(false);
      setShowKeyDetailModal(true);
      setKeyDetailVaultKey("");
      setShowKeyDetailVaultKey(false);
    } else {
      setNotification({
        show: true,
        message: "Incorrect vault key. Access denied.",
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    }
  };

  // Open vault key modal before adding key
  const handleAddKey = async (e) => {
    e.preventDefault();
    setAddKeyError("");
    if (!newKeyName.trim() || !customKey.trim()) return;
    // Check for duplicate key name (case-insensitive)
    const duplicate = apiKeys.some(
      (k) => k.keyName.trim().toLowerCase() === newKeyName.trim().toLowerCase()
    );
    if (duplicate) {
      setAddKeyError("A key with this name already exists.");
      return;
    }
    setIsAddingKey(true);
    try {
      await addKey({
        keyName: newKeyName.trim(),
        rawKey: customKey,
        status: newKeyStatus,
        environment: environment || "development",
        platform: platform === "custom" ? customPlatform.trim() : platform,
        description: description.trim(),
        expiryDate: expiryDate,
        linkedProject: linkedProject.trim(),
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        apiCost: apiCost ? parseFloat(apiCost) : null,
        customQA: customQA.filter((qa) => qa.question && qa.answer),
        custom: {
          customQA: customQA.filter((qa) => qa.question && qa.answer),
        },
      });
      setShowAddKeyModal(false);
      setNewKeyName("");
      setNewKeyStatus("Active");
      setCustomKey("");
      setShowApiKey(false);
      setCustomQA([{ question: "", answer: "" }]);
      setAddKeyError("");
      setDescription("");
      setExpiryDate("");
      setLinkedProject("");
      setUsageLimit("");
      setEnvironment("development");
      setPlatform("");
      setCustomPlatform("");
      setShowCustomPlatform(false);
      setNotification({ show: true, message: "API key added!", type: "add" });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      setApiCost("");
    } catch (error) {
      setAddKeyError(error.message || "Failed to add key");
      setNotification({
        show: true,
        message: `Error: ${error.message || "Failed to add key"}`,
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    } finally {
      setIsAddingKey(false);
    }
  };

  // Handle file import
  const handleFileImport = async (file) => {
    setIsImportingKeys(true);
    try {
      await importFromFile(file);
      setNotification({
        show: true,
        message: "API keys imported successfully!",
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      setShowImportModal(false);
    } catch (error) {
      setNotification({
        show: true,
        message: `Import failed: ${error.message}`,
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    } finally {
      setIsImportingKeys(false);
    }
  };

  // Show API keys error if any
  useEffect(() => {
    if (apiKeysError) {
      setNotification({
        show: true,
        message: `API Keys Error: ${apiKeysError.message}`,
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    }
  }, [apiKeysError]);

  // Fetch keys when vault is unlocked
  useEffect(() => {
    if (isVaultUnlocked && ci) {
      fetchKeys().catch(console.error);
    }
  }, [isVaultUnlocked, ci, fetchKeys]);

  // Update local state when database keys change
  useEffect(() => {
    if (dbKeys && dbKeys.length > 0) {
      // Transform database keys to match local format
      const transformedKeys = dbKeys.map((key, index) => ({
        id: key.id || `key-${index}`,
        serialNo: index + 1,
        keyName: key.keyName,
        storeDate: key.createdAt
          ? new Date(key.createdAt).toISOString().slice(0, 10)
          : new Date().toISOString().slice(0, 10),
        storedBy: key.createdBy || user?.name || "admin",
        key: "", // Never store plaintext keys
        encryptedKey: key.encryptedKey,
        isEncrypted: true,
        isDecrypted: false,
        status: key.status || "Active",
        environment: key.environment || "development",
        platform: key.platform || "github",
        description: key.description || "",
        expiryDate: key.expiryDate || "",
        linkedProject: key.linkedProject !== undefined && key.linkedProject !== null ? key.linkedProject : '',
        usageLimit: key.usageLimit || null,
        apiCost: key.apiCost !== undefined && key.apiCost !== null
          ? key.apiCost
          : (key.custom?.apiCost !== undefined && key.custom?.apiCost !== null ? key.custom.apiCost : ''),
        custom: key.custom || {},
        customQA: key.custom?.customQA || [],
      }));
      setApiKeys(transformedKeys);
    } else if (dbKeys && dbKeys.length === 0) {
      setApiKeys([]);
    }
  }, [dbKeys, user]);

  // Check if vault is locked on component mount
  useEffect(() => {
    // The useVault hook manages its own lockout state
  }, []);

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

  // Encryption Modal submit handler
  const handleEncryptSubmit = async (e) => {
    e.preventDefault();
    if (!encryptionPassword.trim()) {
      setNotification({
        show: true,
        message: "Please enter a password for encryption.",
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      return;
    }
    setIsProcessing(true);
    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setApiKeys((prevKeys) =>
      prevKeys.map((key) =>
        key.id === selectedKeyId
          ? {
              ...key,
              encryptedKey: encryptKey(key.key, encryptionPassword),
              isEncrypted: true,
              isDecrypted: false,
            }
          : key
      )
    );
    setShowEncryptModal(false);
    setEncryptionPassword("");
    setIsProcessing(false);
  };

  // Decryption Modal submit handler
  const handleDecryptSubmit = async (e) => {
    e.preventDefault();
    if (!decryptionPassword.trim()) {
      setNotification({
        show: true,
        message: "Please enter the decryption password.",
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      return;
    }
    setIsProcessing(true);
    try {
      const selectedKeyObj = apiKeys.find((key) => key.id === selectedKeyId);
      if (!selectedKeyObj) {
        setNotification({
          show: true,
          message: "No key found.",
        });
        setTimeout(() => setNotification({ show: false, message: "" }), 3000);
        setIsProcessing(false);
        return;
      }
      // Use server-side decryption
      const decryptedKey = await serverDecryptKey(selectedKeyObj.keyName, decryptionPassword);
      if (!decryptedKey) {
        setNotification({
          show: true,
          message: "Incorrect password. Decryption failed.",
        });
        setTimeout(() => setNotification({ show: false, message: "" }), 3000);
        setIsProcessing(false);
        return;
      }
      setApiKeys((prevKeys) =>
        prevKeys.map((key) =>
          key.id === selectedKeyId
            ? {
                ...key,
                key: decryptedKey,
                isEncrypted: false,
                isDecrypted: true,
              }
            : key
        )
      );
      setShowDecryptModal(false);
      setDecryptionPassword("");
      setIsProcessing(false);
    } catch (error) {
      setNotification({
        show: true,
        message: `Decryption failed: ${error.message}`,
      });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      setIsProcessing(false);
    }
  };

  // Custom QA functions
  const handleCustomQAChange = (idx, field, value) => {
    setCustomQA((prev) => {
      const updated = [...prev];
      updated[idx][field] = value;
      return updated;
    });
  };

  const addCustomQA = () => {
    setCustomQA((prev) => [...prev, { question: "", answer: "" }]);
  };

  // Handler for delete button in KeyDetailModal
  const handleDeleteClick = () => {
    setDeleteError("");
    setShowDeleteModal(true);
  };
  // Handler for confirm delete in DeleteKeyModal
  const handleConfirmDelete = async ({ vaultKey, confirmText, inputKeyName }) => {
    setDeleteError("");
    setDeleteLoading(true);
    // Trim whitespace from all inputs
    const trimmedVaultKey = vaultKey.trim();
    const trimmedConfirmText = confirmText.trim();
    const trimmedInputKeyName = inputKeyName.trim();
    try {
      if (!selectedKey) throw new Error("No key selected");
      if (trimmedInputKeyName !== selectedKey.keyName) {
        setDeleteError("Incorrect key name. Please enter the correct key name.");
        setDeleteLoading(false);
        return;
      }
      if (trimmedVaultKey !== ci) {
        setDeleteError("Incorrect vault key.");
        setDeleteLoading(false);
        return;
      }
      if (trimmedConfirmText !== "confirm") {
        setDeleteError("You must type 'confirm' to proceed.");
        setDeleteLoading(false);
        return;
      }
      // Call deleteKey from hook
      await deleteKey(selectedKey.id, trimmedVaultKey);
      setShowDeleteModal(false);
      setShowKeyDetailModal(false);
      setNotification({ show: true, message: `API key '${selectedKey.keyName}' deleted.`, type: "delete" });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
      // Reset fields after successful delete
      setDeleteVaultKey("");
      setDeleteConfirmText("");
      setDeleteInputKeyName("");
    } catch (err) {
      setDeleteError(err.message || "Failed to delete key");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDetailEncrypt = () => {
    if (!selectedKey || !selectedKey.key) return;
    const encryptedKey = encryptKey(selectedKey.key, ci);
    setSelectedKey({
      ...selectedKey,
      encryptedKey,
      isEncrypted: true,
      isDecrypted: false,
    });
  };

  const handleDetailDecrypt = () => {
    if (!selectedKey || !selectedKey.encryptedKey) return;
    const decryptedKey = require('../utils/apiKeys').decryptKey(selectedKey.encryptedKey, ci);
    setSelectedKey({
      ...selectedKey,
      key: decryptedKey,
      isEncrypted: false,
      isDecrypted: true,
    });
  };

  // Handler for status change in KeyDetailModal
  const handleStatusChange = async (newStatus) => {
    if (!selectedKey || selectedKey.status === newStatus) return;
    setStatusUpdating(true);
    try {
      await updateKeyStatus(selectedKey.id, newStatus);
      setSelectedKey((prev) => prev ? { ...prev, status: newStatus } : prev);
      setApiKeys((prev) => prev.map((k) => k.id === selectedKey.id ? { ...k, status: newStatus } : k));
    } catch (err) {
      setNotification({ show: true, message: `Failed to update status: ${err.message}`, type: "error" });
      setTimeout(() => setNotification({ show: false, message: "" }), 3000);
    } finally {
      setStatusUpdating(false);
    }
  };

  return (
    <>      
      <Head>
        <style>{`html,body{background-color:#fbf9f4 !important;}`}</style>
      </Head>
      {notification.show && (
        <div className="fixed top-8 left-1/2 transform -translate-x-1/2 z-[100] transition-all duration-300">
          <div className={`px-7 py-3 rounded-xl shadow-xl font-semibold flex items-center gap-2 text-lg animate-slideDown
            ${notification.type === 'delete' ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              : notification.type === 'add' ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'
              : notification.message.toLowerCase().includes('error') ? 'bg-gradient-to-r from-red-500 to-pink-500 text-white'
              : 'bg-gradient-to-r from-green-500 to-emerald-500 text-white'}
          `}>
            {/* Remove the cross (X) icon for delete and error notifications */}
            {notification.message}
          </div>
        </div>
      )}

      {/* Encryption Modal */}
      <EncryptModal
        open={showEncryptModal}
        onClose={() => setShowEncryptModal(false)}
        onSubmit={handleEncryptSubmit}
        encryptionPassword={encryptionPassword}
        setEncryptionPassword={setEncryptionPassword}
        showEncryptionPassword={showEncryptionPassword}
        setShowEncryptionPassword={setShowEncryptionPassword}
        isProcessing={isProcessing}
      />
      {/* Decryption Modal */}
      <DecryptModal
        open={showDecryptModal}
        onClose={() => setShowDecryptModal(false)}
        onSubmit={handleDecryptSubmit}
        decryptionPassword={decryptionPassword}
        setDecryptionPassword={setDecryptionPassword}
        showDecryptionPassword={showDecryptionPassword}
        setShowDecryptionPassword={setShowDecryptionPassword}
        isProcessing={isProcessing}
      />
      {/* Add Key Modal */}
      <AddKeyModal
        open={showAddKeyModal}
        onClose={() => {
          setShowAddKeyModal(false);
          setAddKeyError("");
        }}
        onSubmit={handleAddKey}
        newKeyName={newKeyName}
        setNewKeyName={setNewKeyName}
        newKeyStatus={newKeyStatus}
        setNewKeyStatus={setNewKeyStatus}
        customKey={customKey}
        setCustomKey={setCustomKey}
        showApiKey={showApiKey}
        setShowApiKey={setShowApiKey}
        environment={environment}
        setEnvironment={setEnvironment}
        platform={platform}
        handlePlatformChange={handlePlatformChange}
        showCustomPlatform={showCustomPlatform}
        customPlatform={customPlatform}
        setCustomPlatform={setCustomPlatform}
        linkedProject={linkedProject}
        setLinkedProject={setLinkedProject}
        usageLimit={usageLimit}
        setUsageLimit={setUsageLimit}
        expiryDate={expiryDate}
        setExpiryDate={setExpiryDate}
        description={description}
        setDescription={setDescription}
        customQA={customQA}
        handleCustomQAChange={handleCustomQAChange}
        addCustomQA={addCustomQA}
        addKeyError={addKeyError}
        apiCost={apiCost}
        setApiCost={setApiCost}
      />
      {/* Vault Verification Modal for Key Details */}
      <KeyDetailVaultModal
        open={showKeyDetailVaultModal && !!selectedKey}
        onClose={() => {
          setShowKeyDetailVaultModal(false);
          setSelectedKey(null);
          setKeyDetailVaultKey("");
          setShowKeyDetailVaultKey(false);
        }}
        onSubmit={handleKeyDetailVaultSubmit}
        keyDetailVaultKey={keyDetailVaultKey}
        setKeyDetailVaultKey={setKeyDetailVaultKey}
        showKeyDetailVaultKey={showKeyDetailVaultKey}
        setShowKeyDetailVaultKey={setShowKeyDetailVaultKey}
      />
      {/* API Key Detail Modal */}
      <KeyDetailModal
        open={showKeyDetailModal && !!selectedKey}
        onClose={() => setShowKeyDetailModal(false)}
        selectedKey={selectedKey}
        handleEncrypt={handleDetailEncrypt}
        handleDecrypt={handleDetailDecrypt}
        onDelete={handleDeleteClick}
        updateKeyEncryption={updateKeyEncryption}
        vaultKey={ci}
        onStatusChange={handleStatusChange}
        statusUpdating={statusUpdating}
      />
      {/* Delete Key Modal */}
      <DeleteKeyModal
        open={showDeleteModal && !!selectedKey}
        onClose={() => {
          setShowDeleteModal(false);
          // Optionally reset fields on cancel/close:
          setDeleteVaultKey("");
          setDeleteConfirmText("");
          setDeleteInputKeyName("");
        }}
        onConfirm={handleConfirmDelete}
        storedBy={selectedKey?.storedBy || ""}
        keyName={selectedKey?.keyName || ""}
        error={deleteError}
        loading={deleteLoading}
        vaultKey={deleteVaultKey}
        setVaultKey={setDeleteVaultKey}
        confirmText={deleteConfirmText}
        setConfirmText={setDeleteConfirmText}
        inputKeyName={deleteInputKeyName}
        setInputKeyName={setDeleteInputKeyName}
      />
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
            className="transition-all duration-300 pl-0 pr-2 sm:pl-2 sm:pr-8 py-12 md:py-6 relative"
            style={{
              marginLeft: 0,
              paddingTop: Math.max(headerHeight, 72) + 16,
              zIndex: 1, // ensure content stays above header
            }}
          >
            <div className="pl-4">
              {!isVaultUnlocked ? (
                // Vault Lock Screen
                <div className="flex items-center justify-center min-h-[60vh] px-4">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 sm:p-8 w-full max-w-md">
                    <div className="text-center mb-6 sm:mb-8">
                      <div
                        className={`mx-auto w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 ${
                          isVaultLocked ? "bg-red-100" : "bg-red-100"
                        }`}
                      >
                        <Shield
                          className={`w-6 h-6 sm:w-8 sm:h-8 ${
                            isVaultLocked ? "text-red-600" : "text-red-600"
                          }`}
                        />
                      </div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mb-1">
                        {isVaultLocked ? "Vault Locked" : "Secure Vault"}
                      </h1>
                      <p className="text-gray-500 text-base sm:text-lg">
                        {isVaultLocked
                          ? "Vault is temporarily locked due to multiple failed attempts"
                          : "Enter your vault key to access API keys"}
                      </p>
                      {isVaultLocked && (
                        <div className="mt-4 p-2 sm:p-3 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-red-700 text-xs sm:text-sm font-semibold">
                            Locked for: {getRemainingLockoutTime(lockoutUntil)}
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
                      <form
                        onSubmit={handleVaultSubmit}
                        className="space-y-4 sm:space-y-6"
                      >
                        <div>
                          <label className="block text-base sm:text-lg font-semibold text-gray-700 mb-2">
                            Vault Key
                          </label>
                          <div className="relative">
                            <input
                              type={showVaultKey ? "text" : "password"}
                              value={vaultKey}
                              onChange={(e) => setVaultKey(e.target.value)}
                              className="w-full border border-gray-200 rounded-lg px-3 sm:px-4 py-2 sm:py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base sm:text-lg text-gray-900"
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
                                <EyeOff size={18} className="sm:w-5 sm:h-5" />
                              ) : (
                                <Eye size={18} className="sm:w-5 sm:h-5" />
                              )}
                            </button>
                          </div>
                          {vaultAttempts > 0 && (
                            <p className="text-red-500 text-xs sm:text-sm mt-1">
                              Incorrect key. {3 - vaultAttempts} attempts
                              remaining.
                            </p>
                          )}
                        </div>

                        <button
                          type="submit"
                          disabled={isVaultLoading || vaultAttempts >= 3}
                          className="w-full bg-[#a259f7] hover:bg-[#7c3aed] disabled:bg-gray-400 text-white font-semibold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2 text-base sm:text-lg"
                        >
                          {isVaultLoading ? (
                            <>
                              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                              Verifying...
                            </>
                          ) : (
                            <>
                              <LockIcon size={18} className="sm:w-5 sm:h-5" />
                              Unlock Vault
                            </>
                          )}
                        </button>
                      </form>
                    )}

                    <div className="mt-4 sm:mt-6 text-center">
                      <p className="text-xs sm:text-sm text-gray-500">
                        {isVaultLocked
                          ? "The vault will automatically unlock after the lockout period expires."
                          : "This vault contains sensitive API keys. Access is restricted to authorized personnel only."}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                // API Keys Content (when vault is unlocked)
                <div className="space-y-4 sm:space-y-6">
                  {/* Loading state for fetching keys */}
                  {fetchingKeys && (
                    <div className="flex items-center justify-center py-8">
                      <div className="flex items-center gap-3">
                        <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-gray-600 font-semibold">
                          Loading API keys...
                        </span>
                      </div>
                    </div>
                  )}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-0 mb-4 sm:mb-6">
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold text-[#7c3aed] mb-1">
                        API Keys
                      </h1>
                      <p className="text-gray-500 text-base sm:text-lg">
                        Your secure API key management
                      </p>
                    </div>
                    <div className="flex flex-col items-start">
                      <div className="flex items-center gap-2 bg-green-100 text-green-700 px-3 sm:px-4 py-2 rounded-lg border border-green-200">
                        <Shield size={16} className="sm:w-[18px] sm:h-[18px]" />
                        <span className="text-xs sm:text-sm font-semibold">
                          Vault Unlocked
                        </span>
                      </div>
                      <button
                        className="mt-2 sm:mt-[10px] bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg shadow transition-colors duration-200 px-3 sm:px-4 py-1 text-base flex items-center gap-2"
                        style={{ marginTop: "10px" }}
                        onClick={() => setShowAddKeyChoiceModal(true)}
                      >
                        <span className="text-xl font-bold">+</span>
                        Add API Key
                      </button>
                    </div>
                  </div>

                  {/* API Keys Summary Boxes */}
                  <div className="mb-8">
                    <div className="flex flex-col sm:flex-row gap-4">
                      {/* Total API Keys */}
                      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-4 py-6 sm:px-6 flex items-stretch w-full cursor-pointer">
                        <div className="flex flex-col justify-center w-full">
                          <span className="text-base sm:text-lg text-gray-500 font-semibold">
                            Total API Keys
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold text-blue-600">
                            {totalKeys}
                          </span>
                        </div>
                        <div className="p-2 sm:p-3 bg-blue-100 border-2 border-blue-600 rounded-lg self-center ml-2 sm:ml-4">
                          <Key
                            size={20}
                            className="sm:w-7 sm:h-7 text-blue-600"
                          />
                        </div>
                      </div>
                      {/* Active API Keys */}
                      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-4 py-6 sm:px-6 flex items-stretch w-full cursor-pointer">
                        <div className="flex flex-col justify-center w-full">
                          <span className="text-base sm:text-lg text-gray-500 font-semibold">
                            Active API Keys
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold text-green-600">
                            {activeKeys}
                          </span>
                        </div>
                        <div className="p-2 sm:p-3 bg-green-100 border-2 border-green-600 rounded-lg self-center ml-2 sm:ml-4">
                          <Key
                            size={20}
                            className="sm:w-7 sm:h-7 text-green-600"
                          />
                        </div>
                      </div>
                      {/* Inactive API Keys */}
                      <div className="flex-1 bg-white rounded-xl shadow border border-gray-100 hover:bg-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 px-4 py-6 sm:px-6 flex items-stretch w-full cursor-pointer">
                        <div className="flex flex-col justify-center w-full">
                          <span className="text-base sm:text-lg text-gray-500 font-semibold">
                            Inactive API Keys
                          </span>
                          <span className="text-2xl sm:text-3xl font-bold text-yellow-600">
                            {inactiveKeys}
                          </span>
                        </div>
                        <div className="p-2 sm:p-3 bg-yellow-100 border-2 border-yellow-600 rounded-lg self-center ml-2 sm:ml-4">
                          <Key
                            size={20}
                            className="sm:w-7 sm:h-7 text-yellow-600"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* API Keys Table/List extracted to presentational component */}
                  <ApiKeysTable
                    apiKeys={apiKeys}
                    fetchingKeys={fetchingKeys}
                    showDecryptModalState={showDecryptModal}
                    showEncryptModalState={showEncryptModal}
                    showAddKeyModal={showAddKeyModal}
                    showKeyDetailVaultModalState={showKeyDetailVaultModal}
                    setShowAddKeyChoiceModal={setShowAddKeyChoiceModal}
                    setShowAddKeyModal={setShowAddKeyModal}
                    setShowImportModal={setShowImportModal}
                    setSelectedKey={setSelectedKey}
                    setShowKeyDetailVaultModal={setShowKeyDetailVaultModal}
                    setKeyDetailVaultKey={setKeyDetailVaultKey}
                    setShowKeyDetailVaultKey={setShowKeyDetailVaultKey}
                    handleDecrypt={handleDecrypt}
                    handleEncrypt={handleEncrypt}
                  />
                </div>
              )}
            </div>
          </main>
        </div>
      </div>
      {/* Add Key Choice Modal */}
      {showAddKeyChoiceModal && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-xs relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
              onClick={() => setShowAddKeyChoiceModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6 text-black text-center">
              Add API Key
            </h2>
            <div className="flex flex-col gap-4">
              <button
                className="w-full bg-[#a259f7] hover:bg-[#7c3aed] text-white font-semibold rounded-lg px-4 py-3 transition-colors duration-200"
                onClick={() => {
                  setShowAddKeyChoiceModal(false);
                  setShowAddKeyModal(true);
                }}
              >
                Add keys manually
              </button>
              <button
                className="w-full bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg px-4 py-3 transition-colors duration-200"
                onClick={() => {
                  setShowAddKeyChoiceModal(false);
                  setShowImportModal(true);
                }}
              >
                Import from files
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center bg-black/20">
          <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md relative animate-fadeIn">
            <button
              className="absolute top-3 right-3 text-gray-400 hover:text-black text-2xl font-bold"
              onClick={() => setShowImportModal(false)}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-6 text-black text-center">
              Import API Keys from File
            </h2>
            <div className="text-gray-700 mb-4 text-center">
              Upload a CSV file with your API keys.
              <br />
              <span className="text-sm text-gray-500">
                Supported columns: keyName, rawKey, environment, status<br/>
                Supported format: CSV only
              </span>
            </div>
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      handleFileImport(file);
                    }
                  }}
                  className="hidden"
                  id="file-upload"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
                >
                  Choose File
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Supported format: CSV only
                </p>
              </div>
              <div className="flex justify-center gap-2">
                <button
                  className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg px-4 py-2"
                  onClick={() => setShowImportModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
