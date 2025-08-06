import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
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
  // Memoize the ci and aid calculation to prevent unnecessary re-renders
  const { ci, aid } = useMemo(() => {
    let calculatedCi, calculatedAid;
    
    if (token) {
      // Decrypt token if present
      const decrypted = decryptToken(token);
      calculatedCi = decrypted.ci;
      calculatedAid = decrypted.aid;
    } else if (cid) {
      // Use cid directly if no token
      calculatedCi = cid;
      // Try to get aid from URL parameter first, then localStorage/sessionStorage
      calculatedAid = urlAid || localStorage.getItem('employeeId') || sessionStorage.getItem('employeeId') || null;
    } else {
      calculatedCi = null;
      calculatedAid = null;
    }
    
    return { ci: calculatedCi, aid: calculatedAid };
  }, [token, cid, urlAid]);
  
  const {
    user,
    loading,
    error,
    fetchUser,
  } = useStoreUserInfoEdit(ci, aid);

  // Memoize the fetchUser callback to prevent unnecessary re-renders
  const memoizedFetchUser = useCallback(() => {
    if (ci && aid) {
      fetchUser();
    }
  }, [ci, aid, fetchUser]);

  // Fetch user on mount and when ci or aid changes
  useEffect(() => {
    memoizedFetchUser();
  }, [memoizedFetchUser]);

  // Remove the window event listeners that were causing unnecessary re-renders
  // These were triggering fetchUser on every focus/resize, which was causing the loading state flicker

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    user,
    loading,
    error,
    fetchUser: memoizedFetchUser,
    aid
  }), [user, loading, error, memoizedFetchUser, aid]);

  return (
    <UserInfoContext.Provider value={contextValue}>
      {children}
    </UserInfoContext.Provider>
  );
} 