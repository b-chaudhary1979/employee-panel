import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { SidebarProvider } from "../context/SidebarContext";
import CryptoJS from "crypto-js";
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
import { useRouter } from "next/router";
import { useEffect } from "react";

function SecurityContent() {
  const router = useRouter();
  const { token } = router.query;
  const { ci, aid } = decryptToken(token);
  useEffect(() => {
    if (router.isReady && (!ci || !aid)) {
      router.replace("/auth/login");
    }
  }, [router.isReady, ci, aid]);
  if (!ci || !aid) return null;
  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      <SideMenu />
      <div className="flex-1 flex flex-col min-h-screen">
        <Header username="Admin User" />
        <main className="flex-1 p-8 transition-all duration-300">
          <h1 className="text-2xl font-bold">Passwords & Security</h1>
        </main>
      </div>
    </div>
  );
}

export default function Security() {
  return (
    <SidebarProvider>
      <SecurityContent />
    </SidebarProvider>
  );
}
