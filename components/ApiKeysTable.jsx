import { Key } from "lucide-react";

export default function ApiKeysTable({
  apiKeys = [],
  showDecryptModal,
  showEncryptModal,
  showAddKeyModal,
  showKeyDetailVaultModal,
  setShowAddKeyChoiceModal,
  setShowAddKeyModal,
  setShowImportModal,
  setSelectedKey,
  setShowKeyDetailVaultModal,
  setKeyDetailVaultKey,
  setShowKeyDetailVaultKey,
  handleDecrypt,
  handleEncrypt,
  fetchingKeys = false,
  showDecryptModalState = false,
  showEncryptModalState = false,
  showKeyDetailVaultModalState = false,
}) {
  // Table for desktop/tablet
  return (
    <>
      {/* API Keys Table (Desktop/Tablet) */}
      {!fetchingKeys && apiKeys.length === 0 ? (
        <div className="hidden sm:block bg-white rounded-2xl shadow border border-gray-100 p-8">
          <div className="text-center">
            <Key className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              No API Keys Found
            </h3>
            <p className="text-gray-500 mb-4">
              You haven't added any API keys yet. Start by adding your first key.
            </p>
            <button
              onClick={() => setShowAddKeyChoiceModal(true)}
              className="bg-[#16a34a] hover:bg-[#28BD78] text-white font-semibold rounded-lg px-4 py-2 transition-colors duration-200"
            >
              Add Your First Key
            </button>
          </div>
        </div>
      ) : (
        <div className="hidden sm:block bg-white rounded-2xl shadow border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead>
                <tr className="bg-[#f3e8ff] text-gray-900">
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base">
                    Serial No
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base">
                    Key Name
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base hidden sm:table-cell">
                    Store Date
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base hidden md:table-cell">
                    Stored By
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base">
                    Key
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base">
                    Status
                  </th>
                  <th className="py-3 px-3 sm:py-4 sm:px-6 text-left font-semibold text-xs sm:text-base">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {apiKeys.map((key) => (
                  <tr
                    key={key.id}
                    className="border-t border-gray-100 text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                    onClick={() => {
                      if (
                        showDecryptModalState ||
                        showEncryptModalState ||
                        showAddKeyModal ||
                        showKeyDetailVaultModalState
                      ) {
                        return;
                      }
                      setSelectedKey(key);
                      setShowKeyDetailVaultModal(true);
                      setKeyDetailVaultKey("");
                      setShowKeyDetailVaultKey(false);
                    }}
                  >
                    <td className="py-6 px-3 sm:py-8 sm:px-6 font-bold text-sm sm:text-lg">
                      {key.serialNo}
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6 text-gray-700 font-semibold text-xs sm:text-base">
                      {key.keyName}
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6 text-gray-700 text-xs sm:text-base hidden sm:table-cell">
                      {key.storeDate}
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6 text-gray-700 text-xs sm:text-base hidden md:table-cell">
                      {key.storedBy}
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6">
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-2">
                        <span className="font-mono text-xs sm:text-sm bg-gray-100 px-1 sm:px-2 py-1 rounded break-all">
                          {key.isEncrypted
                            ? key.encryptedKey && key.encryptedKey.length > 2
                              ? key.encryptedKey.substring(0, 2) + "..."
                              : key.encryptedKey || "••••••••••••••••"
                            : key.key.length > 2
                            ? key.key.substring(0, 2) + "..."
                            : key.key}
                        </span>
                        <span
                          className={`px-1 sm:px-2 py-1 rounded-full text-xs font-semibold ${
                            key.isEncrypted
                              ? "bg-red-100 text-red-600"
                              : "bg-green-100 text-green-600"
                          }`}
                        >
                          {key.isEncrypted ? "Encrypted" : "Decrypted"}
                        </span>
                      </div>
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          key.status === "Active"
                            ? "bg-green-100 text-green-600"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {key.status || "Active"}
                      </span>
                    </td>
                    <td className="py-6 px-3 sm:py-8 sm:px-6">
                      {key.isEncrypted ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDecrypt(key.id);
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-2 py-1 sm:px-3 text-xs sm:text-sm transition-colors duration-200"
                        >
                          Decrypt
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEncrypt(key.id);
                          }}
                          className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-2 py-1 sm:px-3 text-xs sm:text-sm transition-colors duration-200"
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
      )}
      {/* Card-based API Keys List (Mobile) */}
      {!fetchingKeys && apiKeys.length === 0 ? (
        <div className="sm:hidden mt-8">
          <div className="bg-white rounded-xl shadow border border-gray-100 p-6 text-center">
            <Key className="w-8 h-8 text-gray-400 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-gray-600 mb-2">
              No API Keys Found
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              You haven't added any API keys yet.
            </p>
            <button
              onClick={() => setShowAddKeyChoiceModal(true)}
              className="bg-[#16a34a] hover:bg-[#28] text-white font-semibold rounded-lg px-3 py-2 text-sm transition-colors duration-200"
            >
              Add Your First Key
            </button>
          </div>
        </div>
      ) : (
        <div className="sm:hidden mt-8">
          {apiKeys.length === 0 ? (
            <div className="text-center text-gray-500 text-lg">
              No API keys found.
            </div>
          ) : (
            apiKeys.map((key) => (
              <div
                key={key.id}
                className="bg-white rounded-xl shadow border border-gray-100 p-4 mb-4 flex flex-col cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => {
                  if (
                    showDecryptModalState ||
                    showEncryptModalState ||
                    showAddKeyModal ||
                    showKeyDetailVaultModalState
                  ) {
                    return;
                  }
                  setSelectedKey(key);
                  setShowKeyDetailVaultModal(true);
                  setKeyDetailVaultKey("");
                  setShowKeyDetailVaultKey(false);
                }}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-base text-gray-900">
                    #{key.serialNo} {key.keyName}
                  </span>
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      key.status === "Active"
                        ? "bg-green-100 text-green-600"
                        : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {key.status || "Active"}
                  </span>
                </div>
                <div className="text-gray-500 text-sm mb-2">
                  <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded break-all">
                    {key.isEncrypted
                      ? key.encryptedKey && key.encryptedKey.length > 2
                        ? key.encryptedKey.substring(0, 2) + "..."
                        : key.encryptedKey || "••••••••••••••••"
                      : key.key.length > 2
                      ? key.key.substring(0, 2) + "..."
                      : key.key}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      key.isEncrypted
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {key.isEncrypted ? "Encrypted" : "Decrypted"}
                  </span>
                  {key.isEncrypted ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDecrypt(key.id);
                      }}
                      className="bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg px-3 py-1 text-xs transition-colors duration-200"
                    >
                      Decrypt
                    </button>
                  ) : (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEncrypt(key.id);
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg px-3 py-1 text-xs transition-colors duration-200"
                    >
                      Encrypt
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </>
  );
} 