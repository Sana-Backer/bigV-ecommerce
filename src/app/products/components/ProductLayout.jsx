"use client";

import React from "react";

/**
 * ProductLayout Component
 * A responsive container that wraps the SidebarFilter (left) and the ProductGrid (right).
 * Handles the responsive layout shifting:
 * - Mobile: Flex column where the filters transform into a top trigger button.
 * - Desktop: Side-by-side flex layout with a fixed-width filter panel and fluid-growing catalog.
 */
export default function ProductLayout({
  children,
  sidebar,
  theme = "dark"
}) {
  return (
    <div className="relative z-10 w-full min-h-screen py-6 bg-[#f1f0ee]">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Dynamic Mobile/Desktop Layout Grid */}
        <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-start relative">
          
          {/* Left Sidebar Filter Section (Sticky on scroll) */}
          {sidebar && (
            <aside className="w-full md:w-[250px] md:sticky md:top-24 shrink-0 self-start md:max-h-[calc(100vh-7rem)] md:overflow-y-auto no-scrollbar">
              {sidebar}
            </aside>
          )}

          {/* Right Product Grid Section */}
          <div className="flex-1 min-w-0">
            {children}
          </div>
          
        </div>
      </div>
    </div>
  );
}
