"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#0F172A] w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen bg-[#F5FAFFCC]">
      {/* Sidebar for desktop */}
      <div className="hidden md:block">
        <Sidebar className="sticky top-0 h-screen" />
      </div>

      {/* Sidebar drawer for mobile */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsSidebarOpen(false)}
          />
          {/* Drawer sidebar */}
          <Sidebar
            className="relative z-50 h-full w-64 shadow-2xl transition-transform duration-300 ease-out animate-in slide-in-from-left"
            onClose={() => setIsSidebarOpen(false)}
          />
        </div>
      )}

      {/* Right panel (Header & Content) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <Header onOpenSidebar={() => setIsSidebarOpen(true)} />
        <main className="flex-1 p-2 md:p-4 w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
