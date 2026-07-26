"use client";

import React, { useState, useEffect } from "react";
import { User, Mail, Phone, Loader2, X, CheckCircle, AlertCircle, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getMeApi, updateMeApi, logoutApi } from "@/services/auth";

export default function ProfileDrawer({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
  });

  const [initialLoading, setInitialLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [message, setMessage] = useState(null); // { type: "success" | "error", text: "..." }

  useEffect(() => {
    if (!isOpen) return; // Only fetch when opened

    const fetchProfile = async () => {
      setInitialLoading(true);
      setMessage(null);
      
      const token = localStorage.getItem("customerToken");
      if (!token) {
        setInitialLoading(false);
        return;
      }

      try {
        const response = await getMeApi();
        if (response && response.status === 200) {
          const userData = response.data.data || response.data;
          setFormData({
            first_name: userData.first_name || "",
            last_name: userData.last_name || "",
            email: userData.email || "",
            phone: userData.phone || "",
          });
          localStorage.setItem("customerUser", JSON.stringify(userData));
        } else {
          setMessage({ type: "error", text: "Failed to load profile details." });
        }
      } catch (error) {
        setMessage({ type: "error", text: "Failed to connect to the server." });
      } finally {
        setInitialLoading(false);
      }
    };

    fetchProfile();
  }, [isOpen]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage(null);

    try {
      const payload = {
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
      };

      const response = await updateMeApi(payload);

      if (response && response.status === 200) {
        setMessage({ type: "success", text: "Profile updated successfully!" });
        const updatedUser = response.data.data || response.data;
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

  const handleLogout = async () => {
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
                My Profile
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-[#5A635B] hover:text-black hover:bg-[#F5F4F0] rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {initialLoading ? (
                <div className="flex items-center justify-center h-40">
                  <Loader2 className="h-6 w-6 animate-spin text-[#2C332E]" />
                </div>
              ) : (
                <>
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

            {/* Footer / Logout */}
            <div className="p-6 border-t border-[#E6E4DD] bg-white">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 py-3 text-xs font-bold text-rose-500 hover:text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors uppercase tracking-widest"
              >
                <LogOut size={16} />
                <span>Log Out</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
