"use client";

import React, { useState } from "react";
import {
  User,
  Shield,
  Bell,
  Camera,
  EyeOff,
  Eye,
  CheckCircle2
} from "lucide-react";
import Image from "next/image";

export default function AccountSettings() {
  const [activeTab, setActiveTab] = useState("personal");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const [personalDetails, setPersonalDetails] = useState({
    firstName: "sana",
    lastName: "admin",
    email: "admin@gmail.com",
    phone: "123",
  });

  const [passwords, setPasswords] = useState({
    current: "............",
    new: "",
  });

  const tabs = [
    { id: "personal", label: "Personal Info", icon: User },
    { id: "security", label: "Security & Privacy", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800 h-full overflow-y-auto">
      {/* Header */}
      <div>
        <h1 className="text-[28px] font-semibold text-[#1e293b] tracking-tight">
          Account Settings
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Manage your personal information, security preferences,<br />and account notifications.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6 mt-8 items-start">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-[240px] shrink-0 space-y-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive 
                  ? "bg-[#e2e8f0] text-[#1e293b]" 
                  : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 max-w-[800px] w-full flex flex-col gap-6">
          
          {activeTab === "personal" && (
            <>
              {/* Profile Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                
                {/* Profile Header section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 pb-6 border-b border-slate-100">
                  <div className="relative">
                    <div className="w-24 h-24 rounded-full bg-slate-900 overflow-hidden flex items-center justify-center border-4 border-white shadow-sm relative">
                      {/* Placeholder for the eye/lens image from the screenshot */}
                      <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900 rounded-full flex items-center justify-center">
                         <div className="w-12 h-12 rounded-full border-4 border-[#c5a880] opacity-50"></div>
                      </div>
                    </div>
                    <button className="absolute bottom-0 right-0 p-1.5 bg-slate-600 rounded-full border-2 border-white text-white hover:bg-slate-700 transition-colors">
                      <Camera className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  
                  <div className="flex-1 flex flex-col sm:flex-row justify-between items-center sm:items-start gap-4 w-full">
                    <div className="text-center sm:text-left">
                      <h2 className="text-base font-semibold text-slate-800">sana admin</h2>
                      <p className="text-sm text-slate-500 mb-4">administrator@lumorabeauty.com</p>
                      
                      <div className="flex gap-3 justify-center sm:justify-start">
                        <button className="px-4 py-1.5 bg-[#1e293b] text-white text-xs font-medium rounded-md hover:bg-slate-800 transition-colors">
                          Change Photo
                        </button>
                        <button className="px-4 py-1.5 bg-white border border-slate-300 text-slate-700 text-xs font-medium rounded-md hover:bg-slate-50 transition-colors">
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="px-3 py-1 bg-[#cbd5e1]/50 text-[#475569] text-xs font-bold tracking-wider rounded-full uppercase">
                      Super Admin
                    </div>
                  </div>
                </div>

                {/* Personal Details Form */}
                <div className="pt-6">
                  <h3 className="text-[15px] font-semibold text-slate-700 mb-5">Personal Details</h3>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">First Name</label>
                      <input
                        type="text"
                        value={personalDetails.firstName}
                        onChange={(e) => setPersonalDetails({...personalDetails, firstName: e.target.value})}
                        className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Last Name</label>
                      <input
                        type="text"
                        value={personalDetails.lastName}
                        onChange={(e) => setPersonalDetails({...personalDetails, lastName: e.target.value})}
                        className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Email Address</label>
                      <input
                        type="email"
                        value={personalDetails.email}
                        onChange={(e) => setPersonalDetails({...personalDetails, email: e.target.value})}
                        className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Phone Number</label>
                      <input
                        type="text"
                        value={personalDetails.phone}
                        onChange={(e) => setPersonalDetails({...personalDetails, phone: e.target.value})}
                        className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 px-3 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                      />
                    </div>
                  </div>
                  
                  <div className="mt-8 flex justify-end">
                    <button className="px-5 py-2.5 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>

              {/* Security & Password Card */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
                <h3 className="text-[15px] font-semibold text-slate-700 mb-6">Security & Password</h3>
                
                <div className="flex flex-col md:flex-row gap-8">
                  {/* Password Inputs */}
                  <div className="flex-1 space-y-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">Current Password</label>
                      <div className="relative">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          value={passwords.current}
                          onChange={(e) => setPasswords({...passwords, current: e.target.value})}
                          className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 pl-3 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20 tracking-wider"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showCurrentPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-slate-600">New Password</label>
                      <div className="relative">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          value={passwords.new}
                          onChange={(e) => setPasswords({...passwords, new: e.target.value})}
                          className="w-full rounded-lg border-0 bg-[#f1f5f9] py-2.5 pl-3 pr-10 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-[#1e293b]/20"
                        />
                        <button 
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showNewPassword ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Password Requirements */}
                  <div className="w-full md:w-[280px] bg-[#fafafa] p-5 rounded-xl border border-slate-100">
                    <h4 className="text-xs font-semibold text-slate-800 mb-3">Password Requirements</h4>
                    <ul className="space-y-2">
                      <li className="flex items-center gap-2 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        Minimum 12 characters
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        At least one special character
                      </li>
                      <li className="flex items-center gap-2 text-[11px] text-slate-500">
                        <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                        One uppercase & one number
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="px-5 py-2.5 bg-[#1e293b] text-white text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
                    Update Password
                  </button>
                </div>
              </div>
            </>
          )}

          {activeTab === "security" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-64 flex flex-col justify-center items-center text-slate-500">
              <Shield className="w-12 h-12 mb-3 text-slate-300" />
              <p>Security & Privacy settings coming soon.</p>
            </div>
          )}

          {activeTab === "notifications" && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100 h-64 flex flex-col justify-center items-center text-slate-500">
              <Bell className="w-12 h-12 mb-3 text-slate-300" />
              <p>Notification preferences coming soon.</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
