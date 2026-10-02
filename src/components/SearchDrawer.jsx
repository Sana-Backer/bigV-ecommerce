"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, Search, Loader2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { searchProductsApi } from "@/services/productsApi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SearchDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);

  // Focus input when opened
  const inputRef = useRef(null);
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
      setQuery("");
      setResults([]);
    }
  }, [isOpen]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const response = await searchProductsApi(value);
        if (response && response.status === 200) {
          const rawProducts = response.data?.data || response.data || [];
          // Limit to 5 quick results
          setResults(rawProducts.slice(0, 5));
        } else {
          setResults([]);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce
  };

  const handleViewAll = () => {
    if (query.trim()) {
      onClose();
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && query.trim()) {
      handleViewAll();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
            onClick={onClose}
          />

          {/* Drawer - slide from right */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FCFAF7] shadow-2xl z-[100] flex flex-col font-sans border-l border-[#E6E4DD]"
          >
            {/* Header & Input */}
            <div className="p-6 border-b border-[#E6E4DD] bg-white space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-normal text-[#2C332E] font-serif">
                  Search
                </h2>
                <button
                  onClick={onClose}
                  className="p-2 text-[#5A635B] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  {loading ? (
                    <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                  ) : (
                    <Search className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={handleSearchChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Search for products, categories..."
                  className="block w-full pl-10 pr-4 py-3 bg-[#F5F4F0] border-none rounded-xl text-sm font-medium text-[#2C332E] focus:ring-2 focus:ring-[#2C332E] focus:outline-none transition-all placeholder:text-gray-400 placeholder:font-normal"
                />
              </div>
            </div>

            {/* Results Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-white relative">
              {!query.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <Search className="w-12 h-12 mb-4 text-[#7B827C]" />
                  <p className="text-sm font-medium text-[#5A635B]">
                    Type something to start searching
                  </p>
                </div>
              ) : results.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Quick Results</h3>
                  {results.map((product) => (
                    <Link
                      key={product.id}
                      href={`/products/${product.slug || product.id}`}
                      onClick={onClose}
                      className="flex gap-4 p-3 rounded-xl hover:bg-[#F5F4F0] transition-colors group cursor-pointer border border-transparent hover:border-[#E6E4DD]"
                    >
                      <div className="w-16 h-16 shrink-0 bg-[#FCFAF7] rounded-lg overflow-hidden border border-[#E6E4DD]/50">
                        {product.primary_image ? (
                          <img
                            src={product.primary_image}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Img</div>
                        )}
                      </div>
                      <div className="flex flex-col justify-center flex-1">
                        <h4 className="text-sm font-bold text-[#2C332E] line-clamp-2 group-hover:text-black transition-colors">
                          {product.name}
                        </h4>
                        <p className="text-sm font-bold text-[#5A635B] mt-1">
                          ₹{product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : !loading && query.trim() ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <p className="text-sm font-medium text-[#5A635B]">
                    No results found for <span className="font-bold">"{query}"</span>
                  </p>
                  <p className="text-xs text-gray-400 mt-2">Try checking your spelling or using fewer words.</p>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            {query.trim() && (
              <div className="p-6 border-t border-[#E6E4DD] bg-white">
                <button
                  onClick={handleViewAll}
                  className="w-full py-4 text-xs font-bold text-white bg-[#2C332E] rounded-xl hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] uppercase tracking-widest shadow-md"
                >
                  View All Results
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
