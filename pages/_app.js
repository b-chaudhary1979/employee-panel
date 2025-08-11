import "@/styles/globals.css";
import Loader from "../loader/Loader";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SidebarProvider } from "../context/SidebarContext";
import { UserInfoProvider } from "../context/UserInfoContext";
import { AuthProvider } from "../context/AuthContext";
import ProtectedRoute from "../components/ProtectedRoute";

export default function App({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const handleStart = (url) => {
      if (url !== router.asPath) setLoading(true);
    };
    const handleComplete = () => setLoading(false);
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", handleComplete);
    router.events.on("routeChangeError", handleComplete);
    return () => {
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", handleComplete);
      router.events.off("routeChangeError", handleComplete);
    };
  }, [router]);

  return (
    <AuthProvider>
      <SidebarProvider>
        <UserInfoProvider>
          <ProtectedRoute>
            {loading ? <Loader /> : <Component {...pageProps} />}
          </ProtectedRoute>
        </UserInfoProvider>
      </SidebarProvider>
    </AuthProvider>
  );
}
