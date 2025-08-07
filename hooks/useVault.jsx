import { useState, useEffect } from "react";

/**
 * Custom hook to manage vault security logic (unlocking, lockout, attempts, etc.)
 * @param {string} correctVaultKey - The correct vault key (e.g., company id)
 * @returns {object} Vault state and handlers
 */
export default function useVault(correctVaultKey) {
  const [isVaultUnlocked, setIsVaultUnlocked] = useState(false);
  const [vaultKey, setVaultKey] = useState("");
  const [showVaultKey, setShowVaultKey] = useState(false);
  const [vaultAttempts, setVaultAttempts] = useState(0);
  const [isVaultLoading, setIsVaultLoading] = useState(false);
  const [isVaultLocked, setIsVaultLocked] = useState(false);
  const [lockoutUntil, setLockoutUntil] = useState(null);

  // Check if vault is locked on mount
  useEffect(() => {
    const storedLockout = localStorage.getItem("vaultLockoutUntil");
    if (storedLockout) {
      const lockoutTime = new Date(storedLockout);
      const now = new Date();
      if (lockoutTime > now) {
        setIsVaultLocked(true);
        setLockoutUntil(lockoutTime);
      } else {
        localStorage.removeItem("vaultLockoutUntil");
        localStorage.removeItem("vaultFailedAttempts");
      }
    }
    const storedAttempts = localStorage.getItem("vaultFailedAttempts");
    if (storedAttempts) {
      const attempts = JSON.parse(storedAttempts);
      const now = new Date();
      const timeDiff = now - new Date(attempts.lastAttempt);
      if (timeDiff > 24 * 60 * 60 * 1000) {
        localStorage.removeItem("vaultFailedAttempts");
        setVaultAttempts(0);
      } else {
        setVaultAttempts(attempts.count);
      }
    }
  }, []);

  /**
   * Handles vault unlock form submission
   * @param {Event} e
   */
  const handleVaultSubmit = async (e) => {
    e.preventDefault();
    setIsVaultLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (vaultKey.trim().toLowerCase() === String(correctVaultKey).trim().toLowerCase()) {
      setIsVaultUnlocked(true);
      localStorage.removeItem("vaultFailedAttempts");
      setVaultAttempts(0);
    } else {
      const newAttempts = vaultAttempts + 1;
      setVaultAttempts(newAttempts);
      setVaultKey("");
      const failedAttempts = {
        count: newAttempts,
        lastAttempt: new Date().toISOString(),
      };
      localStorage.setItem("vaultFailedAttempts", JSON.stringify(failedAttempts));
      if (newAttempts >= 3) {
        const lockoutTime = new Date();
        lockoutTime.setHours(lockoutTime.getHours() + 24);
        setLockoutUntil(lockoutTime);
        setIsVaultLocked(true);
        localStorage.setItem("vaultLockoutUntil", lockoutTime.toISOString());
      }
    }
    setIsVaultLoading(false);
  };

  /**
   * Resets the vault lockout (for development)
   */
  const resetVaultLockout = () => {
    localStorage.removeItem("vaultLockoutUntil");
    localStorage.removeItem("vaultFailedAttempts");
    setIsVaultLocked(false);
    setLockoutUntil(null);
    setVaultAttempts(0);
  };

  return {
    isVaultUnlocked,
    setIsVaultUnlocked,
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
  };
}