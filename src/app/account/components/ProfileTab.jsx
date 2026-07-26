"use client";

import React, { useState, useEffect } from "react";
import { getMyProfileApi, updateMyProfileApi, updateMeApi } from "@/services/auth";
import { Loader2, Save } from "lucide-react";

export default function ProfileTab({ user, fetchUser }) {
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [message, setMessage] = useState("");

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    bio: "",
    gender: "",
    date_of_birth: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        phone: user.phone || "",
      }));
    }
    fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    setProfileLoading(true);
    try {
      const res = await getMyProfileApi();
      if (res.status === 200) {
        const profile = res.data?.data || res.data;
        setFormData((prev) => ({
          ...prev,
          bio: profile.bio || "",
          gender: profile.gender || "",
          date_of_birth: profile.date_of_birth || "",
        }));
      }
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setProfileLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // 1. Update basic user info (first_name, last_name, phone)
      const userRes = await updateMeApi({
        first_name: formData.first_name,
        last_name: formData.last_name,
        phone: formData.phone,
      });

      // 2. Update extended profile info
      const profileBody = {
        bio: formData.bio,
        gender: formData.gender,
      };
      if (formData.date_of_birth) {
        profileBody.date_of_birth = formData.date_of_birth;
      }
      
      const profileRes = await updateMyProfileApi(profileBody);

      if (userRes.status === 200 || profileRes.status === 200) {
        setMessage("Profile updated successfully!");
        fetchUser(); // Refresh user context if needed
      }
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#2C332E]" size={32} />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8">
      <h2 className="text-2xl font-serif text-slate-800 mb-6">Personal Information</h2>
      
      {message && (
        <div className={`p-4 mb-6 rounded-xl text-sm font-semibold ${message.includes("successfully") ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">First Name</label>
            <input
              type="text"
              name="first_name"
              value={formData.first_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Last Name</label>
            <input
              type="text"
              name="last_name"
              value={formData.last_name}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Email Address (Read-only)</label>
            <input
              type="email"
              value={user?.email || ""}
              readOnly
              className="w-full bg-slate-100 border border-slate-200 rounded-xl px-4 py-3 text-slate-500 cursor-not-allowed"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Phone Number</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+919876543210"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Gender</label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none"
            >
              <option value="">Select Gender</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
              <option value="N">Prefer not to say</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-slate-600">Date of Birth</label>
            <input
              type="date"
              name="date_of_birth"
              value={formData.date_of_birth}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-semibold text-slate-600">Bio</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleChange}
            rows={4}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-[#2C332E] text-white px-8 py-3.5 rounded-xl font-bold hover:bg-[#1A1F1B] transition-colors active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
            {loading ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
