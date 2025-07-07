import "@/styles/globals.css";
import Loader from "../loader/Loader";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { SidebarProvider } from "../components/SidebarContext";

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
    <SidebarProvider>
      {loading ? <Loader /> : <Component {...pageProps} />}
    </SidebarProvider>
  );
}
