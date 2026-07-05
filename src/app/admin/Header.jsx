"use client";

import React from "react";
import { Search, Bell, Menu, User } from "lucide-react";

export default function Header({ onOpenSidebar }) {
  return (
    <header className="sticky top-0 z-40 flex py-3 w-full items-center justify-between bg-[#F5FAFFCC]  px-6">
      {/* Left section: Search or Mobile Menu Toggle */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        {/* Mobile menu toggle */}
        <button
          onClick={onOpenSidebar}
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
        >
          <Menu className="h-6.5 w-6.5" />
          <span className="sr-only">Open sidebar</span>
        </button>

        {/* Search Input */}
        <div className="relative w-full hidden sm:block">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search everything..."
            className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2 pl-9 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
          />
        </div>
      </div>

      {/* Right section: Profile & Notifications */}
      <div className="flex items-center gap-4">
        {/* Search icon for mobile screen view */}
        <button className="sm:hidden flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100">
          <Search className="h-5 w-5" />
        </button>

        {/* Notifications */}
        <button className="relative flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 transition-colors">
          <span className="absolute top-2 right-2.5 h-2 w-2 rounded-full bg-rose-500" />
          <Bell className="h-5 w-5" />
        </button>

        {/* Profile */}
        <div className="flex items-center gap-3 pl-2 border-l border-slate-200">
          <button className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2C3B5E] text-white font-semibold text-sm shadow-inner">
            A
          </button>
          <span className="text-sm font-medium text-slate-700 hidden md:block">
            Admin
          </span>
        </div>
      </div>
    </header>
  );
}
