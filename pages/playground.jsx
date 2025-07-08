import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState } from "react";
import { SidebarProvider } from "../components/SidebarContext";

function PlaygroundContent() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      {/* Sidebar */}
      <SideMenu />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header username="Admin User" />

      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SidebarProvider>
      <PlaygroundContent />
    </SidebarProvider>
  );
}
