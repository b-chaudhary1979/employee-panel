import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useRouter } from "next/router";
import useStoreUserInfoEdit from "../hooks/useStoreUserInfoEdit";
import CryptoJS from "crypto-js";

const UserInfoContext = createContext();

export function useUserInfo() {
  return useContext(UserInfoContext);
}

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

export function UserInfoProvider({ children }) {
  const router = useRouter();
  const { token, cid, aid: urlAid } = router.query;
  console.log("🔐 [CONTEXT] UserInfoProvider - token:", token ? "present" : "missing", "cid:", cid || "missing", "aid:", urlAid || "missing");
  
  // Handle both token and cid parameters
  let ci, aid;
  if (token) {
    // Decrypt token if present
    const decrypted = decryptToken(token);
    ci = decrypted.ci;
    aid = decrypted.aid;
    console.log("🔐 [CONTEXT] Using token decryption - ci:", ci, "aid:", aid);
  } else if (cid) {
    // Use cid directly if no token
    ci = cid;
    // Try to get aid from URL parameter first, then localStorage/sessionStorage
    aid = urlAid || localStorage.getItem('employeeId') || sessionStorage.getItem('employeeId') || null;
    console.log("🔐 [CONTEXT] Using direct cid - ci:", ci, "aid:", aid);
  } else {
    ci = null;
    aid = null;
    console.log("🔐 [CONTEXT] No token or cid found");
  }
  
  const {
    user,
    loading,
    error,
    fetchUser,
  } = useStoreUserInfoEdit(ci, aid);

  console.log("👤 [CONTEXT] User state - loading:", loading, "user:", user ? "present" : "missing", "error:", error);

  // Fetch user on mount and when ci or aid changes
  useEffect(() => {
    console.log("🔄 [CONTEXT] useEffect triggered - ci:", ci, "aid:", aid);
    if (ci && aid) {
      console.log("📞 [CONTEXT] Calling fetchUser");
      fetchUser();
    } else if (ci && !aid) {
      console.log("⚠️ [CONTEXT] Have ci but no aid - this might be a cid-only case");
      // For cid-only cases, we might need to handle differently
    } else {
      console.log("❌ [CONTEXT] Skipping fetchUser - missing ci or aid");
    }
  }, [ci, aid, fetchUser]);

  // Refresh user info on window focus or resize
  useEffect(() => {
    function handleRefresh() {
      if (ci && aid) fetchUser();
    }
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("resize", handleRefresh);
    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
    };
  }, [ci, fetchUser]);

  return (
    <UserInfoContext.Provider value={{ user, loading, error, fetchUser, aid }}>
      {children}
    </UserInfoContext.Provider>
  );
} 