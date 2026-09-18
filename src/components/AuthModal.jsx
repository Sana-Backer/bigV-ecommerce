"use client";

import React from "react";
import { X, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function AuthModal({ isOpen, onClose }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ type: "tween", duration: 0.3, ease: "easeOut" }}
            className="relative bg-white dark:bg-[#1a1a1a] rounded-2xl shadow-2xl w-full max-w-[400px] flex flex-col overflow-hidden z-10 p-8 text-center"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <X size={20} strokeWidth={2} />
            </button>

            <div className="mx-auto bg-gray-100 dark:bg-white/10 p-4 rounded-full mb-6">
              <LogIn size={32} className="text-[#353B50] dark:text-gray-300" strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl font-bold text-[#353B50] dark:text-white mb-3" style={{ fontFamily: "var(--font-dm-serif)" }}>
              Love it? Save it! ✨
            </h2>
            
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-8 px-2 leading-relaxed">
              Sign in to add this gorgeous item to your wishlist. Keep all your favorites in one place and never lose track of what you love! 💖
            </p>

            <div className="flex flex-col gap-3">
              <Link 
                href="/login"
                className="w-full py-3.5 bg-[#353B50] hover:bg-[#2a2f40] dark:bg-white dark:text-black dark:hover:bg-gray-200 text-white font-semibold rounded-xl transition-colors shadow-sm"
              >
                Sign In
              </Link>
              <button 
                onClick={onClose}
                className="w-full py-3.5 bg-gray-100 hover:bg-gray-200 dark:bg-white/5 dark:hover:bg-white/10 dark:text-white text-[#353B50] font-semibold rounded-xl transition-colors"
              >
                Maybe Later
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
