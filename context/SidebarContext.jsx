"use client";

import { createContext, useContext, useState, useEffect } from "react";

const SidebarContext = createContext();

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

export const SidebarProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Handle responsive behavior (only after hydration)
  useEffect(() => {
    if (!isHydrated) return;

    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);

      // On mobile, always keep sidebar closed for desktop state
      // This ensures proper layout when switching from desktop to mobile
      if (mobile && isOpen) {
        setIsOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, isHydrated]);

  const toggleSidebar = () => {
    // Only allow toggle on desktop
    if (!isMobile) {
      setIsOpen(!isOpen);
    }
  };

  return (
    <SidebarContext.Provider
      value={{ isOpen, toggleSidebar, isMobile, isHydrated }}
    >
      {children}
    </SidebarContext.Provider>
  );
};
