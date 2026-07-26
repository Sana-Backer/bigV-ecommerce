"use client";

import React from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "tween", duration: 0.2 }}
            className="relative bg-white rounded-md shadow-2xl w-[90%] max-w-[360px] h-[480px] flex flex-col overflow-hidden z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 pb-2">
              <h2 className="text-[15px] font-bold text-gray-500 tracking-wide">
                Notification
              </h2>
              <button
                onClick={onClose}
                className="text-black hover:opacity-70 transition-opacity"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 flex flex-col items-center justify-center pb-10">
              <div className="flex flex-col items-center">
                <span className="text-[28px] text-[#2F3549] font-medium leading-none mb-1 translate-x-2">
                  No
                </span>
                <span 
                  className="text-[48px] text-[#2F3549] leading-none"
                  style={{ fontFamily: "var(--font-yellowtail)", letterSpacing: "1px" }}
                >
                  Notification
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
