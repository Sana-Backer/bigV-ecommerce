"use client";

import React, { useEffect, useState } from "react";
import { X, Loader2, Trash2, Heart } from "lucide-react";
import { getWishlistApi, removeWishlistItemApi, moveWishlistItemToCartApi, clearWishlistApi } from "@/services/wishlistApi";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function WishlistDrawer({ isOpen, onClose }) {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);

  const fetchWishlist = async () => {
    try {
      setLoading(true);
      const res = await getWishlistApi();
      if (res.status === 200) {
        setWishlistItems(res.data?.data?.items || []);
      }
    } catch (err) {
      console.error("Error fetching wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleClearWishlist = async () => {
    try {
      setLoading(true);
      const res = await clearWishlistApi();
      if (res.status === 200 || res.status === 204) {
        fetchWishlist();
      }
    } catch (err) {
      console.error("Error clearing wishlist:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchWishlist();
    }
  }, [isOpen]);

  const removeItem = async (itemId) => {
    try {
      setUpdatingItemId(itemId);
      const res = await removeWishlistItemApi(itemId);
      if (res.status === 204 || res.status === 200) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (err) {
      console.error("Failed to remove item:", err);
      alert("Could not remove item from wishlist.");
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleAddToCart = async (itemId, inStock) => {
    if (!inStock) return;
    try {
      setUpdatingItemId(itemId);
      const res = await moveWishlistItemToCartApi(itemId, { quantity: 1 });
      if (res.status === 200 || res.status === 201) {
        setWishlistItems(prev => prev.filter(item => item.id !== itemId));
        window.dispatchEvent(new Event("cartUpdated"));
        onClose();
        setTimeout(() => {
          window.dispatchEvent(new Event("openCart"));
        }, 300);
      }
    } catch (err) {
      console.error("Failed to move to cart:", err);
      alert("Failed to add item to cart.");
    } finally {
      setUpdatingItemId(null);
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
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={onClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-[450px] bg-[#F8F9FA] shadow-2xl z-[110] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E6E4DD] bg-white">
              <div className="flex items-center gap-3">
                <Heart size={20} className="text-[#2C332E]" />
                <h2 className="text-xl font-normal text-[#2C332E] font-serif">
                  My Wishlist
                </h2>
                {wishlistItems.length > 0 && (
                  <button
                    onClick={handleClearWishlist}
                    className="ml-4 text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-black transition-colors p-1"
              >
                <X size={20} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto bg-[#F8F9FA]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-[#2F3549]" />
                </div>
              ) : wishlistItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#2F3549] space-y-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[28px] font-medium leading-none mb-1 translate-x-3">
                      No
                    </span>
                    <span 
                      className="text-[48px] leading-none"
                      style={{ fontFamily: "var(--font-yellowtail)", letterSpacing: "1px" }}
                    >
                      Wishlist Items
                    </span>
                  </div>
                  <button 
                    onClick={onClose}
                    className="px-6 py-3 bg-[#9A353B] text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-[#852C31] transition-colors shadow-sm"
                  >
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="space-y-4 px-10 py-6">
                  {wishlistItems.map((item) => {
                    const product = item.product;
                    const price = product?.sale_price || product?.base_price;
                    const inStock = product?.in_stock;

                    return (
                      <div key={item.id} className={`flex gap-4 p-4 bg-white rounded-xl border border-[#E6E4DD] shadow-sm relative ${updatingItemId === item.id ? 'opacity-50' : ''}`}>
                        <div className="w-20 h-20 shrink-0 bg-[#E4D7CA] rounded-lg overflow-hidden border border-[#E6E4DD]/50 p-1.5 flex items-center justify-center">
                           {product?.primary_image ? (
                              <img src={product.primary_image} alt={product?.name} className="w-full h-full object-cover rounded-md shadow-sm" />
                           ) : (
                              <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                           )}
                        </div>
                        <div className="flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-2">
                              <h3 className="text-sm font-bold text-[#2C332E] line-clamp-2">{product?.name}</h3>
                              <button 
                                onClick={() => removeItem(item.id)}
                                disabled={updatingItemId === item.id}
                                className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                              >
                                <Trash2 size={16} strokeWidth={2} />
                              </button>
                            </div>
                          </div>
                          <div className="flex items-end justify-between mt-2">
                            <div className="flex flex-col gap-0.5">
                              <span className="text-[13px] font-bold text-[#2C332E]">
                                ₹{price}
                              </span>
                              <span className={`text-[11px] font-semibold tracking-wide uppercase ${inStock ? 'text-[#5C6080]' : 'text-[#A43B3B]'}`}>
                                {inStock ? "In stock" : "Out of stock"}
                              </span>
                            </div>
                            <button
                              onClick={() => handleAddToCart(item.id, inStock)}
                              disabled={!inStock || updatingItemId === item.id}
                              className={`px-4 py-2 rounded-md text-[11px] font-bold tracking-wide transition-all ${
                                inStock 
                                ? "bg-[#393F59] text-white hover:bg-[#2d3150] shadow-sm" 
                                : "bg-gray-200 text-gray-400 cursor-not-allowed"
                              }`}
                            >
                              Add to cart
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
