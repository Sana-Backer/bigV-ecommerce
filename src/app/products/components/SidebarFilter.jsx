"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, SlidersHorizontal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SidebarFilter({
  categories = ["beauty care", "kitchen essential", "powders"],
  selectedCategory = "",
  setSelectedCategory,
  // Other props maintained for compatibility with page.js
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  theme
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCategoriesOpen, setIsCategoriesOpen] = useState(true);

  const FilterContent = () => (
    <div className="w-full font-sans pr-4">
      <h2 className="text-[22px] font-semibold uppercase mb-6 text-[#767676]">Filters</h2>

      <div className="space-y-4">
        {/* Categories Section */}
        <div className="border-b border-[#e5e7eb] pb-4">
          <div
            className="flex justify-between items-center mb-1 cursor-pointer group"
            onClick={() => setIsCategoriesOpen(!isCategoriesOpen)}
          >
            <h3 className="text-[14px] font-medium uppercase tracking-wider text-[#767676] group-hover:text-[#393F59] transition-colors">Categories</h3>
            <motion.div
              animate={{ rotate: isCategoriesOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown size={16} className="text-[#767676] group-hover:text-[#393F59] transition-colors" strokeWidth={1.5} />
            </motion.div>
          </div>

          <AnimatePresence>
            {isCategoriesOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <div className="flex flex-col gap-3 pt-3">
                  {categories.map((cat, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between cursor-pointer group"
                      onClick={() => {
                        if (setSelectedCategory) {
                          setSelectedCategory(selectedCategory === cat ? "" : cat);
                        }
                      }}
                    >
                      {/* Custom Checkbox */}
                      <div
                        className={`w-[14px] h-[14px] flex-shrink-0 rounded-[3px] border flex items-center justify-center transition-colors duration-200 ${selectedCategory === cat
                            ? 'bg-[#393F59] border-[#393F59]'
                            : 'bg-transparent border-[#767676]/40'
                          }`}
                      >
                        {selectedCategory === cat && (
                          <svg width="8" height="6" viewBox="0 0 10 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] font-medium uppercase tracking-wide text-[#393F59] text-right">
                        {cat}
                      </span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Type Section 1 */}
        <div className="border-b border-[#e5e7eb] py-3">
          <div className="flex justify-between items-center cursor-pointer group">
            <h3 className="text-[14px] font-medium uppercase tracking-wider text-[#767676] group-hover:text-[#393F59] transition-colors">Type</h3>
            <ChevronRight size={16} className="text-[#767676] group-hover:text-[#393F59] transition-colors" strokeWidth={1.5} />
          </div>
        </div>

        {/* Type Section 2 */}
        <div className="border-b border-[#e5e7eb] py-3">
          <div className="flex justify-between items-center cursor-pointer group">
            <h3 className="text-[14px] font-medium uppercase tracking-wider text-[#767676] group-hover:text-[#393F59] transition-colors">Type</h3>
            <ChevronRight size={16} className="text-[#767676] group-hover:text-[#393F59] transition-colors" strokeWidth={1.5} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* 1. MOBILE FILTER INLINE TRIGGER */}
      <div className="block md:hidden w-full mb-8">
        <button
          onClick={() => setIsOpen(true)}
          className="w-full text-left py-4 border-b border-gray-200 text-[#393F59] text-[15px] font-medium tracking-wide uppercase cursor-pointer transition-colors active:text-black"
        >
          FILTERS &gt;
        </button>
      </div>

      {/* 2. MOBILE DRAWER OVERLAY & BOTTOM SHEET */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop opacity overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-50 md:hidden bg-black/40"
            />

            {/* Bottom sheet drawer panel */}
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed bottom-0 left-0 right-0 z-50 max-h-[85vh] rounded-t-3xl border-t p-6 overflow-y-auto md:hidden bg-white border-[#e5e7eb]"
            >
              {/* Drawer Header handle & Close button */}
              <div className="flex items-center justify-between mb-6 pb-2 border-b border-[#f3f4f6]">
                <div className="flex items-center gap-2 text-[#374151]">
                  <SlidersHorizontal size={16} />
                  <span className="text-base font-semibold tracking-wide">Refine Results</span>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-full flex items-center justify-center bg-[#f3f4f6] hover:bg-[#e5e7eb] text-[#6b7280] cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              {/* Drawer Filter content */}
              <div className="pb-10">
                <FilterContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. DESKTOP PERMANENT SIDE PANEL */}
      <div className="hidden md:block w-[250px] shrink-0 h-fit transition-all duration-300 bg-transparent">
        <FilterContent />
      </div>
    </>
  );
}
