"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, ArrowLeft, AlertCircle, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { resetPasswordApi } from "@/services/auth";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState({ type: "", message: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus({ 
        type: "error", 
        message: "Invalid or missing password reset link. Please request a new one." 
      });
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: "", message: "" });

    if (!token) {
      setStatus({ type: "error", message: "Invalid reset link." });
      return;
    }

    if (!password || !confirmPassword) {
      setStatus({ type: "error", message: "Please fill in all fields." });
      return;
    }

    if (password !== confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match." });
      return;
    }

    setIsLoading(true);
    try {
      const res = await resetPasswordApi({ 
        token, 
        new_password: password,
        confirm_password: confirmPassword
      });
      
      if (res.status === 200 || res.status === 204 || res.data) {
        setIsSuccess(true);
        setStatus({ 
          type: "success", 
          message: "Your password has been successfully reset. You can now login with your new password." 
        });
      }
    } catch (err) {
      setStatus({ 
        type: "error", 
        message: err.response?.data?.message || err.response?.data?.password?.[0] || "Failed to reset password. The link might be expired." 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#F5F4F0] overflow-hidden">
      {/* Left Column - Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#1F2421]">
        <img
          src="https://images.unsplash.com/photo-1556228578-0d85b1a4d571?q=80&w=1887&auto=format&fit=crop"
          alt="Lumora Skincare"
          className="absolute inset-0 w-full h-full object-cover opacity-85 blend-luminosity"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2421]/90 via-[#2C332E]/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <Link href="/">
            <span className="text-sm font-semibold tracking-[0.4em] text-[#E0D8C3] uppercase mb-4 block">
              Lumora Skincare
            </span>
          </Link>
          <h2 className="text-4xl xl:text-5xl font-normal leading-tight font-serif text-[#FBF9F6] mb-6">
            A new beginning.
          </h2>
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 py-8 sm:px-16 lg:px-24 bg-[#FCFAF7] overflow-y-auto">
        <div className="flex items-center justify-between">
          <Link
            href="/login"
            className="group flex items-center gap-2 text-xs font-semibold text-[#5A635B] hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Login
          </Link>
          
          <h1 className="text-xl font-normal tracking-[0.2em] text-[#2C332E] font-serif">
            LUMORA
          </h1>
        </div>

        <div className="my-auto py-12 max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-normal text-[#2C332E] font-serif mb-3">
              Set New Password
            </h2>
            <p className="text-xs text-[#7B827C] tracking-wide font-actor">
              Please enter your new password below.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {status.message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-6 flex items-start gap-3 rounded-xl border p-4 text-xs font-medium ${
                  status.type === 'success' 
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                    : 'bg-rose-50 border-rose-100 text-rose-800'
                }`}
              >
                {status.type === 'success' ? (
                  <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                )}
                <span className="leading-relaxed">{status.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5A635B] uppercase tracking-widest">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#A8B0A9]" />
                  </div>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={!token}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E6E4DD] rounded-xl text-sm font-medium text-[#2C332E] placeholder:text-[#A8B0A9] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#738374]/30 focus:border-[#738374] transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-[#A8B0A9]" />
                  </div>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={!token}
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#E6E4DD] rounded-xl text-sm font-medium text-[#2C332E] placeholder:text-[#A8B0A9] placeholder:font-normal focus:outline-none focus:ring-2 focus:ring-[#738374]/30 focus:border-[#738374] transition-all disabled:opacity-50"
                    placeholder="••••••••"
                    required
                    minLength={8}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !token}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#2C332E] text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#1A1F1B] active:bg-black transition-colors disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-[#2C332E]/10"
              >
                {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                {isLoading ? "Saving..." : "Reset Password"}
              </button>
            </form>
          )}

          {isSuccess && (
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-3.5 bg-[#2C332E] text-white rounded-xl text-xs font-bold tracking-widest uppercase hover:bg-[#1A1F1B] active:bg-black transition-colors shadow-md shadow-[#2C332E]/10"
            >
              Return to Login
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F5F4F0] flex justify-center items-center"><Loader2 className="animate-spin text-[#2C332E]" size={48} /></div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}
