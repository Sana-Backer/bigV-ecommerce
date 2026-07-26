"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Mail, Lock, Eye, EyeOff, AlertCircle, Loader2 } from "lucide-react";
import { adminLoginApi } from "@/services/auth";

export default function AdminLogin() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Please fill in all fields.");
            return;
        }

        setIsLoading(true);

        try {
            const reqBody = { email, password };
            const response = await adminLoginApi(reqBody);

            if (response && (response.status === 200 || response.status === 201)) {
                const payload = response.data;
                const token = payload.data?.access;
                const user = payload.data?.user;

                if (token && user) {
                    // Verify that user has an administrative role
                    if (user.role === "admin" || user.role === "manager" || user.role === "staff") {
                        const refresh = payload.data?.refresh;
                        localStorage.setItem("adminToken", token);
                        localStorage.setItem("adminUser", JSON.stringify(user));
                        if (refresh) {
                            localStorage.setItem("adminRefreshToken", refresh);
                        }
                        router.push("/admin/dashboard");
                    } else {
                        setError("Access denied. You do not have administrative privileges.");
                    }
                } else {
                    setError("Invalid response structure from server.");
                }
            } else {
                // Handle error status or connection issue
                const errorResponse = response?.response || response;
                const errorData = errorResponse?.data;

                let errMsg = "Invalid email or password.";
                if (errorData) {
                    if (errorData.message) {
                        errMsg = errorData.message;
                        if (errorData.errors && typeof errorData.errors === "object") {
                            const fieldErrors = Object.values(errorData.errors).flat();
                            if (fieldErrors.length > 0) {
                                errMsg = `${errorData.message} ${fieldErrors.join(" ")}`;
                            }
                        }
                    } else if (errorData.detail) {
                        errMsg = errorData.detail;
                    }
                }
                setError(errMsg);
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Failed to connect to the server.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center bg-[#0B0F19] px-4 py-12 sm:px-6 lg:px-8 overflow-hidden font-sans">
            {/* Background Decorative Glows */}
            <div className="absolute top-[-20%] left-[-10%] h-[500px] w-[500px] rounded-full bg-[#2C3B5E]/20 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] h-[500px] w-[500px] rounded-full bg-[#E1E1C9]/10 blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                {/* Brand Header */}
                <div className="flex flex-col items-center text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#2C3B5E] to-[#4A5D8A] shadow-lg shadow-[#2C3B5E]/30 mb-4 ring-1 ring-white/10">
                        <Sparkles className="h-6.5 w-6.5 text-[#E9F5FF] stroke-[1.8]" />
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-white font-actor">
                        Lumora Portal
                    </h2>
                    <p className="mt-2 text-xs font-semibold text-slate-400 uppercase tracking-widest">
                        Luxury Skincare Admin
                    </p>
                </div>

                {/* Login Form Card */}
                <div className="bg-slate-900/60 border border-slate-800/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl">
                    <h3 className="text-lg font-bold text-white mb-6">Sign in to your account</h3>

                    {error && (
                        <div className="mb-6 flex items-start gap-3 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs font-medium text-rose-300">
                            <AlertCircle className="h-4.5 w-4.5 shrink-0 text-rose-400" />
                            <span>{error}</span>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Email field */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-400">Email Address</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Mail className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="admin@lumora.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-4 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#4A5D8A] focus:bg-slate-950/80 focus:ring-1 focus:ring-[#4A5D8A] font-medium"
                                />
                            </div>
                        </div>

                        {/* Password field */}
                        <div className="space-y-1.5">
                            <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-slate-400">Password</label>
                                <a href="#" className="text-xs font-semibold text-[#8DA2D4] hover:underline">
                                    Forgot password?
                                </a>
                            </div>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                                    <Lock className="h-4 w-4 text-slate-500" />
                                </div>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full rounded-xl border border-slate-800 bg-slate-950/40 py-3 pl-10 pr-11 text-sm text-white outline-none transition-all placeholder:text-slate-600 focus:border-[#4A5D8A] focus:bg-slate-950/80 focus:ring-1 focus:ring-[#4A5D8A] font-medium"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember me option */}
                        <div className="flex items-center justify-between pt-1">
                            <label className="relative flex items-center gap-2.5 cursor-pointer select-none text-xs font-bold text-[#94A3B8]">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="peer sr-only"
                                />
                                <div className="h-4.5 w-4.5 rounded-md border border-slate-700 bg-slate-950/50 transition-all peer-checked:border-[#4A5D8A] peer-checked:bg-[#2C3B5E] flex items-center justify-center">
                                    <svg
                                        className="h-3 w-3 text-white hidden peer-checked:block stroke-[2.5]"
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

                        {/* Submit button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 text-sm font-bold text-white bg-gradient-to-r from-[#2C3B5E] to-[#4A5D8A] rounded-xl hover:from-[#374974] hover:to-[#5B71A8] transition-all cursor-pointer shadow-lg shadow-[#2C3B5E]/20 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50"
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
                </div>

                {/* Footer info helper */}
                <p className="text-center text-xs text-slate-500">
                    Lumora Skincare Portal &bull; Protected Connection
                </p>
            </div>
        </div>
    );
}