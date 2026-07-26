"use client";

import React, { useState, useEffect } from "react";
import { X, Trash2, ShoppingBag, Loader2, Minus, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getCartApi, updateCartItemApi, removeCartItemApi, getCartSummaryApi, clearCartApi } from "@/services/cartApi";
import { applyCouponApi, removeCouponApi } from "@/services/couponApi";
import { checkoutValidateApi } from "@/services/checkoutApi";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CartDrawer({ isOpen, onClose }) {
  const router = useRouter();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState(null);
  const [summary, setSummary] = useState(null);

  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  
  const [validating, setValidating] = useState(false);
  const [validationErrors, setValidationErrors] = useState([]);

  const handleApplyCoupon = async () => {
    if (!couponCodeInput.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const response = await applyCouponApi({ code: couponCodeInput });
      if (response && response.status === 200) {
        await fetchCart();
        setCouponCodeInput("");
      } else {
        setCouponError(response.data?.message || "Failed to apply coupon");
      }
    } catch (error) {
      setCouponError(error.response?.data?.message || "Invalid coupon code");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponLoading(true);
    try {
      const response = await removeCouponApi();
      if (response && response.status === 200) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove coupon", error);
    } finally {
      setCouponLoading(false);
    }
  };

  const fetchCart = async () => {
    setLoading(true);
    try {
      const response = await getCartApi();
      if (response && response.status === 200) {
        setCart(response.data.data || response.data);
      } else {
        setCart(null);
      }

      const summaryResponse = await getCartSummaryApi();
      if (summaryResponse && summaryResponse.status === 200) {
        setSummary(summaryResponse.data.data || summaryResponse.data);
      } else {
        setSummary(null);
      }
    } catch (err) {
      console.error("Failed to fetch cart:", err);
      setCart(null);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCart();
    }
  }, [isOpen]);

  // Listen to custom event to refetch cart when added from outside
  useEffect(() => {
    const handleCartUpdate = () => {
      if (isOpen) fetchCart();
    };
    window.addEventListener("cartUpdated", handleCartUpdate);
    return () => window.removeEventListener("cartUpdated", handleCartUpdate);
  }, [isOpen]);

  const updateQuantity = async (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setUpdatingItemId(itemId);
    try {
      const response = await updateCartItemApi(itemId, newQuantity);
      if (response && response.status === 200) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to update cart item:", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const removeItem = async (itemId) => {
    setUpdatingItemId(itemId);
    try {
      const response = await removeCartItemApi(itemId);
      if (response && (response.status === 200 || response.status === 204)) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error);
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleClearCart = async () => {
    setLoading(true);
    try {
      const response = await clearCartApi();
      if (response && (response.status === 200 || response.status === 204)) {
        await fetchCart();
      }
    } catch (error) {
      console.error("Failed to clear cart:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToCheckout = async () => {
    setValidating(true);
    setValidationErrors([]);
    try {
      const response = await checkoutValidateApi();
      if (response && response.status === 200) {
        if (response.data?.is_valid || response.data?.data?.is_valid) {
          // Success! Redirect to checkout
          onClose();
          router.push("/checkout");
        } else {
          // Validation failed due to stock/price changes
          const items = response.data?.data?.items || response.data?.items || [];
          const problems = [];
          items.forEach(item => {
            if (item.problems && item.problems.length > 0) {
              problems.push(`${item.name}: ${item.problems.join(", ")}`);
            }
          });
          setValidationErrors(problems);
        }
      }
    } catch (error) {
      console.error("Checkout validation failed", error);
      setValidationErrors(["Failed to validate cart. Please try again."]);
    } finally {
      setValidating(false);
    }
  };

  const cartItems = cart?.items || [];

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

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#FCFAF7] shadow-2xl z-[100] flex flex-col font-sans border-l border-[#E6E4DD]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#E6E4DD] bg-white">
              <div className="flex items-center gap-3">
                <ShoppingBag size={20} className="text-[#2C332E]" />
                <h2 className="text-xl font-normal text-[#2C332E] font-serif">
                  My Cart
                </h2>
                {cartItems.length > 0 && (
                  <button
                    onClick={handleClearCart}
                    className="ml-4 text-xs font-bold text-rose-500 hover:text-rose-600 uppercase tracking-wider px-2 py-1 bg-rose-50 rounded-md hover:bg-rose-100 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
              <button
                onClick={onClose}
                className="p-2 text-[#5A635B] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 relative">
              {loading && !cart ? (
                <div className="absolute inset-0 flex items-center justify-center bg-[#FCFAF7]/50 z-10">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2C332E]" />
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-[#2F3549] space-y-8">
                  <div className="flex flex-col items-center">
                    <span className="text-[28px] font-medium leading-none mb-1 translate-x-3">
                      No
                    </span>
                    <span 
                      className="text-[48px] leading-none"
                      style={{ fontFamily: "var(--font-yellowtail)", letterSpacing: "1px" }}
                    >
                      Cart Items
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
                <div className="space-y-6">
                  {cartItems.map((item) => (
                    <div key={item.id} className={`flex gap-4 p-4 bg-white rounded-xl border border-[#E6E4DD] shadow-sm relative ${updatingItemId === item.id ? 'opacity-50' : ''}`}>
                      <div className="w-20 h-20 shrink-0 bg-[#F5F4F0] rounded-lg overflow-hidden border border-[#E6E4DD]/50">
                         {item.variant?.primary_image || item.product?.primary_image ? (
                            <img src={item.variant?.primary_image || item.product?.primary_image} alt={item.product?.name} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">No Image</div>
                         )}
                      </div>
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h3 className="text-sm font-bold text-[#2C332E] line-clamp-2">{item.product?.name}</h3>
                            <button 
                              onClick={() => removeItem(item.id)}
                              disabled={updatingItemId === item.id}
                              className="text-gray-400 hover:text-rose-500 transition-colors p-1"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                          {item.variant && (
                            <p className="text-xs text-[#7B827C] mt-1">{item.variant.name || item.variant.attributes?.size}</p>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center border border-[#E6E4DD] rounded-md overflow-hidden bg-white">
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItemId === item.id || item.quantity <= 1}
                              className="w-7 h-7 flex items-center justify-center text-[#5A635B] hover:bg-[#F5F4F0] disabled:opacity-50"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="w-8 text-center text-xs font-bold text-[#2C332E]">{item.quantity}</span>
                            <button 
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItemId === item.id}
                              className="w-7 h-7 flex items-center justify-center text-[#5A635B] hover:bg-[#F5F4F0] disabled:opacity-50"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-[#2C332E]">
                            ₹{item.line_total || (parseFloat(item.current_price) * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer / Checkout */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-[#E6E4DD] bg-white space-y-4 shadow-[0_-10px_30px_rgba(0,0,0,0.03)] relative z-10">
                {/* Coupon Section */}
                <div className="space-y-2 pb-2">
                  {cart?.coupon_code ? (
                    <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                      <div className="flex items-center gap-2">
                        <span className="text-emerald-700 font-bold text-xs uppercase tracking-wider">{cart.coupon_code}</span>
                        <span className="text-emerald-600 text-[10px]">Applied!</span>
                      </div>
                      <button 
                        onClick={handleRemoveCoupon}
                        disabled={couponLoading}
                        className="text-emerald-600 hover:text-emerald-800 disabled:opacity-50"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={couponCodeInput}
                        onChange={(e) => setCouponCodeInput(e.target.value.toUpperCase())}
                        placeholder="Coupon code"
                        className="flex-1 px-3 py-2 text-sm border border-[#E6E4DD] rounded-lg focus:outline-none focus:border-[#2C332E] uppercase placeholder:normal-case"
                      />
                      <button 
                        onClick={handleApplyCoupon}
                        disabled={couponLoading || !couponCodeInput.trim()}
                        className="px-4 py-2 bg-[#F5F4F0] text-[#2C332E] text-xs font-bold rounded-lg hover:bg-[#E6E4DD] disabled:opacity-50 transition-colors"
                      >
                        {couponLoading ? <Loader2 size={14} className="animate-spin" /> : "Apply"}
                      </button>
                    </div>
                  )}
                  {couponError && <p className="text-rose-500 text-[10px]">{couponError}</p>}
                </div>

                <div className="flex items-center justify-between text-[#5A635B] font-medium text-sm">
                  <span>Subtotal</span>
                  <span className="text-[#2C332E] font-bold text-base">₹{summary?.subtotal || "0.00"}</span>
                </div>
                {summary && parseFloat(summary.discount) > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 font-medium text-sm">
                    <span>Discount</span>
                    <span className="font-bold text-base">-₹{summary.discount}</span>
                  </div>
                )}
                <div className="flex items-center justify-between text-[#2C332E] font-bold text-lg border-t border-[#E6E4DD] pt-3 mt-3">
                  <span>Total</span>
                  <span>₹{summary?.grand_total || "0.00"}</span>
                </div>
                <p className="text-[10px] text-[#7B827C] text-center mb-2 mt-4">Shipping & taxes calculated at checkout</p>
                
                {/* Validation Errors */}
                {validationErrors.length > 0 && (
                  <div className="bg-rose-50 border border-rose-100 p-3 rounded-lg mt-3">
                    <p className="text-xs font-bold text-rose-700 mb-1">Please fix the following issues:</p>
                    <ul className="list-disc list-inside text-[11px] text-rose-600 space-y-1">
                      {validationErrors.map((err, idx) => (
                        <li key={idx}>{err}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  onClick={handleProceedToCheckout}
                  disabled={validating}
                  className="w-full py-4 text-xs font-bold text-white bg-[#2C332E] rounded-xl hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] uppercase tracking-widest shadow-md disabled:opacity-70"
                >
                  {validating ? <Loader2 size={16} className="animate-spin" /> : "Proceed to Checkout"}
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
