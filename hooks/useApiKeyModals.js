import { useState } from "react";

/**
 * Custom hook to manage all modal open/close state and related handlers for API key modals.
 * @returns {object} Modal states and handlers
 */
export default function useApiKeyModals() {
  // Encryption/Decryption modal state
  const [showEncryptModal, setShowEncryptModal] = useState(false);
  const [showDecryptModal, setShowDecryptModal] = useState(false);
  const [selectedKeyId, setSelectedKeyId] = useState(null);
  const [encryptionPassword, setEncryptionPassword] = useState("");
  const [decryptionPassword, setDecryptionPassword] = useState("");
  const [showEncryptionPassword, setShowEncryptionPassword] = useState(false);
  const [showDecryptionPassword, setShowDecryptionPassword] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Add Key modal state
  const [showAddKeyModal, setShowAddKeyModal] = useState(false);
  const [showAddKeyChoiceModal, setShowAddKeyChoiceModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddKeyEncryptModal, setShowAddKeyEncryptModal] = useState(false);
  const [addKeyVaultKey, setAddKeyVaultKey] = useState("");
  const [showAddKeyVaultKey, setShowAddKeyVaultKey] = useState(false);
  const [pendingAddKey, setPendingAddKey] = useState(null);
  const [addKeyError, setAddKeyError] = useState("");

  // API key visibility toggle
  const [showApiKey, setShowApiKey] = useState(false);

  // API key detail modal state
  const [showKeyDetailModal, setShowKeyDetailModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [showKeyDetailVaultModal, setShowKeyDetailVaultModal] = useState(false);
  const [keyDetailVaultKey, setKeyDetailVaultKey] = useState("");
  const [showKeyDetailVaultKey, setShowKeyDetailVaultKey] = useState(false);

  /**
   * Handler to open the encrypt modal for a given key
   * @param {string} keyId
   * @param {function} [beforeOpen] Optional callback to run before opening modal
   */
  const handleEncrypt = (keyId, beforeOpen) => {
    if (beforeOpen) beforeOpen();
    setSelectedKeyId(keyId);
    setEncryptionPassword("");
    setShowEncryptionPassword(false);
    setShowEncryptModal(true);
  };

  /**
   * Handler to open the decrypt modal for a given key
   * @param {string} keyId
   * @param {function} [beforeOpen] Optional callback to run before opening modal
   */
  const handleDecrypt = (keyId, beforeOpen) => {
    if (beforeOpen) beforeOpen();
    setSelectedKeyId(keyId);
    setDecryptionPassword("");
    setShowDecryptionPassword(false);
    setShowDecryptModal(true);
  };

  return {
    // Encryption/Decryption modals
    showEncryptModal,
    setShowEncryptModal,
    showDecryptModal,
    setShowDecryptModal,
    selectedKeyId,
    setSelectedKeyId,
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
    // Add Key modals
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
    // API key visibility
    showApiKey,
    setShowApiKey,
    // Key detail modals
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
    // Modal handlers
    handleEncrypt,
    handleDecrypt,
  };
} 