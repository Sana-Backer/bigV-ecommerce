"use client";
import React, { useState, useEffect, Suspense } from "react";
import { getMeApi } from "@/services/auth";
import { Loader2, User, MapPin, Package, LogOut } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import ProfileTab from "./components/ProfileTab";
import AddressTab from "./components/AddressTab";
import OrdersTab from "./components/OrdersTab";
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
      <div className="max-w-7xl mx-auto px-6 pt-15">

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-serif text-[#2C332E] mb-2">My Account</h1>
          <p className="text-[#5A635B]">Welcome back, {user.first_name || user.email}!</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">

          {/* Sidebar */}
          <div className="md:col-span-3 space-y-2">
            <button
              onClick={() => setActiveTab("profile")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-left ${activeTab === "profile"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <User size={20} />
              Profile Details
            </button>
            <button
              onClick={() => setActiveTab("addresses")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-left ${activeTab === "addresses"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <MapPin size={20} />
              Saved Addresses
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-left ${activeTab === "orders"
                ? "bg-[#2C332E] text-white shadow-lg"
                : "text-[#5A635B] hover:bg-white hover:shadow-sm"
                }`}
            >
              <Package size={20} />
              Order History
            </button>

            <div className="pt-6 mt-6 border-t border-[#E6E4DD]">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all font-bold text-left text-rose-500 hover:bg-rose-50"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="md:col-span-9">
            {activeTab === "profile" && <ProfileTab user={user} fetchUser={fetchUser} />}
            {activeTab === "addresses" && <AddressTab />}
            {activeTab === "orders" && <OrdersTab />}
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
