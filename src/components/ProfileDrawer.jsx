"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  User,
  Mail,
  Phone,
  Loader2,
  X,
  CheckCircle,
  AlertCircle,
  LogOut,
  Package,
  Heart,
  ShieldCheck,
  ChevronRight,
  LogIn,
  UserPlus
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMeApi, updateMeApi, logoutApi } from "@/services/auth";
import LogoutConfirmModal from "./LogoutConfirmModal";
import { validatePhoneNumber, sanitizePhoneInput } from "@/lib/phoneValidation";

export default function ProfileDrawer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: "..." }

  useEffect(() => {
    if (!isOpen) return; // Only fetch when opened

    const fetchProfile = async () => {
      setMessage(null);
      const token = typeof window !== "undefined" ? localStorage.getItem("customerToken") : null;
      
      if (!token || token === "null" || token === "undefined") {
        setIsAuthenticated(false);
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);

      try {
        const response = await getMeApi();
        if (response && response.status === 200) {
          const userData = response.data?.data || response.data;
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
          localStorage.setItem("customerUser", JSON.stringify(userData));
          setIsAuthenticated(true);
        } else {
          const status = response?.status || response?.response?.status;
          if (status === 401) {
            // Token is invalid/expired
            localStorage.removeItem("customerToken");
            localStorage.removeItem("customerUser");
            localStorage.removeItem("customerRefreshToken");
            window.dispatchEvent(new Event("storage"));
            setIsAuthenticated(false);
          } else {
            setMessage({ type: "error", text: "Failed to load profile details." });
            setIsAuthenticated(true);
          }
        }
      } catch (error) {
        const status = error?.status || error?.response?.status;
        if (status === 401) {
          localStorage.removeItem("customerToken");
          localStorage.removeItem("customerUser");
          localStorage.removeItem("customerRefreshToken");
          window.dispatchEvent(new Event("storage"));
          setIsAuthenticated(false);
        } else {
          setMessage({ type: "error", text: "Failed to connect to the server." });
          // If we had stored user info, keep authenticated so user can still see cached info
          if (localStorage.getItem("customerUser")) {
            try {
              const cached = JSON.parse(localStorage.getItem("customerUser"));
              setFormData({
                first_name: cached.first_name || "",
                last_name: cached.last_name || "",
                email: cached.email || "",
                phone: cached.phone || "",
              });
              setIsAuthenticated(true);
            } catch (e) {
              setIsAuthenticated(false);
            }
          }
        }
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const finalValue = name === "phone" ? sanitizePhoneInput(value) : value;
    setFormData((prev) => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    // Validate phone number if provided
    if (formData.phone && formData.phone.trim()) {
      const phoneVal = validatePhoneNumber(formData.phone);
      if (!phoneVal.isValid) {
        setMessage({ type: "error", text: phoneVal.message });
        setIsUpdating(false);
        return;
      }
    }

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      };

      const response = await updateMeApi(payload);

      if (response && response.status === 200) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        const updatedUser = response.data?.data || response.data;
        const newUserState = { ...JSON.parse(localStorage.getItem("customerUser") || "{}"), ...updatedUser };
        localStorage.setItem("customerUser", JSON.stringify(newUserState));
        window.dispatchEvent(new Event("storage"));
      } else {
        const errorData = response?.response?.data;
        let errMsg = "Failed to update profile.";
        if (errorData?.message) errMsg = errorData.message;
        else if (errorData?.detail) errMsg = errorData.detail;
        
        setMessage({ type: "error", text: errMsg });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Something went wrong. Please try again." });
    } finally {
      setIsUpdating(false);
    }
  };

  const confirmLogout = async () => {
    setIsLoggingOut(true);
    const refreshToken = localStorage.getItem("customerRefreshToken") || localStorage.getItem("adminRefreshToken");
    try {
      if (refreshToken) {
        await logoutApi({ refresh: refreshToken });
      }
    } catch (e) {
      console.error("Logout API call failed:", e);
    } finally {
      localStorage.removeItem("customerToken");
      localStorage.removeItem("customerUser");
      localStorage.removeItem("customerRefreshToken");
      window.dispatchEvent(new Event("storage"));
      setIsLoggingOut(false);
      setIsLogoutModalOpen(false);
      window.location.reload();
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
              <h2 className="text-xl font-normal text-[#2C332E] font-serif">
                {isAuthenticated ? "My Profile" : "Account"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[#5A635B] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors cursor-pointer"
                aria-label="Close drawer"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {initialLoading ? (
                <div className="flex items-center justify-center h-48">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2C332E]" />
                </div>
              ) : !isAuthenticated ? (
                /* Unauthenticated View: Sign In or Create Account */
                <div className="flex flex-col justify-between h-full space-y-6">
                  <div>
                    {/* Welcome Card */}
                    <div className="text-center py-7 px-5 bg-white rounded-2xl border border-[#E6E4DD] shadow-sm mb-6">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F4F0] flex items-center justify-center text-[#353B50] shadow-inner">
                        <User size={30} strokeWidth={1.5} />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C968D] mb-1.5">
                        Welcome to BigS Ventures
                      </p>
                      <h3 className="text-xl font-serif text-[#2C332E] font-medium mb-2">
                        Sign In or Create Account
                      </h3>
                      <p className="text-xs text-[#7B827C] leading-relaxed max-w-xs mx-auto mb-6">
                        Sign in to track orders, manage your wishlist, and enjoy a personalized shopping experience.
                      </p>

                      {/* Action Buttons */}
                      <div className="space-y-3">
                        <Link
                          href="/login"
                          onClick={onClose}
                          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest bg-[#353B50] text-white hover:bg-[#232736] transition-all shadow-md active:scale-[0.99]"
                        >
                          <LogIn size={16} />
                          <span>Sign In</span>
                        </Link>
                        <Link
                          href="/register"
                          onClick={onClose}
                          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl text-xs font-bold uppercase tracking-widest border border-[#353B50]/30 text-[#353B50] bg-white hover:bg-[#F5F4F0] transition-all active:scale-[0.99]"
                        >
                          <UserPlus size={16} />
                          <span>Create an Account</span>
                        </Link>
                      </div>
                    </div>

                    {/* Member Benefits */}
                    <div className="bg-white rounded-2xl border border-[#E6E4DD] p-4 space-y-3.5 shadow-sm">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-[#8C968D] px-1">
                        Member Benefits
                      </p>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center shrink-0 text-[#353B50]">
                          <Package size={16} strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C332E]">Order Tracking</p>
                          <p className="text-[11px] text-[#7B827C]">View real-time delivery status and past orders</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center shrink-0 text-[#353B50]">
                          <Heart size={16} strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C332E]">Saved Wishlist</p>
                          <p className="text-[11px] text-[#7B827C]">Keep your favorite items saved across devices</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-xs">
                        <div className="w-8 h-8 rounded-full bg-[#F5F4F0] flex items-center justify-center shrink-0 text-[#353B50]">
                          <ShieldCheck size={16} strokeWidth={1.75} />
                        </div>
                        <div>
                          <p className="font-semibold text-[#2C332E]">Fast & Secure Checkout</p>
                          <p className="text-[11px] text-[#7B827C]">Save delivery addresses for easy one-click checkout</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#E6E4DD] text-center">
                    <p className="text-xs text-[#7B827C]">
                      Need assistance?{" "}
                      <Link href="/contact" onClick={onClose} className="font-semibold text-[#353B50] hover:underline">
                        Contact Support
                      </Link>
                    </p>
                  </div>
                </div>
              ) : (
                /* Authenticated View: Profile Form */
                <>
                  <div className="mb-5 flex items-center justify-between bg-white p-3.5 rounded-xl border border-[#E6E4DD]">
                    <div>
                      <p className="text-xs font-semibold text-[#2C332E]">View All Orders & Details</p>
                      <p className="text-[11px] text-[#7B827C]">Access complete account dashboard</p>
                    </div>
                    <Link
                      href="/account"
                      onClick={onClose}
                      className="text-xs font-bold text-[#353B50] hover:underline flex items-center gap-1 shrink-0"
                    >
                      <span>Dashboard</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm text-[#7B827C] font-actor leading-relaxed">
                      Update your account details below. Your email address is used for login and cannot be changed here.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${
                          message.type === "success" 
                            ? "bg-emerald-50 border-emerald-100 text-emerald-800" 
                            : "bg-rose-50 border-rose-100 text-rose-800"
                        }`}
                      >
                        {message.type === "success" ? (
                          <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                        )}
                        <span>{message.text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* First Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                        First Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-[#8C968D]" />
                        </div>
                        <input
                          type="text"
                          name="first_name"
                          required
                          value={formData.first_name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-9 pr-3 text-sm text-[#2C332E] outline-none transition-all focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                        />
                      </div>
                    </div>

                    {/* Last Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                        Last Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-[#8C968D]" />
                        </div>
                        <input
                          type="text"
                          name="last_name"
                          value={formData.last_name}
                          onChange={handleChange}
                          className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-9 pr-3 text-sm text-[#2C332E] outline-none transition-all focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                        />
                      </div>
                    </div>

                    {/* Email Address (Read Only) */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-[#8C968D]" />
                        </div>
                        <input
                          type="email"
                          name="email"
                          readOnly
                          value={formData.email}
                          className="w-full rounded-lg border border-[#E6E4DD] bg-[#F5F4F0] py-3 pl-9 pr-3 text-sm text-[#5A635B] outline-none font-medium cursor-not-allowed opacity-80"
                        />
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                        Phone Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-[#8C968D]" />
                        </div>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-9 pr-3 text-sm text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                        />
                      </div>
                    </div>

                    <div className="pt-6">
                      <button
                        type="submit"
                        disabled={isUpdating}
                        className="w-full py-3.5 text-xs font-bold text-white bg-[#2C332E] rounded-lg hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest shadow-md"
                      >
                        {isUpdating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin text-white" />
                            <span>Saving...</span>
                          </>
                        ) : (
                          <span>Save Changes</span>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>

            {/* Footer / Logout (Only shown if authenticated) */}
            {isAuthenticated && (
              <div className="p-6 border-t border-[#E6E4DD] bg-white">
                <button
                  type="button"
                  onClick={() => setIsLogoutModalOpen(true)}
                  className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors uppercase tracking-widest cursor-pointer"
                >
                  <LogOut size={16} />
                  <span>Log Out</span>
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={isLogoutModalOpen}
        onClose={() => setIsLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        isLoading={isLoggingOut}
      />
    </AnimatePresence>
  );
}
