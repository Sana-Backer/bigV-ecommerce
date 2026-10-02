"use client";

import React, { useState } from "react";
import {
  Settings,
  Store,
  CreditCard,
  Truck,
  Lock,
  Save,
  CheckCircle,
  AlertCircle
} from "lucide-react";

export default function AdminSettings() {
  const [activeTab, setActiveTab] = useState("store");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null);

  // Form states
  const [storeSettings, setStoreSettings] = useState({
    storeName: "Lumora Skincare",
    contactEmail: "contact@lumora.com",
    contactPhone: "+1 (555) 123-4567",
    address: "123 Beauty Lane, Glow City, CA 90210",
    currency: "USD",
  });

  const [paymentSettings, setPaymentSettings] = useState({
    stripePublicKey: "pk_test_1234567890",
    stripeSecretKey: "sk_test_1234567890",
    paypalClientId: "Afk_test_1234567890",
  });

  const [shippingSettings, setShippingSettings] = useState({
    flatRate: "15.00",
    freeShippingThreshold: "100.00",
    shippingMethods: "Standard, Express",
  });

  const [securitySettings, setSecuritySettings] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const handleSave = (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus(null);
    
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      setSaveStatus("success");
      
      // Clear security fields after save
      if (activeTab === "security") {
        setSecuritySettings({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      }

      setTimeout(() => setSaveStatus(null), 3000);
    }, 1000);
  };

  const tabs = [
    { id: "store", label: "Store Details", icon: Store },
    { id: "payment", label: "Payment Gateways", icon: CreditCard },
    { id: "shipping", label: "Shipping Info", icon: Truck },
    { id: "security", label: "Security", icon: Lock },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[#553C9A]/10 rounded-lg text-[#553C9A]">
            <Settings className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-[#553C9A] tracking-tight">
            Settings
          </h1>
        </div>
        
        {saveStatus === "success" && (
          <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-4 py-2 rounded-lg text-sm font-medium animate-in fade-in slide-in-from-top-2">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-slate-50 border-r border-slate-100 p-6 flex flex-col gap-2 shrink-0">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 px-3">Configuration</h3>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  isActive 
                  ? "bg-[#553C9A] text-white shadow-md shadow-[#553C9A]/20" 
                  : "text-slate-600 hover:bg-slate-200/50 hover:text-slate-900"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Form Content */}
        <div className="flex-1 p-6 md:p-8">
          <form onSubmit={handleSave} className="max-w-2xl flex flex-col h-full">
            
            <div className="flex-1 space-y-6">
              {/* STORE DETAILS */}
              {activeTab === "store" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Store Details</h2>
                    <p className="text-sm text-slate-500 mt-1">Manage your public store information and contact details.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Store Name</label>
                      <input
                        type="text"
                        value={storeSettings.storeName}
                        onChange={(e) => setStoreSettings(prev => ({...prev, storeName: e.target.value}))}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Contact Email</label>
                        <input
                          type="email"
                          value={storeSettings.contactEmail}
                          onChange={(e) => setStoreSettings(prev => ({...prev, contactEmail: e.target.value}))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Contact Phone</label>
                        <input
                          type="text"
                          value={storeSettings.contactPhone}
                          onChange={(e) => setStoreSettings(prev => ({...prev, contactPhone: e.target.value}))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Business Address</label>
                      <textarea
                        rows={3}
                        value={storeSettings.address}
                        onChange={(e) => setStoreSettings(prev => ({...prev, address: e.target.value}))}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium resize-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Default Currency</label>
                      <select
                        value={storeSettings.currency}
                        onChange={(e) => setStoreSettings(prev => ({...prev, currency: e.target.value}))}
                        className="w-full md:w-1/2 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      >
                        <option value="USD">USD ($)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                        <option value="INR">INR (₹)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* PAYMENT GATEWAYS */}
              {activeTab === "payment" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Payment Gateways</h2>
                    <p className="text-sm text-slate-500 mt-1">Configure your Stripe and PayPal API keys.</p>
                  </div>
                  
                  <div className="space-y-6">
                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#6772E5]"></span>
                        Stripe Integration
                      </h4>
                      <div className="space-y-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Publishable Key</label>
                          <input
                            type="text"
                            value={paymentSettings.stripePublicKey}
                            onChange={(e) => setPaymentSettings(prev => ({...prev, stripePublicKey: e.target.value}))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium font-mono"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-slate-700">Secret Key</label>
                          <input
                            type="password"
                            value={paymentSettings.stripeSecretKey}
                            onChange={(e) => setPaymentSettings(prev => ({...prev, stripeSecretKey: e.target.value}))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-4">
                      <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#003087]"></span>
                        PayPal Integration
                      </h4>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Client ID</label>
                        <input
                          type="text"
                          value={paymentSettings.paypalClientId}
                          onChange={(e) => setPaymentSettings(prev => ({...prev, paypalClientId: e.target.value}))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium font-mono"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SHIPPING INFO */}
              {activeTab === "shipping" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Shipping Info</h2>
                    <p className="text-sm text-slate-500 mt-1">Set up base rates and conditions for delivery.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Standard Flat Rate</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            type="text"
                            value={shippingSettings.flatRate}
                            onChange={(e) => setShippingSettings(prev => ({...prev, flatRate: e.target.value}))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-700">Free Shipping Threshold</label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                          <input
                            type="text"
                            value={shippingSettings.freeShippingThreshold}
                            onChange={(e) => setShippingSettings(prev => ({...prev, freeShippingThreshold: e.target.value}))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-8 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Available Methods (Comma Separated)</label>
                      <input
                        type="text"
                        value={shippingSettings.shippingMethods}
                        onChange={(e) => setShippingSettings(prev => ({...prev, shippingMethods: e.target.value}))}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* SECURITY */}
              {activeTab === "security" && (
                <div className="space-y-6 animate-in fade-in">
                  <div>
                    <h2 className="text-xl font-bold text-slate-800">Security</h2>
                    <p className="text-sm text-slate-500 mt-1">Update your admin account password.</p>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Current Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={securitySettings.currentPassword}
                        onChange={(e) => setSecuritySettings(prev => ({...prev, currentPassword: e.target.value}))}
                        className="w-full md:w-2/3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={securitySettings.newPassword}
                        onChange={(e) => setSecuritySettings(prev => ({...prev, newPassword: e.target.value}))}
                        className="w-full md:w-2/3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700">Confirm New Password</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={securitySettings.confirmPassword}
                        onChange={(e) => setSecuritySettings(prev => ({...prev, confirmPassword: e.target.value}))}
                        className="w-full md:w-2/3 rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Form Footer Action */}
            <div className="pt-8 mt-auto border-t border-slate-100 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSaving}
                className="flex items-center gap-2 bg-[#553C9A] hover:bg-[#432F7A] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer shadow-md shadow-[#553C9A]/20"
              >
                {isSaving ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isSaving ? "Saving..." : "Save Settings"}
              </button>
            </div>

          </form>
        </div>

      </div>
    </div>
  );
}
