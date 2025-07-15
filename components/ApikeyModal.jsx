import { Lock, Eye, EyeOff, Key } from "lucide-react";
import React from "react"; // Added missing import for React

/**
 * Encryption Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onSubmit
 * @param {string} props.encryptionPassword
 * @param {function} props.setEncryptionPassword
 * @param {boolean} props.showEncryptionPassword
 * @param {function} props.setShowEncryptionPassword
 * @param {boolean} props.isProcessing
 */
export function EncryptModal({ open, onClose, onSubmit, encryptionPassword, setEncryptionPassword, showEncryptionPassword, setShowEncryptionPassword, isProcessing }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="border-2 border-purple-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Encrypt API Key</h2>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Encryption Password</label>
              <div className="relative">
                <input type={showEncryptionPassword ? "text" : "password"} className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base text-black" value={encryptionPassword} onChange={e => setEncryptionPassword(e.target.value)} placeholder="Enter encryption password..." required disabled={isProcessing} />
                <button type="button" onClick={() => setShowEncryptionPassword(!showEncryptionPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showEncryptionPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="bg-[#a259f7] hover:bg-[#7c3aed] disabled:bg-gray-400 text-white font-semibold rounded-lg px-6 py-3 mt-4 transition-colors duration-200 flex items-center justify-center gap-3 text-base">
              {isProcessing ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Encrypting...</>) : (<><Lock size={20} />Encrypt Key</>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Decryption Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onSubmit
 * @param {string} props.decryptionPassword
 * @param {function} props.setDecryptionPassword
 * @param {boolean} props.showDecryptionPassword
 * @param {function} props.setShowDecryptionPassword
 * @param {boolean} props.isProcessing
 */
export function DecryptModal({ open, onClose, onSubmit, decryptionPassword, setDecryptionPassword, showDecryptionPassword, setShowDecryptionPassword, isProcessing }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-lg mx-auto bg-white rounded-2xl shadow-2xl p-8 pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="border-2 border-purple-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Decrypt API Key</h2>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Decryption Password</label>
              <div className="relative">
                <input type={showDecryptionPassword ? "text" : "password"} className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base text-black" value={decryptionPassword} onChange={e => setDecryptionPassword(e.target.value)} placeholder="Enter decryption password..." required disabled={isProcessing} />
                <button type="button" onClick={() => setShowDecryptionPassword(!showDecryptionPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showDecryptionPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isProcessing} className="bg-[#a259f7] hover:bg-[#7c3aed] disabled:bg-gray-400 text-white font-semibold rounded-lg px-6 py-3 mt-4 transition-colors duration-200 flex items-center justify-center gap-3 text-base">
              {isProcessing ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Decrypting...</>) : (<><Key size={20} />Decrypt Key</>)}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Add Key Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onSubmit
 * @param {string} props.newKeyName
 * @param {function} props.setNewKeyName
 * @param {string} props.newKeyStatus
 * @param {function} props.setNewKeyStatus
 * @param {string} props.customKey
 * @param {function} props.setCustomKey
 * @param {boolean} props.showApiKey
 * @param {function} props.setShowApiKey
 * @param {string} props.environment
 * @param {function} props.setEnvironment
 * @param {string} props.platform
 * @param {function} props.handlePlatformChange
 * @param {boolean} props.showCustomPlatform
 * @param {string} props.customPlatform
 * @param {function} props.setCustomPlatform
 * @param {string} props.linkedProject
 * @param {function} props.setLinkedProject
 * @param {string} props.usageLimit
 * @param {function} props.setUsageLimit
 * @param {string} props.expiryDate
 * @param {function} props.setExpiryDate
 * @param {string} props.description
 * @param {function} props.setDescription
 * @param {Array} props.customQA
 * @param {function} props.handleCustomQAChange
 * @param {function} props.addCustomQA
 * @param {string} props.addKeyError
 * @param {string} props.apiCost
 * @param {function} props.setApiCost
 */
export function AddKeyModal({ open, onClose, onSubmit, newKeyName, setNewKeyName, newKeyStatus, setNewKeyStatus, customKey, setCustomKey, showApiKey, setShowApiKey, environment, setEnvironment, platform, handlePlatformChange, showCustomPlatform, customPlatform, setCustomPlatform, linkedProject, setLinkedProject, usageLimit, setUsageLimit, expiryDate, setExpiryDate, description, setDescription, customQA, handleCustomQAChange, addCustomQA, addKeyError, apiCost, setApiCost }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-3xl mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-purple-500">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Add API Key</h2>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Key Name <span className="text-red-600">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={newKeyName} onChange={e => setNewKeyName(e.target.value)} placeholder="Enter key name..." required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Status</label>
                <select className="w-full border rounded px-3 py-2 text-gray-800" value={newKeyStatus} onChange={e => setNewKeyStatus(e.target.value)} required>
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key <span className="text-red-600">*</span></label>
              <div className="relative">
                <input type={showApiKey ? "text" : "password"} className="w-full border rounded px-3 py-2 pr-12 placeholder-gray-500 text-gray-800" value={customKey} onChange={e => setCustomKey(e.target.value)} placeholder="Enter your API key..." required />
                <button type="button" onClick={() => setShowApiKey(!showApiKey)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showApiKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            {/* New Fields Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Environment <span className="text-red-600">*</span></label>
                <select className="w-full border rounded px-3 py-2 text-gray-800" value={environment} onChange={e => setEnvironment(e.target.value)} required>
                  <option value="development">Development</option>
                  <option value="staging">Staging</option>
                  <option value="production">Production</option>
                  <option value="testing">Testing</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Platform <span className="text-red-600">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={platform} onChange={handlePlatformChange} placeholder="github" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Api cost (per month) <span className="text-red-600">*</span></label>
              <input type="number" className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={apiCost} onChange={e => setApiCost(e.target.value)} placeholder="e.g. 49.99" min="0" step="0.01" required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Linked Project <span className="text-red-600">*</span></label>
                <input type="text" className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={linkedProject} onChange={e => setLinkedProject(e.target.value)} placeholder="e.g. Project Alpha" required />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Api Limit <span className="text-red-600">*</span></label>
                <input type="number" className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={usageLimit} onChange={e => setUsageLimit(e.target.value)} placeholder="e.g. 1000" min="0" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Renew Date <span className="text-red-600">*</span></label>
              <input type="date" className="w-full border rounded px-3 py-2 text-gray-800" value={expiryDate} onChange={e => setExpiryDate(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Purpose <span className="text-red-600">*</span></label>
              <textarea className="w-full border rounded px-3 py-2 placeholder-gray-500 text-gray-800" value={description} onChange={e => setDescription(e.target.value)} placeholder="Enter detailed description..." rows={3} required />
            </div>
            {/* Custom QA Section */}
            <div>
              <h3 className="font-semibold mb-2">Custom Questions & Answers</h3>
              {customQA.map((qa, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-2 mb-2">
                  <input type="text" placeholder="Question" value={qa.question} onChange={e => handleCustomQAChange(idx, "question", e.target.value)} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" />
                  <input type="text" placeholder="Answer" value={qa.answer} onChange={e => handleCustomQAChange(idx, "answer", e.target.value)} className="flex-1 border rounded px-3 py-2 placeholder-gray-500 text-gray-800" />
                </div>
              ))}
              <button type="button" onClick={addCustomQA} className="mt-2 px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200">+ Add Custom Q&A</button>
            </div>
            {addKeyError && <div className="text-red-600 text-sm font-semibold mt-2">{addKeyError}</div>}
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mt-4" disabled={!(newKeyName.trim() && customKey.trim())}>Add Key</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Add Key Encrypt Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onSubmit
 * @param {string} props.addKeyVaultKey
 * @param {function} props.setAddKeyVaultKey
 * @param {boolean} props.showAddKeyVaultKey
 * @param {function} props.setShowAddKeyVaultKey
 * @param {string} props.addKeyError
 * @param {boolean} props.isAddingKey
 */
export function AddKeyEncryptModal({ open, onClose, onSubmit, addKeyVaultKey, setAddKeyVaultKey, showAddKeyVaultKey, setShowAddKeyVaultKey, addKeyError, isAddingKey }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="border-2 border-purple-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold mb-6 text-black">Enter Vault Key to Encrypt</h2>
          <form className="flex flex-col gap-6" onSubmit={onSubmit}>
            <div>
              <label className="block text-base font-semibold text-gray-700 mb-3">Vault Key</label>
              <div className="relative">
                <input type={showAddKeyVaultKey ? "text" : "password"} className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-[#a259f7] text-base text-black" value={addKeyVaultKey} onChange={e => setAddKeyVaultKey(e.target.value)} placeholder="Enter vault key..." required />
                <button type="button" onClick={() => setShowAddKeyVaultKey(!showAddKeyVaultKey)} className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showAddKeyVaultKey ? <EyeOff size={20} /> : <Eye size={20} />}</button>
              </div>
            </div>
            {addKeyError && <div className="text-red-600 text-sm font-semibold mt-2">{addKeyError}</div>}
            <button type="submit" disabled={isAddingKey} className="bg-[#a259f7] hover:bg-[#7c3aed] disabled:bg-gray-400 text-white font-semibold rounded-lg px-6 py-3 mt-4 transition-colors duration-200 flex items-center justify-center gap-3 text-base">{isAddingKey ? (<><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>Adding Key...</>) : ("Encrypt & Add Key")}</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * Vault Verification Modal for Key Details
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onSubmit
 * @param {string} props.keyDetailVaultKey
 * @param {function} props.setKeyDetailVaultKey
 * @param {boolean} props.showKeyDetailVaultKey
 * @param {function} props.setShowKeyDetailVaultKey
 */
export function KeyDetailVaultModal({ open, onClose, onSubmit, keyDetailVaultKey, setKeyDetailVaultKey, showKeyDetailVaultKey, setShowKeyDetailVaultKey }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-6 overflow-y-auto max-h-[90vh] pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow space-y-4 text-gray-800 border-2 border-purple-500">
          <h2 className="text-2xl font-bold mb-4 text-purple-600">Verify Access</h2>
          <p className="text-gray-600 mb-4">Enter vault key to view API key details</p>
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Vault Key <span className="text-red-600">*</span></label>
              <div className="relative">
                <input type={showKeyDetailVaultKey ? "text" : "password"} className="w-full border rounded px-3 py-2 pr-12 placeholder-gray-500 text-gray-800" value={keyDetailVaultKey} onChange={e => setKeyDetailVaultKey(e.target.value)} placeholder="Enter vault key..." required />
                <button type="button" onClick={() => setShowKeyDetailVaultKey(!showKeyDetailVaultKey)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">{showKeyDetailVaultKey ? <EyeOff size={18} /> : <Eye size={18} />}</button>
              </div>
            </div>
            <button type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl mt-4">Verify & View Details</button>
          </form>
        </div>
      </div>
    </div>
  );
}

/**
 * API Key Detail Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {Object} props.selectedKey
 * @param {function} props.handleEncrypt
 * @param {function} props.handleDecrypt
 * @param {function} props.onDelete
 * @param {function} props.updateKeyEncryption
 * @param {string} props.vaultKey
 * @param {function} props.onStatusChange
 * @param {boolean} props.statusUpdating
 */
export function KeyDetailModal({ open, onClose, selectedKey, handleEncrypt, handleDecrypt, onDelete, updateKeyEncryption, vaultKey, onStatusChange, statusUpdating }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const [wasDecrypted, setWasDecrypted] = React.useState(false);
  const [reencrypting, setReencrypting] = React.useState(false);
  const [reencryptError, setReencryptError] = React.useState("");

  // Set wasDecrypted to true when user decrypts
  const handleDecryptWithFlag = (id) => {
    setWasDecrypted(true);
    handleDecrypt(id, onClose); // Close this modal before opening decrypt modal
  };

  // On modal close, re-encrypt if needed
  const handleClose = async () => {
    setReencryptError("");
    if (wasDecrypted && selectedKey && !selectedKey.isEncrypted && selectedKey.key) {
      setReencrypting(true);
      try {
        await updateKeyEncryption(selectedKey.id, selectedKey.key, vaultKey);
      } catch (err) {
        setReencryptError(err.message || "Failed to re-encrypt key");
      } finally {
        setReencrypting(false);
        setWasDecrypted(false);
        onClose();
      }
    } else {
      setWasDecrypted(false);
      onClose();
    }
  };

  if (!open || !selectedKey) return null;
  const customQA = Array.isArray(selectedKey.customQA)
    ? selectedKey.customQA
    : (selectedKey.custom && Array.isArray(selectedKey.custom.customQA) ? selectedKey.custom.customQA : []);
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-white/40 backdrop-blur-md pointer-events-none p-4">
      <div className="relative w-full max-w-[850px] mx-auto p-6 pointer-events-auto max-h-[640px]">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={handleClose} disabled={reencrypting}>&#8592; Back</button>
        <div className="bg-white border-2 border-purple-500 rounded-xl p-6 overflow-y-auto max-h-[500px]">
          <h2 className="text-xl font-bold mb-4 text-black">API Key Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-[15px] mb-4">
            <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Stored By</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.storedBy || '-'}</span></div>
            <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Stored Date</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.storeDate || '-'}</span></div>
            <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Key Name</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.keyName}</span></div>
            <div className="mb-2">
              <span className="block font-semibold text-gray-700 mb-1">Status</span>
              <select
                className={"block border border-gray-300 rounded px-3 py-2 bg-gray-50 font-bold text-sm w-full " + (selectedKey.status === "Active" ? "bg-green-100 text-green-600" : "bg-gray-200 text-gray-600")}
                value={selectedKey.status || "Active"}
                onChange={e => onStatusChange(e.target.value)}
                disabled={statusUpdating}
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
              {statusUpdating && <span className="text-xs text-gray-500 ml-2">Updating...</span>}
            </div>
            <div className="mb-2 md:col-span-2"><span className="block font-semibold text-gray-700 mb-1">API Key</span><span className="block font-mono text-base bg-gray-50 px-3 py-2 rounded border border-gray-300 text-black select-all" style={{wordBreak: 'break-all', fontSize: '1.1rem', letterSpacing: '0.03em'}}>{selectedKey.isEncrypted ? selectedKey.encryptedKey : selectedKey.key}</span></div>
            {selectedKey.environment && (<div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Environment</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900 capitalize">{selectedKey.environment}</span></div>)}
            {selectedKey.platform && (<div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Platform</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900 capitalize">{selectedKey.platform}</span></div>)}
            <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Api cost (per month)</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.apiCost !== '' && selectedKey.apiCost !== undefined && selectedKey.apiCost !== null ? selectedKey.apiCost : 'N/A'}</span></div>
            {selectedKey.linkedProject && selectedKey.linkedProject !== selectedKey.keyName && (
              <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Linked Project</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.linkedProject}</span></div>
            )}
            {selectedKey.usageLimit && (<div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Api Limit</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.usageLimit}</span></div>)}
            <div className="mb-2"><span className="block font-semibold text-gray-700 mb-1">Renew Date</span><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{selectedKey.expiryDate}</span></div>
            <div className="mb-2 md:col-span-2"><span className="block font-semibold text-gray-700 mb-1">Purpose</span><div className="mt-1"><span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900 text-sm">{selectedKey.description}</span></div></div>
            {/* Show any other fields not already shown */}
            {Object.entries(selectedKey).map(([key, value]) => {
              const shown = [
                "id","serialNo","keyName","storeDate","storedBy","key","encryptedKey","isEncrypted","isDecrypted","status","environment","platform","linkedProject","usageLimit","expiryDate","description","custom","customQA","apiCost"
              ];
              if (shown.includes(key)) return null;
              if (typeof value === "object" && value !== null) return null;
              return (
                <div className="mb-2" key={key}>
                  <span className="block font-semibold text-gray-700 mb-1">{key.replace(/:$/, "")}</span>
                  <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{String(value)}</span>
                </div>
              );
            })}
            {/* Custom Q&A in two-column format */}
            {customQA && customQA.length > 0 && customQA.map((qa, idx) => (
              <React.Fragment key={idx}>
                <div className="mb-2">
                  <span className="block font-semibold text-gray-700 mb-1">Custom Q{customQA.length > 1 ? `${idx + 1}` : ''}</span>
                  <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{qa.question}</span>
                </div>
                <div className="mb-2">
                  <span className="block font-semibold text-gray-700 mb-1">Custom A{customQA.length > 1 ? `${idx + 1}` : ''}</span>
                  <span className="block border border-gray-300 rounded px-3 py-2 bg-gray-50 text-gray-900">{qa.answer}</span>
                </div>
              </React.Fragment>
            ))}
          </div>
          <div className="flex gap-2 mt-4">
            <button className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200" onClick={onDelete} disabled={reencrypting}>Delete</button>
            {selectedKey.isEncrypted ? (
              <button className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200" onClick={handleDecrypt} disabled={reencrypting}>Decrypt</button>
            ) : (
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200" onClick={handleEncrypt} disabled={reencrypting}>Encrypt</button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Delete Key Modal
 * @param {Object} props
 * @param {boolean} props.open
 * @param {function} props.onClose
 * @param {function} props.onConfirm
 * @param {string} props.storedBy
 * @param {string} props.keyName
 * @param {string} props.error
 * @param {boolean} props.loading
 * @param {string} props.vaultKey
 * @param {function} props.setVaultKey
 * @param {string} props.confirmText
 * @param {function} props.setConfirmText
 * @param {string} props.inputUsername
 * @param {function} props.setInputUsername
 * @param {string} props.inputKeyName
 * @param {function} props.setInputKeyName
 */
export function DeleteKeyModal({ open, onClose, onConfirm, storedBy, keyName, error, loading, vaultKey, setVaultKey, confirmText, setConfirmText, inputKeyName, setInputKeyName }) {
  React.useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    return () => document.body.classList.remove('overflow-hidden');
  }, [open]);

  const [showDeleteVaultKey, setShowDeleteVaultKey] = React.useState(false);

  return !open ? null : (
    <div className="fixed inset-0 z-[210] flex items-center justify-center bg-black/40 backdrop-blur-md pointer-events-none">
      <div className="relative w-full max-w-md mx-auto bg-white rounded-2xl shadow-2xl p-8 pointer-events-auto">
        <button className="absolute top-2 left-4 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded text-gray-700 font-semibold" onClick={onClose}>&#8592; Back</button>
        <div className="border-2 border-red-500 rounded-xl p-6">
          <h2 className="text-xl font-bold mb-4 text-red-600">Confirm Delete API Key</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-black">Key Name</label>
            <input className="w-full border-2 border-blue-500 rounded px-3 py-2 bg-white text-black" value={inputKeyName} onChange={e => setInputKeyName(e.target.value)} placeholder="Enter key name" />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-black">Vault Key</label>
            <div className="relative">
              <input className="w-full border-2 border-blue-500 rounded px-3 py-2 bg-white text-black pr-12" type={showDeleteVaultKey ? "text" : "password"} value={vaultKey} onChange={e => setVaultKey(e.target.value)} placeholder="Enter vault key..." />
              <button type="button" onClick={() => setShowDeleteVaultKey(v => !v)} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showDeleteVaultKey ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1 text-black">Type <span className="font-bold">confirm</span> to proceed</label>
            <input className="w-full border-2 border-blue-500 rounded px-3 py-2 bg-white text-black" value={confirmText} onChange={e => setConfirmText(e.target.value)} placeholder="Type 'confirm' to enable delete" />
          </div>
          {error && <div className="text-red-600 text-sm font-semibold mb-2">{error}</div>}
          <button
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl mt-2 disabled:bg-gray-300 disabled:text-gray-400"
            disabled={loading || !vaultKey || !inputKeyName || confirmText !== "confirm"}
            onClick={() => onConfirm({ vaultKey, confirmText, inputKeyName })}
          >
            {loading ? "Deleting..." : "Confirm Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
