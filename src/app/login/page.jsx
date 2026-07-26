"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userLoginApi } from "@/services/auth";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Get redirect path or default to Home
  const redirectPath = searchParams.get("redirect") || "/";



  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      const response = await userLoginApi({ email, password });

      if (response && (response.status === 200 || response.status === 201)) {
        const payload = response.data;
        const token = payload.data?.access || payload.access;
        const user = payload.data?.user || payload.user;

        if (token && user) {
          const refresh = payload.data?.refresh || payload.refresh;
          localStorage.setItem("customerToken", token);
          localStorage.setItem("customerUser", JSON.stringify(user));
          if (refresh) {
            localStorage.setItem("customerRefreshToken", refresh);
          }
          
          // Show quick success and redirect
          router.push(redirectPath);
          // Force a reload or dispatch event to refresh Navbar header state
          setTimeout(() => {
            window.dispatchEvent(new Event("storage"));
            window.location.href = redirectPath;
          }, 300);
        } else {
          setError("Invalid response format from server.");
          setIsLoading(false);
        }
      } else {
        const errorResponse = response?.response || response;
        const errorData = errorResponse?.data;
        
        let errMsg = "Invalid email or password.";
        if (errorData) {
          if (errorData.errors) {
            // DRF Validation errors wrapped in custom handler
            if (errorData.errors.non_field_errors) {
              errMsg = Array.isArray(errorData.errors.non_field_errors)
                ? errorData.errors.non_field_errors.join(" ")
                : errorData.errors.non_field_errors;
            } else {
              // Get the first error value from the object
              const firstError = Object.values(errorData.errors)[0];
              errMsg = Array.isArray(firstError) ? firstError.join(" ") : firstError;
            }
          } else if (errorData.message && errorData.message !== "Validation failed.") {
            errMsg = errorData.message;
          } else if (errorData.detail) {
            errMsg = errorData.detail;
          }
        }
        setError(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Failed to connect to the server. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F4F0] flex overflow-hidden font-sans">
      {/* Left Column - Elegant Luxury Banner Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#2C332E]">
        <img
          src="/skincare-hero.png"
          alt="Lumora Skincare"
          className="absolute inset-0 w-full h-full object-cover opacity-85 blend-luminosity"
        />
        {/* Subtle Dark Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2421]/90 via-[#2C332E]/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <Link href="/">
            <span className="text-sm font-semibold tracking-[0.4em] text-[#E0D8C3] uppercase mb-4 block">
              Lumora Skincare
            </span>
          </Link>
          <h2 className="text-4xl xl:text-5xl font-normal leading-tight font-serif text-[#FBF9F6] mb-6">
            Glow in your natural radiance.
          </h2>
          <p className="text-sm text-[#D1C9B7] leading-relaxed max-w-md font-light font-actor">
            Indulge in dermatologically crafted, clean, organic formulations designed to replenish and balance your skin.
          </p>
        </div>
      </div>

      {/* Right Column - Sleek Minimal Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between px-6 py-8 sm:px-16 lg:px-24 bg-[#FCFAF7] overflow-y-auto">
        {/* Top Header Row */}
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold text-[#5A635B] hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Shop
          </Link>
          
          <h1 className="text-xl font-normal tracking-[0.2em] text-[#2C332E] font-serif">
            LUMORA
          </h1>
        </div>

        {/* Form Container */}
        <div className="my-auto py-12 max-w-md w-full mx-auto">
          <div className="mb-10">
            <h2 className="text-3xl font-normal text-[#2C332E] font-serif mb-3">
              Welcome Back
            </h2>
            <p className="text-xs text-[#7B827C] tracking-wide font-actor">
              Sign in to your account to resume your skin wellness rituals.
            </p>
          </div>

          <AnimatePresence mode="wait">
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-6 flex items-start gap-3 rounded-xl bg-rose-50 border border-rose-100 p-4 text-xs font-medium text-rose-800"
              >
                <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-600 mt-0.5" />
                <span>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Address */}
            <div className="space-y-2">
              <label className="text-[11px] font-bold text-[#5A635B] uppercase tracking-widest">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-4 w-4 text-[#8C968D]" />
                </div>
                <input
                  type="email"
                  required
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3.5 pl-10 pr-4 text-sm text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Password
                </label>
                <a href="#" className="text-xs font-medium text-[#738374] hover:text-black hover:underline font-actor">
                  Forgot Password?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-[#8C968D]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3.5 pl-10 pr-11 text-sm text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C968D] hover:text-black transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="relative flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-[#5A635B] font-actor">
                <input
                  type="checkbox"
                  className="peer sr-only"
                />
                <div className="h-4 w-4 rounded border border-[#D5D3C8] bg-white transition-all peer-checked:border-[#738374] peer-checked:bg-[#738374] flex items-center justify-center">
                  <svg
                    className="h-2.5 w-2.5 text-white hidden peer-checked:block stroke-[3]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
                Remember this device
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 text-xs font-bold text-white bg-[#2C332E] rounded-lg hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest shadow-md"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Signing In...</span>
                </>
              ) : (
                <span>Sign In</span>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-8 text-center">
            <p className="text-xs text-[#5A635B] font-medium font-actor">
              New to Lumora?{" "}
              <Link
                href={`/register?redirect=${encodeURIComponent(redirectPath)}`}
                className="text-[#738374] hover:text-black font-bold underline decoration-dotted transition-colors"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Copy */}
        <p className="text-center text-[10px] text-[#A8B2A9] font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Lumora. All rights reserved. &bull; Secure Connection.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C332E]" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
