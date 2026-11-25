"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail, Lock, User, Phone, Eye, EyeOff, Loader2, ArrowLeft, AlertCircle, CheckCircle, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { userRegisterApi } from "@/services/auth";
import { validatePhoneNumber, sanitizePhoneInput } from "@/lib/phoneValidation";

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
  const [errorBanner, setErrorBanner] = useState(null); // { title, message, hasExistingAccount }
  const [fieldErrors, setFieldErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const redirectPath = searchParams.get("redirect") || "/";

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = name === "phone" ? sanitizePhoneInput(value) : value;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : finalValue
    }));
    
    // Clear errors when the user begins typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
    if (errorBanner) {
      setErrorBanner(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorBanner(null);
    setFieldErrors({});

    // Basic Validation
    if (!formData.first_name || !formData.email || !formData.password || !formData.confirm_password) {
      setErrorBanner({
        title: "Missing Information",
        message: "Please fill in all required fields marked with an asterisk (*)."
      });
      return;
    }

    // Phone Validation
    if (!formData.phone || !formData.phone.trim()) {
      setErrorBanner({
        title: "Phone Number Required",
        message: "Please enter your mobile phone number."
      });
      return;
    }

    const phoneValidation = validatePhoneNumber(formData.phone);
    if (!phoneValidation.isValid) {
      setErrorBanner({
        title: "Invalid Phone Number",
        message: phoneValidation.message
      });
      setFieldErrors({ phone: phoneValidation.message });
      return;
    }

    if (formData.password.length < 8) {
      setErrorBanner({
        title: "Password Too Short",
        message: "Password must be at least 8 characters long."
      });
      setFieldErrors({ password: "Must be at least 8 characters long." });
      return;
    }

    if (formData.password !== formData.confirm_password) {
      setErrorBanner({
        title: "Passwords Do Not Match",
        message: "Please ensure both password fields match exactly."
      });
      setFieldErrors({ confirm_password: "Passwords do not match." });
      return;
    }

    setIsLoading(true);

    try {
      // Build clean payload — only include last_name if actually provided
      const payload = {
        email: formData.email.trim(),
        first_name: formData.first_name.trim(),
        phone: phoneValidation.formatted || formData.phone.trim(),
        password: formData.password,
        confirm_password: formData.confirm_password,
        newsletter_subscribed: formData.newsletter_subscribed
      };

      if (formData.last_name && formData.last_name.trim()) {
        payload.last_name = formData.last_name.trim();
      }

      const response = await userRegisterApi(payload);

      if (response && (response.status === 200 || response.status === 201)) {
        setIsSuccess(true);
        const resData = response.data;
        const token = resData.data?.access || resData.access;
        const user = resData.data?.user || resData.user;

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
          setErrorBanner({
            title: "Sign In Required",
            message: "Account created, but automatic sign-in failed. Please sign in manually."
          });
          setIsLoading(false);
        }
      }
    } catch (err) {
      console.error("Registration failed:", err);
      const errorData = err.response?.data;

      if (errorData) {
        const rawErrors = errorData.errors || {};
        const friendlyFieldErrors = {};

        // Parse and humanize field error messages
        for (const [key, val] of Object.entries(rawErrors)) {
          const raw = Array.isArray(val) ? val.join(" ") : String(val);
          if (raw.toLowerCase().includes("already exists") || raw.toLowerCase().includes("already registered")) {
            friendlyFieldErrors[key] = "This email is already registered.";
          } else if (raw.toLowerCase().includes("may not be blank")) {
            friendlyFieldErrors[key] = `Please enter your ${key.replace(/_/g, " ")}.`;
          } else if (raw.toLowerCase().includes("valid email")) {
            friendlyFieldErrors[key] = "Please enter a valid email address.";
          } else if (raw.toLowerCase().includes("password")) {
            friendlyFieldErrors[key] = raw;
          } else {
            friendlyFieldErrors[key] = raw;
          }
        }

        setFieldErrors(friendlyFieldErrors);

        // Check if email duplicate is the main issue
        if (friendlyFieldErrors.email && (friendlyFieldErrors.email.includes("already registered") || friendlyFieldErrors.email.includes("already exists"))) {
          setErrorBanner({
            title: "Already have an account?",
            message: "An account with this email address already exists.",
            hasExistingAccount: true
          });
        } else {
          const count = Object.keys(friendlyFieldErrors).length;
          if (count === 1) {
            setErrorBanner({
              title: "Please Check Your Information",
              message: Object.values(friendlyFieldErrors)[0]
            });
          } else if (count > 1) {
            setErrorBanner({
              title: "Please Check the Highlighted Fields",
              message: "Some details need your attention before we can create your account."
            });
          } else {
            setErrorBanner({
              title: "Registration Failed",
              message: errorData.message || errorData.detail || "Please verify your details and try again."
            });
          }
        }
      } else {
        setErrorBanner({
          title: "Connection Error",
          message: "Unable to connect to the server. Please check your internet connection and try again."
        });
      }
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FCFAF7] lg:bg-[#F5F4F0] flex flex-col lg:flex-row font-sans">
      {/* Left Column - Elegant Luxury Banner Image */}
      <div className="hidden lg:block lg:w-1/2 relative bg-[#2C332E] min-h-screen sticky top-0 h-screen">
        <img
          src="/skincare-hero.png"
          alt="BigS Ventures Skincare"
          className="absolute inset-0 w-full h-full object-cover opacity-85 blend-luminosity"
        />
        {/* Subtle Dark Gold Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#1F2421]/90 via-[#2C332E]/40 to-transparent" />
        
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <Link href="/">
            <span className="text-sm font-semibold tracking-[0.4em] text-[#E0D8C3] uppercase mb-4 block">
              BigS Ventures
            </span>
          </Link>
          <h2 className="text-4xl xl:text-5xl font-normal leading-tight font-serif text-[#FBF9F6] mb-6">
            Begin your journey to glowing skin.
          </h2>
          <p className="text-sm text-[#D1C9B7] leading-relaxed max-w-md font-light font-actor">
            Join the BigS Ventures collective and receive personalized skincare consultations, early access to new releases, and curated beauty guides.
          </p>
        </div>
      </div>

      {/* Right Column - Sleek Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-between min-h-screen px-6 py-6 sm:px-12 lg:px-20 bg-[#FCFAF7]">
        {/* Top Header Row */}
        <div className="flex items-center justify-between w-full max-w-md mx-auto pt-2 pb-4 shrink-0">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xs font-semibold text-[#5A635B] hover:text-black transition-colors"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to Shop
          </Link>
          
          <Link href="/" className="flex items-center">
            <img
              src="/logo.png"
              alt="BigS Ventures"
              className="h-9 md:h-11 w-auto object-contain"
            />
          </Link>
        </div>

        {/* Form Container */}
        <div className="w-full max-w-md mx-auto py-6 flex-1 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-3xl font-normal text-[#2C332E] font-serif mb-2">
              Create an Account
            </h2>
            <p className="text-xs text-[#7B827C] tracking-wide font-actor">
              Sign up to personalize your skincare rituals and track your orders.
            </p>
          </div>

          <AnimatePresence mode="wait">
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
                      className={`w-full rounded-lg border bg-white py-3 pl-9 pr-3 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                        fieldErrors.first_name
                          ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                          : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                      }`}
                    />
                  </div>
                  {fieldErrors.first_name && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                      <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                      <span>{fieldErrors.first_name}</span>
                    </div>
                  )}
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
                      className={`w-full rounded-lg border bg-white py-3 pl-9 pr-3 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                        fieldErrors.last_name
                          ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                          : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                      }`}
                    />
                  </div>
                  {fieldErrors.last_name && (
                    <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                      <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                      <span>{fieldErrors.last_name}</span>
                    </div>
                  )}
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
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                      fieldErrors.email
                        ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                        : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                    }`}
                  />
                </div>
                {fieldErrors.email && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                    <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                    <span>{fieldErrors.email}</span>
                    <Link
                      href={`/login?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirectPath)}`}
                      className="underline underline-offset-2 hover:text-[#2C332E] font-medium text-[#7D3B3B] transition-colors ml-0.5"
                    >
                      Sign in &rarr;
                    </Link>
                  </div>
                )}
              </div>

              {/* Phone Number */}
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold text-[#5A635B] uppercase tracking-widest">
                  Phone Number *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone className="h-3.5 w-3.5 text-[#8C968D]" />
                  </div>
                  <input
                    type="tel"
                    name="phone"
                    required
                    maxLength={16}
                    placeholder="10-digit mobile number"
                    value={formData.phone}
                    onChange={handleChange}
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-4 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                      fieldErrors.phone
                        ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                        : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                    }`}
                  />
                </div>
                {fieldErrors.phone && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                    <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                    <span>{fieldErrors.phone}</span>
                  </div>
                )}
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
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                      fieldErrors.password
                        ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                        : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C968D] hover:text-black transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                    <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                    <span>{fieldErrors.password}</span>
                  </div>
                )}
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
                    className={`w-full rounded-lg border bg-white py-3 pl-10 pr-11 text-xs text-[#2C332E] outline-none transition-all placeholder:text-[#A8B2A9] font-medium ${
                      fieldErrors.confirm_password
                        ? "border-[#E5A8A8] focus:border-[#C97B7B]"
                        : "border-[#E6E4DD] focus:border-[#8C968D] focus:ring-1 focus:ring-[#8C968D]"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#8C968D] hover:text-black transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {fieldErrors.confirm_password && (
                  <div className="flex items-center gap-1.5 mt-1.5 text-xs text-[#A84B4B] font-actor">
                    <Info className="h-3.5 w-3.5 shrink-0 text-[#A84B4B]" />
                    <span>{fieldErrors.confirm_password}</span>
                  </div>
                )}
              </div>

              {/* Error Message Banner (Positioned right above Create Account) */}
              <AnimatePresence mode="wait">
                {errorBanner && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="rounded-2xl bg-[#F4F1EB] border border-[#E8E4DD] p-4 sm:p-5 shadow-xs text-left"
                  >
                    <div className="flex items-center gap-2">
                      <Info className="h-4 w-4 text-[#5A635B] shrink-0" />
                      <h4 className="text-sm font-bold text-[#2C332E] tracking-tight">
                        {errorBanner.title}
                      </h4>
                    </div>
                    <p className="text-xs text-[#5A635B] leading-relaxed mt-1.5 font-actor">
                      {errorBanner.message}
                    </p>

                    {errorBanner.hasExistingAccount && (
                      <div className="mt-3">
                        <Link
                          href={`/login?email=${encodeURIComponent(formData.email)}&redirect=${encodeURIComponent(redirectPath)}`}
                          className="text-xs font-semibold text-[#2C332E] underline underline-offset-4 hover:text-black transition-colors"
                        >
                          Sign in to your account &rarr;
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 text-xs font-bold text-white bg-[#2C332E] rounded-lg hover:bg-[#3E4741] transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-70 disabled:pointer-events-none uppercase tracking-widest shadow-md"
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
        <div className="pt-4 pb-2 shrink-0 text-center">
          <p className="text-[10px] text-[#A8B2A9] font-medium tracking-wide">
            &copy; {new Date().getFullYear()} BigS Ventures. All rights reserved. &bull; Secure Connection.
          </p>
        </div>
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
