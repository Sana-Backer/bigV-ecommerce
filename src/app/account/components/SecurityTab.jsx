 "use client";

import React, { useState } from "react";
import { changePasswordApi } from "@/services/auth";
import { Loader2, Key } from "lucide-react";

export default function SecurityTab() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [formData, setFormData] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ text: "", type: "" });

    if (formData.new_password !== formData.confirm_password) {
      setMessage({ text: "New passwords do not match.", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const res = await changePasswordApi({
        current_password: formData.current_password,
        new_password: formData.new_password,
        confirm_password: formData.confirm_password,
      });

      if (res.status === 200 || res.status === 204) {
        setMessage({ text: "Password changed successfully!", type: "success" });
        setFormData({ current_password: "", new_password: "", confirm_password: "" });
      } else {
        const errorData = res.response?.data || res.data;
        let errorMsg = "Failed to change password. Please try again.";
        
        if (errorData) {
          if (errorData.message && errorData.message !== "Validation failed.") {
            errorMsg = errorData.message;
          } else if (errorData.errors) {
            errorMsg = Object.values(errorData.errors)[0]?.[0] || errorMsg;
          } else if (errorData.current_password) {
            errorMsg = errorData.current_password[0];
          } else if (errorData.new_password) {
            errorMsg = errorData.new_password[0];
          } else if (errorData.non_field_errors) {
            errorMsg = errorData.non_field_errors[0];
          }
        }
        
        setMessage({ text: errorMsg, type: "error" });
      }
    } catch (err) {
      setMessage({ 
        text: "An unexpected error occurred.", 
        type: "error" 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h2 className="text-2xl font-serif text-slate-800 mb-6">Security Settings</h2>
      
      {message.text && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Current Password</label>
          <input
            type="password"
            name="current_password"
            value={formData.current_password}
            onChange={handleChange}
            required
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">New Password</label>
          <input
            type="password"
            name="new_password"
            value={formData.new_password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Confirm New Password</label>
          <input
            type="password"
            name="confirm_password"
            value={formData.confirm_password}
            onChange={handleChange}
            required
            minLength={8}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
          />
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#2C332E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1A1F1B] transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Key size={18} />}
            {loading ? "Updating..." : "Update Password"}
          </button>
        </div>
      </form>
    </div>
  );
}
