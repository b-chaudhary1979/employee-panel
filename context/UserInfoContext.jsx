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
  const { token } = router.query;
  const { ci } = decryptToken(token);
  const {
    user,
    loading,
    error,
    fetchUser,
  } = useStoreUserInfoEdit(ci);

  // Fetch user on mount and when ci changes
  useEffect(() => {
    if (ci) fetchUser();
  }, [ci, fetchUser]);

  // Refresh user info on window focus or resize
  useEffect(() => {
    function handleRefresh() {
      if (ci) fetchUser();
    }
    window.addEventListener("focus", handleRefresh);
    window.addEventListener("resize", handleRefresh);
    return () => {
      window.removeEventListener("focus", handleRefresh);
      window.removeEventListener("resize", handleRefresh);
    };
  }, [ci, fetchUser]);

  return (
    <UserInfoContext.Provider value={{ user, loading, error, fetchUser }}>
      {children}
    </UserInfoContext.Provider>
  );
} 