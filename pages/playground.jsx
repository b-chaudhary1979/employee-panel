import SideMenu from "../components/sidemenu";
import Header from "../components/header";
import { useState } from "react";

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="bg-[#fbf9f4] min-h-screen flex">
      {/* Sidebar */}
      <SideMenu />

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header */}
        <Header username="Admin User" />

        {/* Main content */}
        <main className="flex-1 p-6">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900 mb-6">
              Playground
            </h1>
            <div className="bg-white rounded-lg shadow-sm p-6">
              <p className="text-gray-600">
                This is the playground page where you can test components and
                features.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <SideMenuProvider>
      <PlaygroundContent />
    </SideMenuProvider>
  );
}
