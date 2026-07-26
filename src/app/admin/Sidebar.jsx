"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  LineChart,
  ShoppingBag,
  FolderTree,
  ShoppingCart,
  Users,
  Box,
  MessageSquare,
  Ticket,
  Image as ImageIcon,
  Settings,
  Sparkles
} from "lucide-react";

export default function Sidebar({ className = "", onClose }) {
  const pathname = usePathname();

  const menuItems = [
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { name: "Reports", href: "/admin/reports", icon: FileText },
    { name: "Analytics", href: "/admin/analytics", icon: LineChart },
    { name: "Products", href: "/admin/products", icon: ShoppingBag },
    { name: "Categories", href: "/admin/category", icon: FolderTree },
    { name: "Orders", href: "/admin/orders", icon: ShoppingCart },
    { name: "Customers", href: "/admin/customers", icon: Users },
    { name: "Inventory", href: "/admin/inventory", icon: Box },
    { name: "Reviews", href: "/admin/reviews", icon: MessageSquare },
    { name: "Coupons", href: "/admin/coupons", icon: Ticket },
    { name: "Banners", href: "/admin/banners", icon: ImageIcon },
    { name: "Settings", href: "/admin/settings", icon: Settings },
    { name: "Staff", href: "/admin/staff", icon: Users },
  ];

  // Helper to check if a menu item is active
  const isActive = (href) => {
    if (href === "/admin/dashboard") {
      return pathname === "/admin" || pathname === "/admin/dashboard";
    }
    return pathname?.startsWith(href);
  };

  return (
    <aside
      className={`w-60 bg-[#E9F5FF] border-r border-[#E2E8F0] h-screen flex flex-col justify-between select-none ${className}`}
    >
      {/* Brand Header */}
      <div className="p-6 pb-1 flex items-center gap-3">
        {/* Logo Container */}
        <div className="w-10 h-10 rounded-xl bg-[#2C3B5E] flex items-center justify-center shadow-md shadow-[#2C3B5E]/10">
          <Sparkles className="w-5.5 h-5.5 text-white stroke-[1.8]" />
        </div>
        {/* Brand Text */}
        <div className="flex flex-col">
          <span className="text-lg font-bold text-[#2C3B5E] leading-tight font-actor tracking-wide">
            Lumora
          </span>
          <span className="text-[11px] font-medium text-[#7E8B9B] tracking-wider uppercase">
            Luxury Skincare
          </span>
        </div>
      </div>

      {/* Nav Menu Items */}
      <nav className="flex-1 overflow-y-auto px-4 py-3 no-scrollbar space-y-1">
        {menuItems.map((item) => {
          const active = isActive(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={onClose}
              className={`relative flex items-center gap-3.5 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-[#E1E1C94D] text-[#28386A]"
                  : "text-[#64748B] hover:bg-slate-100 hover:text-slate-900"
              }`}
            >
              {/* Left border active indicator */}
              {active && (
                <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#28386A] rounded-r-md" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 group-hover:scale-105 ${
                  active ? "text-[#2C3B5E]" : "text-[#94A3B8] group-hover:text-slate-600"
                }`}
                strokeWidth={2}
              />
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Footer Section (Optional, nice branding or user stats helper) */}
      <div className="p-4 border-t border-[#E2E8F0]/80 bg-[#EDF3F7]/50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-[#2C3B5E]/10 flex items-center justify-center font-bold text-xs text-[#2C3B5E]">
            AD
          </div>
          <div className="flex flex-col overflow-hidden">
            <span className="text-xs font-semibold text-[#2C3B5E] truncate">Admin User</span>
            <span className="text-[10px] text-[#7E8B9B] truncate">admin@lumora.com</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
