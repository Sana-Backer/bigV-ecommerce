"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userRegisterApi } from "@/services/auth";

function RegisterContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    password: "",
    confirm_password: "",
    newsletter_subscribed: false
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/";



  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Basic Validation
    if (!formData.first_name || !formData.email || !formData.password || !formData.confirm_password) {
      setError("Please fill in all required fields.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await userRegisterApi({
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        newsletter_subscribed: formData.newsletter_subscribed
      });

      if (response && (response.status === 200 || response.status === 201)) {
        setIsSuccess(true);
        const payload = response.data;
        const token = payload.data?.access || payload.access;
        const user = payload.data?.user || payload.user;

        if (token && user) {
          localStorage.setItem("customerToken", token);
          localStorage.setItem("customerUser", JSON.stringify(user));
          
          // Dispatch storage event to notify Navbar of state change
          window.dispatchEvent(new Event("storage"));
          
          // Redirect after showing the success state
          setTimeout(() => {
            window.location.href = redirectPath;
          }, 1500);
        } else {
          setError("Account created, but automatic sign-in failed. Please sign in manually.");
          setIsLoading(false);
        }
      } else {
        const errorResponse = response?.response || response;
        const errorData = errorResponse?.data;
        
        let errMsg = "Registration failed. Please check your details.";
        if (errorData) {
          if (errorData.message) {
            errMsg = errorData.message;
            if (errorData.errors && typeof errorData.errors === "object") {
              const fieldErrors = Object.entries(errorData.errors).map(([key, val]) => {
                const formattedKey = key.replace("_", " ");
                return `${formattedKey}: ${Array.isArray(val) ? val.join(" ") : val}`;
              });
              if (fieldErrors.length > 0) {
                errMsg = `${errorData.message} - ${fieldErrors.join(" | ")}`;
              }
            }
          } else if (errorData.detail) {
            errMsg = errorData.detail;
          }
        }
        setError(errMsg);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Registration failed:", err);
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
            Begin your journey to glowing skin.
          </h2>
          <p className="text-sm text-[#D1C9B7] leading-relaxed max-w-md font-light font-actor">
            Join the Lumora collective and receive personalized skincare consultations, early access to new releases, and curated beauty guides.
          </p>
        </div>
      </div>

      {/* Right Column - Sleek Form */}
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
        <div className="my-auto py-10 max-w-md w-full mx-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-normal text-[#2C332E] font-serif mb-2">
              Create an Account
            </h2>
            <p className="text-xs text-[#7B827C] tracking-wide font-actor">
              Sign up to personalize your skincare rituals and track your orders.
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

            {isSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl bg-emerald-50 border border-emerald-100 p-4 text-xs font-medium text-emerald-800"
              >
                <CheckCircle className="h-4.5 w-4.5 shrink-0 text-emerald-600 mt-0.5 animate-bounce" />
                <div>
                  <p className="font-bold">Account created successfully!</p>
                  <p className="text-[11px] text-emerald-700/90 mt-0.5 font-actor">Signing you in and redirecting to your destination...</p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {!isSuccess && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* First Name & Last Name (Row) */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                    First Name *
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-3.5 w-3.5 text-[#8C968D]" />
                    </div>
                    <input
                      type="text"
                      name="first_name"
                      required
                      placeholder="Jane"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-9 pr-3 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                    Last Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-3.5 w-3.5 text-[#8C968D]" />
                    </div>
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Doe"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-9 pr-3 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Mail className="h-3.5 w-3.5 text-[#8C968D]" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    placeholder="jane.doe@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-10 pr-4 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-3.5 w-3.5 text-[#8C968D]" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+1 (555) 000-0000"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-10 pr-4 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Password * (Min 8 chars)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-[#8C968D]" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-10 pr-11 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C968D] hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Confirm Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Lock className="h-3.5 w-3.5 text-[#8C968D]" />
                  </div>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirm_password"
                    required
                    placeholder="••••••••"
                    value={formData.confirm_password}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-[#E6E4DD] bg-white py-3 pl-10 pr-11 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D] font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C968D] hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

              {/* Newsletter Subscription */}
              <div className="flex items-start gap-2.5 pt-1">
                <label className="relative flex items-center gap-2.5 cursor-pointer select-none text-xs font-semibold text-[#5A635B] font-actor mt-0.5">
                  <input
                    type="checkbox"
                    name="newsletter_subscribed"
                    checked={formData.newsletter_subscribed}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-4 w-4 rounded border border-[#D5D3C8] bg-white transition-all peer-checked:border-[#738374] peer-checked:bg-[#738374] flex items-center justify-center shrink-0">
                    <svg
                      className="h-2.5 w-2.5 text-white hidden peer-checked:block stroke-[3]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                    </svg>
                  </div>
                  Subscribe to the Lumora newsletter for skincare rituals & product news
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-xs font-bold text-white bg-[#2C332E] rounded-lg hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest shadow-md pt-4"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-white" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </form>
          )}

          {/* Switch to Login */}
          {!isSuccess && (
            <div className="mt-6 text-center">
              <p className="text-xs text-[#5A635B] font-medium font-actor">
                Already have an account?{" "}
                <Link
                  href={`/login?redirect=${encodeURIComponent(redirectPath)}`}
                  className="text-[#738374] hover:text-black font-bold underline decoration-dotted transition-colors"
                >
                  Sign In
                </Link>
              </p>
            </div>
          )}
        </div>

        {/* Footer Copy */}
        <p className="text-center text-[10px] text-[#A8B2A9] font-medium tracking-wide">
          &copy; {new Date().getFullYear()} Lumora. All rights reserved. &bull; Secure Connection.
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F4F0] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-[#2C332E]" />
      </div>
    }>
      <RegisterContent />
    </Suspense>
  );
}
