"use client";

import React from "react";
import { LogOut, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm, isLoading = false }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={!isLoading ? onClose : undefined}
          />

          {/* Modal Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
            className="relative w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl border border-gray-100 z-10 font-sans"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              disabled={isLoading}
              className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-colors cursor-pointer disabled:opacity-50"
              aria-label="Close"
            >
              <X size={18} />
            </button>

            {/* Icon */}
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-rose-50 text-rose-600 border border-rose-100 shadow-inner">
              <LogOut size={24} strokeWidth={2} />
            </div>

            {/* Title & Description */}
            <div className="text-center mb-6">
              <h3 className="text-lg font-serif font-medium text-[#2C332E] mb-2">
                Log Out Confirmation
              </h3>
              <p className="text-xs text-[#7B827C] leading-relaxed">
                Are you sure you want to log out of your BigS Ventures account? You will need to sign in again to view your orders and profile.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors uppercase tracking-wider cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={isLoading}
                className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#9A353B] hover:bg-[#852C31] transition-colors uppercase tracking-wider shadow-sm cursor-pointer disabled:opacity-50 flex items-center justify-center gap-1.5"
              >
                {isLoading ? (
                  <span>Logging out...</span>
                ) : (
                  <>
                    <LogOut size={14} />
                    <span>Log Out</span>
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

