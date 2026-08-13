"use client";

import { useState, useEffect } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { usePathname, useRouter } from "next/navigation";

export default function AdminLayout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  const isLoginPage = pathname === "/admin/login";

  useEffect(() => {
    if (!isLoginPage) {
      const token = localStorage.getItem("adminToken");
      if (!token) {
        router.push("/admin/login");
      } else {
        setIsLoading(false);
      }
    } else {
      setIsLoading(false);
    }
  }, [isLoginPage, pathname, router]);

  if (isLoginPage) {
    return <div className="min-h-screen bg-[#0F172A] w-full">{children}</div>;
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center bg-[#F5FAFFCC]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#2C3B5E] border-t-transparent"></div>
      </div>
    );
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
