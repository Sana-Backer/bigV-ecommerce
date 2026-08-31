"use client";
import React, { useState, useEffect, Suspense } from "react";
import { getMeApi } from "@/services/auth";
import { Loader2, User, MapPin, Package, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileTab from "./components/ProfileTab";
import AddressTab from "./components/AddressTab";
import OrdersTab from "./components/OrdersTab";
import SecurityTab from "./components/SecurityTab";
import Link from "next/link";
import Navbar from "@/components/Navbar";

function AccountPageContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("profile");
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  useEffect(() => {
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  useEffect(() => {
    fetchUser();
  }, []);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const res = await getMeApi();
      if (res.status === 200) {
        setUser(res.data?.data || res.data);
      } else {
        router.push("/login");
      }
    } catch (err) {
      console.error("Error fetching user", err);
      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("customerToken");
    localStorage.removeItem("customerRefreshToken");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F4F0] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#2C332E]" size={48} />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F5F4F0] font-sans pb-20 ">
      <Navbar theme="light" />
      <div className="max-w-[1400px] mx-auto px-6 lg:px-10 pt-18">

        {/* Page Header */}
        <div className="mb-8 md:mb-10">
          <h1 className="text-3xl md:text-4xl font-serif text-[#2C332E] mb-2">My Account</h1>
          <p className="text-[#5A635B]">Welcome back, {user.first_name || user.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10">

          {/* Sidebar */}
          <div className="md:col-span-3 flex md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scroll-smooth snap-x [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setActiveTab("profile")}
              className={`shrink-0 md:w-full flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl transition-all font-bold text-left snap-start ${activeTab === "profile"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <User size={20} className="shrink-0" />
              <span className="whitespace-nowrap">Profile Details</span>
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`shrink-0 md:w-full flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl transition-all font-bold text-left snap-start ${activeTab === "addresses"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <MapPin size={20} className="shrink-0" />
              <span className="whitespace-nowrap">Saved Addresses</span>
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`shrink-0 md:w-full flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl transition-all font-bold text-left snap-start ${activeTab === "orders"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <Package size={20} className="shrink-0" />
              <span className="whitespace-nowrap">Order History</span>
            </button>
            <button
              onClick={() => setActiveTab("security")}
              className={`shrink-0 md:w-full flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl transition-all font-bold text-left snap-start ${activeTab === "security"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-shield shrink-0"><path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/></svg>
              <span className="whitespace-nowrap">Security</span>
            </button>

            <div className="md:pt-6 md:mt-6 md:border-t border-[#E6E4DD] shrink-0">
              <button
                onClick={handleLogout}
                className="shrink-0 md:w-full flex items-center gap-3 px-5 py-3 md:py-4 rounded-2xl transition-all font-bold text-left text-rose-500 hover:bg-rose-50 snap-start"
              >
                <LogOut size={20} className="shrink-0" />
                <span className="whitespace-nowrap">Sign Out</span>
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9">
            {activeTab === "profile" && <ProfileTab user={user} fetchUser={fetchUser} />}
            {activeTab === "addresses" && <AddressTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "security" && <SecurityTab />}
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F5F4F0] flex justify-center items-center">
        <Loader2 className="animate-spin text-[#2C332E]" size={48} />
      </div>
    }>
      <AccountPageContent />
    </Suspense>
  );
}
