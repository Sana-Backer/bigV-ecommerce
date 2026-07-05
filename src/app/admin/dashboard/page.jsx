"use client";

import React, { useState } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  ChevronDown, 
  Download, 
  TrendingDown,
  ArrowUpRight,
  Eye
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");

  const stats = [
    {
      name: "TOTAL REVENUE",
      value: "₹1,25,000",
      change: "+12.5%",
      changeType: "positive",
      bgClass: "bg-pink-50",
      iconColor: "text-pink-500",
      iconText: "₹",
      badgeClass: "bg-pink-50 text-pink-600",
    },
    {
      name: "TODAY'S SALES",
      value: "₹8,400",
      change: "+4.2%",
      changeType: "positive",
      bgClass: "bg-amber-50/70",
      iconColor: "text-amber-600",
      isTrendingIcon: true,
      badgeClass: "bg-amber-50 text-amber-600",
    },
    {
      name: "TOTAL PRODUCTS",
      value: "120",
      change: "+4%",
      changeType: "positive",
      bgClass: "bg-emerald-50/70",
      iconColor: "text-emerald-600",
      isProductIcon: true,
      badgeClass: "bg-emerald-50 text-emerald-600",
    },
    {
      name: "TOTAL OREDERS",
      value: "₹1,25,000",
      change: "-0%",
      changeType: "negative",
      bgClass: "bg-[#EAE6D8]/40",
      iconColor: "text-[#8A8A68]",
      isProductIcon: true,
      badgeClass: "bg-[#EAE6D8]/50 text-[#8A8A68]",
    },
  ];

  const topSelling = [
    {
      name: "Glow Essence Serum",
      category: "Serum",
      sold: "245 Sold",
      price: "₹24,500",
      imgSrc: "/product1.png", // Fallback to existing or placeholder
    },
    {
      name: "Velvet Night Cream",
      category: "Moisturizer",
      sold: "182 Sold",
      price: "₹18,200",
      imgSrc: "/product2.png",
    },
    {
      name: "Arctic Clay Mask",
      category: "Treatments",
      sold: "156 Sold",
      price: "₹12,480",
      imgSrc: "/category3.png",
    },
    {
      name: "Rosehip Bloom Oil",
      category: "Face Oils",
      sold: "120 Sold",
      price: "₹9,600",
      imgSrc: "/details-p1.png",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Welcome back, here's what's happening with Lumora today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Last 30 Days Dropdown */}
          <div className="relative">
            <button className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-xs">
              <span>{selectedPeriod}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
          </div>
          {/* Export Report Button */}
          <button className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer">
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          return (
            <div
              key={idx}
              className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200"
            >
              {/* Top Row: Icon on Left, Badge on Right */}
              <div className="flex items-center justify-between">
                <div className={`w-12 h-12 rounded-2xl ${stat.bgClass} flex items-center justify-center`}>
                  {stat.isTrendingIcon ? (
                    <TrendingUp className={`w-6 h-6 ${stat.iconColor}`} />
                  ) : stat.isProductIcon ? (
                    <ShoppingBag className={`w-5 h-5 ${stat.iconColor}`} />
                  ) : (
                    <span className={`text-xl font-bold ${stat.iconColor}`}>{stat.iconText}</span>
                  )}
                </div>
                <span className={`text-xs font-bold px-3 py-1 rounded-full ${stat.badgeClass}`}>
                  {stat.change}
                </span>
              </div>
              
              {/* Bottom Row: Name and Value */}
              <div className="mt-6 space-y-1">
                <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
                  {stat.name}
                </span>
                <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
                  {stat.value}
                </span>
              </div>

              {/* Dynamic Watermark Background lines */}
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
                <TrendingUp className="w-24 h-24 text-slate-900" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Mid Section: Sales Analytics & Top Selling */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Analytics Chart */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-[#2C3B5E]">Sales Analytics</h3>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Performance over the last selected period
              </p>
            </div>
            {/* Daily, Weekly, Monthly, Yearly Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 select-none">
              {["Daily", "Weekly", "Monthly", "Yearly"].map((tab) => (
                <button
                  key={tab}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    tab === "Weekly"
                      ? "bg-white text-[#2C3B5E] shadow-xs"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line Chart */}
          <div className="relative w-full h-64 mt-4">
            <svg className="w-full h-full" viewBox="0 0 700 240" preserveAspectRatio="none">
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2C3B5E" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#2C3B5E" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* Dotted Vertical Line for Friday (x=460) */}
              <line 
                x1="460" 
                y1="10" 
                x2="460" 
                y2="200" 
                stroke="#E2E8F0" 
                strokeWidth="2" 
                strokeDasharray="4 4" 
              />
              
              {/* Gradient Fill under the curve */}
              <path
                d="M 50,175 C 130,170 170,165 240,135 C 310,105 380,145 460,132 C 530,120 570,85 650,100 L 650,200 L 50,200 Z"
                fill="url(#chartGrad)"
              />

              {/* Main Curve Line */}
              <path
                d="M 50,175 C 130,170 170,165 240,135 C 310,105 380,145 460,132 C 530,120 570,85 650,100"
                fill="none"
                stroke="#2C3B5E"
                strokeWidth="3.5"
                strokeLinecap="round"
              />

              {/* Intersection Dot on Friday */}
              <circle cx="460" cy="132" r="5" fill="#2C3B5E" />
              
              {/* Bottom Horizontal Axis Line */}
              <line x1="50" y1="200" x2="650" y2="200" stroke="#F1F5F9" strokeWidth="2" />
            </svg>

            {/* Labels under X axis */}
            <div className="flex justify-between text-xs font-semibold text-slate-400 px-6 mt-2">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>

        {/* Top Selling Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#2C3B5E]">Top Selling</h3>
            <button className="text-xs font-bold text-[#2C3B5E] hover:underline">
              View All
            </button>
          </div>
          <div className="space-y-4.5 flex-1 flex flex-col justify-center">
            {topSelling.map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center">
                    <img
                      src={item.imgSrc}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        // Fallback visually if image doesn't exist
                        e.target.style.display = "none";
                        e.target.parentNode.className = "w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-100 to-amber-100 flex items-center justify-center font-bold text-xs text-slate-700";
                        e.target.parentNode.innerText = item.name.split(" ").map(n => n[0]).join("");
                      }}
                    />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight">
                      {item.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                      {item.category} • {item.sold}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-800">
                  {item.price}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Categories & Revenue Overview */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Top Categories Pie Chart Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#2C3B5E]">Top Categories</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-around gap-6 py-4">
            {/* Custom Pie Chart using SVG */}
            <div className="relative w-40 h-40">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
                {/* Kitchen: 25% (2c3b5e) -> starting offset 0, dash 30 (circumference = 120) */}
                {/* Powders: 15% (eae6d8) -> starting offset -30, dash 18 */}
                {/* Beauty: 60% (c4c59f) -> starting offset -48, dash 72 */}
                
                {/* Beauty Slice (60%): strokeDasharray="188.5 314" strokeDashoffset="0" */}
                <circle
                  cx="60"
                  cy="60"
                  r="30"
                  fill="transparent"
                  stroke="#C4C59F"
                  strokeWidth="60"
                  strokeDasharray="113.1 188.5"
                  strokeDashoffset="0"
                />
                {/* Kitchen Slice (25%): strokeDasharray="47.1 188.5" strokeDashoffset="-113.1" */}
                <circle
                  cx="60"
                  cy="60"
                  r="30"
                  fill="transparent"
                  stroke="#2C3B5E"
                  strokeWidth="60"
                  strokeDasharray="47.1 188.5"
                  strokeDashoffset="-113.1"
                />
                {/* Powders Slice (15%): strokeDasharray="28.3 188.5" strokeDashoffset="-160.2" */}
                <circle
                  cx="60"
                  cy="60"
                  r="30"
                  fill="transparent"
                  stroke="#EAE6D8"
                  strokeWidth="60"
                  strokeDasharray="28.3 188.5"
                  strokeDashoffset="-160.2"
                />
              </svg>
            </div>

            {/* Legend */}
            <div className="space-y-3 font-semibold text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#C4C59F]" />
                <span>Beauty <strong className="text-slate-800">60%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#2C3B5E]" />
                <span>Kitchen <strong className="text-slate-800">25%</strong></span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3.5 h-3.5 rounded-full bg-[#EAE6D8]" />
                <span>Powders <strong className="text-slate-800">15%</strong></span>
              </div>
            </div>
          </div>
        </div>

        {/* Revenue Overview Bar Chart Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#2C3B5E]">Revenue Overview</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Monthly sales performance across all categories
            </p>
          </div>
          
          {/* Custom Bar Chart representation */}
          <div className="flex items-end justify-between h-40 px-2 mt-4">
            {[75, 110, 85, 95, 130, 140, 160].map((height, idx) => (
              <div key={idx} className="flex flex-col items-center gap-2 flex-1 mx-2">
                <div 
                  style={{ height: `${height}px` }} 
                  className="w-full bg-[#E2E8F0]/80 rounded-t-xl hover:bg-[#CBD5E1] transition-all duration-300"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <h3 className="text-lg font-bold text-[#2C3B5E]">Recent Orders</h3>
          <button className="flex items-center gap-2 text-xs font-bold text-white bg-[#2C3B5E] px-4 py-2 rounded-xl hover:bg-[#1E2A47] transition-all cursor-pointer">
            <Download className="w-3.5 h-3.5" />
            <span>Export Data</span>
          </button>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                <th className="py-4.5 px-6">Order ID</th>
                <th className="py-4.5 px-6">Customer</th>
                <th className="py-4.5 px-6">Amount</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6">Payment</th>
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {[
                {
                  id: "#LMR-8921",
                  customer: "Ananya Kapoor",
                  avatar: "AK",
                  avatarBg: "bg-[#E6E6D8] text-[#808060]",
                  amount: "₹3,450",
                  status: "Delivered",
                  statusClass: "bg-[#DEF7EC] text-[#03543F]",
                  payment: "UPI",
                  date: "Oct 24, 2023",
                },
                {
                  id: "#LMR-8920",
                  customer: "Rohan Joshi",
                  avatar: "RJ",
                  avatarBg: "bg-[#FDE2E2] text-[#9B1C1C]",
                  amount: "₹1,200",
                  status: "Processing",
                  statusClass: "bg-[#E1EFFE] text-[#1E429F]",
                  payment: "Card",
                  date: "Oct 24, 2023",
                },
                {
                  id: "#LMR-8919",
                  customer: "Sanya Malhotra",
                  avatar: "SM",
                  avatarBg: "bg-[#E6E6D8] text-[#808060]",
                  amount: "₹4,800",
                  status: "Shipped",
                  statusClass: "bg-[#FDF6B2] text-[#723B13]",
                  payment: "Net Banking",
                  date: "Oct 23, 2023",
                },
                {
                  id: "#LMR-8918",
                  customer: "Vikram Singh",
                  avatar: "VS",
                  avatarBg: "bg-[#E1EFFE] text-[#1E429F]",
                  amount: "₹2,100",
                  status: "Cancelled",
                  statusClass: "bg-[#FDE2E2] text-[#9B1C1C]",
                  payment: "UPI",
                  date: "Oct 23, 2023",
                },
              ].map((order) => (
                <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4.5 px-6 font-bold text-[#8A5C5C]">{order.id}</td>
                  <td className="py-4.5 px-6">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${order.avatarBg}`}>
                        {order.avatar}
                      </div>
                      <span className="text-slate-800">{order.customer}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-slate-800">{order.amount}</td>
                  <td className="py-4.5 px-6">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${order.statusClass}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="py-4.5 px-6 text-slate-500">{order.payment}</td>
                  <td className="py-4.5 px-6 text-slate-500">
                    <div className="leading-tight">
                      <span>{order.date.split(",")[0]},</span>
                      <span className="block text-xs text-slate-400">{order.date.split(",")[1]?.trim()}</span>
                    </div>
                  </td>
                  <td className="py-4.5 px-6 text-center">
                    <button className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
                      <Eye className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
          <span>Showing 4 of 1,25,000 orders</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-50 cursor-pointer" disabled>
              &lt;
            </button>
            <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer">
              &gt;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

