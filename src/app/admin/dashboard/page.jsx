"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { 
  getDashboardOverviewApi, 
  getSalesAnalyticsApi, 
  getTopSellingProductsApi, 
  getTopCategoriesApi, 
  getRevenueOverviewApi, 
  getRecentOrdersApi 
} from "@/services/dashboardApi";
import { BASEURL } from "@/services/serverUrl";
import { 
  TrendingUp, 
  ShoppingBag, 
  ChevronDown, 
  Download, 
  TrendingDown,
  ArrowUpRight,
  Eye,
  X,
  RefreshCw,
  Package,
  Layers,
  CheckCircle2,
  Clock,
  AlertCircle
} from "lucide-react";

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState("Last 30 Days");
  const [salesPeriod, setSalesPeriod] = useState("Weekly");
  const [activePointIndex, setActivePointIndex] = useState(null);

  // API states
  const [overviewData, setOverviewData] = useState(null);
  const [salesData, setSalesData] = useState(null);
  const [topSellingProductsData, setTopSellingProductsData] = useState(null);
  const [topCategoriesData, setTopCategoriesData] = useState(null);
  const [revenueOverviewData, setRevenueOverviewData] = useState(null);
  const [recentOrdersData, setRecentOrdersData] = useState(null);

  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSalesLoading, setIsSalesLoading] = useState(false);
  const [isPeriodDropdownOpen, setIsPeriodDropdownOpen] = useState(false);
  const [isTopSellingModalOpen, setIsTopSellingModalOpen] = useState(false);

  // Helper to format image URLs
  const getImageUrl = (img) => {
    if (!img) return "/product1.png";
    if (img.startsWith("http://") || img.startsWith("https://")) return img;
    const cleanBase = BASEURL.endsWith("/") ? BASEURL.slice(0, -1) : BASEURL;
    const cleanImg = img.startsWith("/") ? img : `/${img}`;
    return `${cleanBase}${cleanImg}`;
  };

  // Helper to format currency
  const formatCurrency = (val) => {
    const num = Number(val) || 0;
    return `₹${num.toLocaleString("en-IN")}`;
  };

  // Fetch whole dashboard overview & components data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const rangeMap = {
        "Today": "today",
        "Last 7 Days": "7d",
        "Last 30 Days": "30d",
        "Last 90 Days": "90d",
        "Last 1 Year": "1y"
      };
      const range = rangeMap[selectedPeriod] || "30d";

      // 1. Overview KPI
      const overviewRes = await getDashboardOverviewApi(range);
      if (overviewRes?.status === 200) {
        setOverviewData(overviewRes.data?.data || overviewRes.data);
      }

      // 2. Top Selling Products
      const topSellingRes = await getTopSellingProductsApi(5);
      if (topSellingRes?.status === 200) {
        setTopSellingProductsData(topSellingRes.data?.data || topSellingRes.data || []);
      }

      // 3. Top Categories
      const topCategoriesRes = await getTopCategoriesApi();
      if (topCategoriesRes?.status === 200) {
        setTopCategoriesData(topCategoriesRes.data?.data || topCategoriesRes.data || []);
      }

      // 4. Revenue Overview
      const revenueRes = await getRevenueOverviewApi(7);
      if (revenueRes?.status === 200) {
        setRevenueOverviewData(revenueRes.data?.data || revenueRes.data || null);
      }

      // 5. Recent Orders
      const recentOrdersRes = await getRecentOrdersApi(10);
      if (recentOrdersRes?.status === 200) {
        setRecentOrdersData(recentOrdersRes.data?.data || recentOrdersRes.data || []);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch sales analytics specifically when salesPeriod changes
  const fetchSalesAnalytics = async (period) => {
    setIsSalesLoading(true);
    try {
      const res = await getSalesAnalyticsApi(period.toLowerCase());
      if (res?.status === 200) {
        setSalesData(res.data?.data || res.data);
      }
    } catch (err) {
      console.error("Error fetching sales analytics:", err);
    } finally {
      setIsSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod]);

  useEffect(() => {
    fetchSalesAnalytics(salesPeriod);
  }, [salesPeriod]);

  // KPI Stats Cards
  const stats = [
    {
      name: "TOTAL REVENUE",
      value: formatCurrency(overviewData?.total_revenue?.value),
      change: `${overviewData?.total_revenue?.change_percentage || 0}%`,
      changeType: (overviewData?.total_revenue?.change_percentage || 0) >= 0 ? "positive" : "negative",
      bgClass: "bg-pink-50",
      iconColor: "text-pink-500",
      iconText: "₹",
      badgeClass: "bg-pink-50 text-pink-600",
    },
    {
      name: "TODAY'S SALES",
      value: formatCurrency(overviewData?.today_sales?.value),
      change: `${overviewData?.today_sales?.change_percentage || 0}%`,
      changeType: (overviewData?.today_sales?.change_percentage || 0) >= 0 ? "positive" : "negative",
      bgClass: "bg-amber-50/70",
      iconColor: "text-amber-600",
      isTrendingIcon: true,
      badgeClass: "bg-amber-50 text-amber-600",
    },
    {
      name: "TOTAL PRODUCTS",
      value: overviewData?.total_products?.value !== undefined ? overviewData.total_products.value : "0",
      change: `${overviewData?.total_products?.change_percentage || 0}%`,
      changeType: (overviewData?.total_products?.change_percentage || 0) >= 0 ? "positive" : "negative",
      bgClass: "bg-emerald-50/70",
      iconColor: "text-emerald-600",
      isProductIcon: true,
      badgeClass: "bg-emerald-50 text-emerald-600",
      href: "/admin/products",
    },
    {
      name: "TOTAL ORDERS",
      value: overviewData?.total_orders?.value !== undefined ? overviewData.total_orders.value : "0",
      change: `${overviewData?.total_orders?.change_percentage || 0}%`,
      changeType: (overviewData?.total_orders?.change_percentage || 0) >= 0 ? "positive" : "negative",
      bgClass: "bg-[#EAE6D8]/40",
      iconColor: "text-[#8A8A68]",
      isProductIcon: true,
      badgeClass: "bg-[#EAE6D8]/50 text-[#8A8A68]",
      href: "/admin/orders",
    },
  ];

  // Dynamic SVG Points Calculation for Sales Analytics
  const { points, linePath, fillPath, labelsToRender } = useMemo(() => {
    const defaultLabels = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const labels = salesData?.labels?.length ? salesData.labels : defaultLabels;
    const rawRevenue = salesData?.revenue?.map((v) => Number(v) || 0) || [];
    const rawOrders = salesData?.orders?.map((v) => Number(v) || 0) || [];

    // Ensure we have values matching labels length
    const revenues = labels.map((_, i) => rawRevenue[i] || 0);
    const orders = labels.map((_, i) => rawOrders[i] || 0);

    const maxVal = Math.max(...revenues);
    const isAllZero = maxVal === 0;

    const computedPoints = revenues.map((val, idx) => {
      const x = labels.length > 1 ? 50 + (idx / (labels.length - 1)) * 600 : 350;
      // Real data positioning: 195 is the zero baseline, scales up to 50 for max
      const y = isAllZero ? 195 : 195 - (val / (maxVal || 1)) * 145;
      return {
        x: Math.round(x * 10) / 10,
        y: Math.round(y * 10) / 10,
        val,
        orders: orders[idx] || 0,
        label: labels[idx],
        idx,
      };
    });

    // Spline curve generator
    const getSvgPath = (pts) => {
      if (!pts.length) return "";
      if (pts.length === 1) return `M ${pts[0].x},${pts[0].y}`;
      let path = `M ${pts[0].x},${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i === 0 ? 0 : i - 1];
        const p1 = pts[i];
        const p2 = pts[i + 1];
        const p3 = pts[i + 2] || p2;

        const cp1x = p1.x + (p2.x - p0.x) / 6;
        const cp1y = p1.y + (p2.y - p0.y) / 6;
        const cp2x = p2.x - (p3.x - p1.x) / 6;
        const cp2y = p2.y - (p3.y - p1.y) / 6;

        path += ` C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`;
      }
      return path;
    };

    const lPath = getSvgPath(computedPoints);
    const fPath = computedPoints.length > 1
      ? `${lPath} L ${computedPoints[computedPoints.length - 1].x},200 L ${computedPoints[0].x},200 Z`
      : "";

    // Determine how many X-axis labels to show to prevent crowding
    const step = labels.length > 14 ? Math.ceil(labels.length / 7) : 1;
    const lRender = labels.map((label, idx) => ({
      label,
      idx,
      visible: idx % step === 0 || idx === labels.length - 1,
    }));

    return {
      points: computedPoints,
      linePath: lPath,
      fillPath: fPath,
      labelsToRender: lRender,
    };
  }, [salesData]);

  // Set default active point when points update
  useEffect(() => {
    if (points.length) {
      // Pick Friday (index 5) or highest value or middle
      const highestIdx = points.reduce((bestIdx, pt, i, arr) => (pt.val > arr[bestIdx].val ? i : bestIdx), 0);
      setActivePointIndex(points[highestIdx].val > 0 ? highestIdx : Math.min(4, points.length - 1));
    }
  }, [points]);

  const activePoint = activePointIndex !== null && points[activePointIndex] ? points[activePointIndex] : points[0];

  // Category Colors Palette
  const categoryColors = ["#2C3B5E", "#E28D75", "#48BB78", "#ED8936", "#9F7AEA", "#38B2AC"];

  // Formatted Top Selling Products
  const topSelling = useMemo(() => {
    if (!topSellingProductsData?.length) return [];
    return topSellingProductsData.map((item) => ({
      name: item.name || "Unknown Product",
      category: item.category || "General",
      sold: `${item.units_sold ?? item.sold_count ?? 0} Sold`,
      price: item.price ? `₹${item.price}` : "₹0",
      imgSrc: getImageUrl(item.image || item.imgSrc),
    }));
  }, [topSellingProductsData]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12 px-2">
      {/* Welcome & Overview Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Real-time business performance and sales analytics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Refresh Button */}
          <button
            onClick={() => {
              fetchDashboardData();
              fetchSalesAnalytics(salesPeriod);
            }}
            title="Refresh Dashboard"
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-[#2C3B5E]" : ""}`} />
          </button>

          {/* Period Filter Dropdown */}
          <div className="relative">
            <button 
              onClick={() => setIsPeriodDropdownOpen(!isPeriodDropdownOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span>{selectedPeriod}</span>
              <ChevronDown className={`w-4 h-4 text-slate-500 transition-transform ${isPeriodDropdownOpen ? "rotate-180" : ""}`} />
            </button>
            {isPeriodDropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 bg-white border border-slate-200 rounded-xl shadow-lg z-50 overflow-hidden">
                {["Today", "Last 7 Days", "Last 30 Days", "Last 90 Days", "Last 1 Year"].map((period) => (
                  <button
                    key={period}
                    onClick={() => {
                      setSelectedPeriod(period);
                      setIsPeriodDropdownOpen(false);
                    }}
                    className={`block w-full text-left px-4 py-2.5 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedPeriod === period ? "text-[#2C3B5E] bg-slate-50 font-bold" : "text-slate-600"
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report Button */}
          <Link
            href="/admin/reports"
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </Link>
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, idx) => {
          const CardContainer = stat.href ? Link : "div";
          const containerProps = stat.href ? { href: stat.href } : {};
          return (
            <CardContainer
              key={idx}
              {...containerProps}
              className={`relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-6 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200 ${
                stat.href ? "cursor-pointer hover:border-[#2C3B5E]/30" : ""
              }`}
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

              {/* Watermark */}
              <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none transform translate-x-4 translate-y-4">
                <TrendingUp className="w-24 h-24 text-slate-900" />
              </div>
            </CardContainer>
          );
        })}
      </div>

      {/* Mid Section: Sales Analytics & Top Selling */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Analytics Chart */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#2C3B5E]">Sales Analytics</h3>
                {isSalesLoading && (
                  <span className="text-xs text-slate-400 animate-pulse">Loading...</span>
                )}
              </div>
              <p className="text-xs font-medium text-slate-400 mt-0.5">
                Performance over the last selected period
              </p>
            </div>

            {/* Daily, Weekly, Monthly, Yearly Tabs */}
            <div className="bg-slate-100 p-1 rounded-xl flex gap-1 select-none self-start sm:self-auto">
              {["Daily", "Weekly", "Monthly", "Yearly"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSalesPeriod(tab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    salesPeriod === tab
                      ? "bg-white text-[#2C3B5E] shadow-xs"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Active Data Summary Pill */}
          {activePoint && (
            <div className="flex items-center gap-4 text-xs font-semibold px-2 py-1 text-slate-500 mb-1">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-2 h-2 rounded-full bg-[#2C3B5E]" />
                <strong>{activePoint.label}:</strong>
              </span>
              <span className="text-[#2C3B5E] font-bold">
                Revenue: {formatCurrency(activePoint.val)}
              </span>
              <span className="text-slate-400 font-medium">
                Orders: {activePoint.orders}
              </span>
            </div>
          )}

          {/* Dynamic SVG Line Chart */}
          <div className="relative w-full h-64 mt-2">
            <svg 
              className="w-full h-full overflow-visible" 
              viewBox="0 0 700 240" 
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2C3B5E" stopOpacity="0.18" />
                  <stop offset="100%" stopColor="#2C3B5E" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Bottom Horizontal Baseline */}
              <line x1="50" y1="200" x2="650" y2="200" stroke="#F1F5F9" strokeWidth="2" />

              {/* Vertical Guide & Intersection Dot on Active Point */}
              {activePoint && (
                <>
                  <line 
                    x1={activePoint.x} 
                    y1="20" 
                    x2={activePoint.x} 
                    y2="200" 
                    stroke="#CBD5E1" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 4" 
                  />
                  <circle cx={activePoint.x} cy={activePoint.y} r="9" fill="#2C3B5E" fillOpacity="0.15" />
                  <circle cx={activePoint.x} cy={activePoint.y} r="5" fill="#2C3B5E" stroke="#FFFFFF" strokeWidth="2" />
                </>
              )}

              {/* Gradient Fill under Curve */}
              {fillPath && (
                <path d={fillPath} fill="url(#chartGrad)" />
              )}

              {/* Main Line Curve */}
              {linePath && (
                <path
                  d={linePath}
                  fill="none"
                  stroke="#2C3B5E"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              )}

              {/* Interactive Hover Hotspots for all points */}
              {points.map((pt, idx) => (
                <g 
                  key={idx} 
                  className="cursor-pointer" 
                  onMouseEnter={() => setActivePointIndex(idx)}
                  onClick={() => setActivePointIndex(idx)}
                >
                  <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />
                  {activePointIndex === idx && (
                    <circle cx={pt.x} cy={pt.y} r="4" fill="#2C3B5E" />
                  )}
                </g>
              ))}
            </svg>

            {/* Labels under X axis */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-400 px-4 mt-2 select-none">
              {labelsToRender.map(({ label, idx, visible }) => (
                <span 
                  key={idx} 
                  className={`text-center cursor-pointer transition-colors ${
                    !visible ? "invisible" : ""
                  } ${activePointIndex === idx ? "text-[#2C3B5E] font-bold" : "hover:text-slate-600"}`}
                  onClick={() => setActivePointIndex(idx)}
                >
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Top Selling Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-[#2C3B5E]">Top Selling</h3>
            <button 
              onClick={() => setIsTopSellingModalOpen(true)}
              className="text-xs font-bold text-[#2C3B5E] hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>
          <div className="space-y-4 flex-1 flex flex-col justify-center">
            {topSelling.length === 0 ? (
              <p className="text-slate-400 text-sm font-medium text-center">No products found.</p>
            ) : topSelling.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                    <img
                      src={item.imgSrc}
                      alt={item.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.className = "w-12 h-12 rounded-xl bg-gradient-to-tr from-pink-100 to-amber-100 flex items-center justify-center font-bold text-xs text-slate-700";
                        e.target.parentNode.innerText = item.name.split(" ").map(n => n[0]).join("");
                      }}
                    />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[170px]">
                      {item.name}
                    </h4>
                    <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-[170px]">
                      {item.category} • {item.sold}
                    </p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-slate-800 shrink-0 ml-2">
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
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Category distribution across orders and active catalog
            </p>
          </div>

          <div className="flex flex-col justify-center gap-4 py-2">
            {topCategoriesData?.length > 0 ? (
              <div className="space-y-4 font-semibold text-sm text-slate-600 w-full px-2">
                {/* Visual Distribution Bar */}
                <div className="w-full h-3 rounded-full bg-slate-100 overflow-hidden flex shadow-inner">
                  {topCategoriesData.map((cat, idx) => (
                    <div 
                      key={idx}
                      style={{ 
                        width: `${cat.percentage || 10}%`,
                        backgroundColor: categoryColors[idx % categoryColors.length]
                      }}
                      title={`${cat.name}: ${cat.percentage}%`}
                    />
                  ))}
                </div>

                {/* Categories List */}
                <div className="space-y-3 pt-2">
                  {topCategoriesData.map((cat, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-3.5 h-3.5 rounded-full shrink-0" 
                          style={{ backgroundColor: categoryColors[idx % categoryColors.length] }} 
                        />
                        <span className="font-bold text-slate-700">{cat.name || cat.category}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {cat.revenue > 0 && (
                          <span className="text-xs text-slate-400 font-medium">
                            {formatCurrency(cat.revenue)}
                          </span>
                        )}
                        <strong className="text-slate-800">{cat.percentage || 0}%</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="text-slate-400 text-sm font-medium text-center w-full py-8">
                No category data available.
              </p>
            )}
          </div>
        </div>

        {/* Revenue Overview Bar Chart Card */}
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col justify-between">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-[#2C3B5E]">Revenue Overview</h3>
            <p className="text-xs font-medium text-slate-400 mt-0.5">
              Monthly revenue trend across all product sales
            </p>
          </div>
          
          {/* Custom Bar Chart */}
          <div className="flex items-end justify-between h-44 px-3 mt-2 border-b border-slate-100 pb-2">
            {revenueOverviewData?.labels?.length > 0 ? (
              revenueOverviewData.labels.map((label, idx) => {
                const val = Number(revenueOverviewData.data?.[idx]) || 0;
                const maxVal = Math.max(...(revenueOverviewData.data?.map(Number) || [0]), 1);
                const heightPercent = maxVal > 0 && val > 0 ? Math.max(15, (val / maxVal) * 100) : 10;
                
                return (
                  <div key={idx} className="flex flex-col items-center gap-2 flex-1 mx-1.5 group relative">
                    {/* Tooltip on Hover */}
                    <div className="absolute -top-9 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-[10px] font-bold py-1 px-2 rounded shadow-md pointer-events-none whitespace-nowrap z-10">
                      {formatCurrency(val)}
                    </div>

                    <div 
                      style={{ height: `${heightPercent}%` }} 
                      className={`w-full max-w-[36px] rounded-t-xl transition-all duration-300 ${
                        val > 0 
                          ? "bg-[#2C3B5E] hover:bg-[#1E2A47]" 
                          : "bg-slate-200/80 hover:bg-slate-300"
                      }`}
                    />
                    <span className="text-[11px] font-semibold text-slate-400 mt-1">
                      {label}
                    </span>
                  </div>
                );
              })
            ) : (
              <p className="text-slate-400 text-sm font-medium w-full text-center py-8">
                No revenue data available.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-50">
          <div>
            <h3 className="text-lg font-bold text-[#2C3B5E]">Recent Orders</h3>
            <p className="text-xs text-slate-400 mt-0.5">Latest transactions from your store</p>
          </div>
          <Link
            href="/admin/orders"
            className="flex items-center gap-2 text-xs font-bold text-[#2C3B5E] hover:underline cursor-pointer"
          >
            <span>View All Orders</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                <th className="py-4.5 px-6">Order ID</th>
                <th className="py-4.5 px-6">Customer</th>
                <th className="py-4.5 px-6">Amount</th>
                <th className="py-4.5 px-6">Order Status</th>
                <th className="py-4.5 px-6">Payment</th>
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {recentOrdersData?.length > 0 ? (
                recentOrdersData.map((order, idx) => {
                  const customerName = order.customer_name || order.customer || "Guest Customer";
                  const customerEmail = order.customer_email || order.email || "";
                  const orderNum = order.order_number || `#${String(order.id).slice(0, 8)}`;
                  const status = (order.status || "PENDING").toUpperCase();
                  const payment = (order.payment_status || "PENDING").toUpperCase();

                  const statusStyles = {
                    DELIVERED: "bg-emerald-50 text-emerald-700 border border-emerald-100",
                    SHIPPED: "bg-blue-50 text-blue-700 border border-blue-100",
                    PROCESSING: "bg-indigo-50 text-indigo-700 border border-indigo-100",
                    PENDING: "bg-amber-50 text-amber-700 border border-amber-100",
                    CANCELLED: "bg-rose-50 text-rose-700 border border-rose-100",
                  };

                  const paymentStyles = {
                    PAID: "text-emerald-600 font-bold",
                    PENDING: "text-amber-600 font-semibold",
                    FAILED: "text-rose-600 font-semibold",
                    REFUNDED: "text-purple-600 font-semibold",
                  };

                  const formattedDate = order.created_at 
                    ? new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric"
                      })
                    : "-";

                  return (
                    <tr key={order.id || idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4.5 px-6 font-bold text-[#2C3B5E]">
                        {orderNum}
                      </td>
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-[#E6E6D8] text-[#808060] shrink-0">
                            {customerName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <span className="block font-bold text-slate-800 tracking-tight">
                              {customerName}
                            </span>
                            {customerEmail && (
                              <span className="block text-xs text-slate-400 font-medium">
                                {customerEmail}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4.5 px-6 font-extrabold text-slate-800">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          statusStyles[status] || "bg-slate-100 text-slate-700"
                        }`}>
                          {status}
                        </span>
                      </td>
                      <td className={`py-4.5 px-6 text-xs uppercase ${paymentStyles[payment] || "text-slate-500"}`}>
                        {payment}
                      </td>
                      <td className="py-4.5 px-6 text-slate-500 text-xs font-medium">
                        {formattedDate}
                      </td>
                      <td className="py-4.5 px-6 text-center">
                        <Link 
                          href="/admin/orders" 
                          className="inline-flex text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 text-sm">
                    No recent orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
          <span>
            Showing {recentOrdersData?.length || 0} of {overviewData?.total_orders?.value || recentOrdersData?.length || 0} orders
          </span>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-[#2C3B5E] hover:underline"
          >
            Go to Orders Management &rarr;
          </Link>
        </div>
      </div>

      {/* Top Selling Modal */}
      {isTopSellingModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <h2 className="text-lg font-bold text-[#2C3B5E]">All Top Selling Products</h2>
              <button 
                onClick={() => setIsTopSellingModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              {topSelling.map((item, index) => (
                <div key={index} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-xl bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center shrink-0">
                      <img
                        src={item.imgSrc}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentNode.className = "w-14 h-14 rounded-xl bg-gradient-to-tr from-pink-100 to-amber-100 flex items-center justify-center font-bold text-xs text-slate-700";
                          e.target.parentNode.innerText = item.name.split(" ").map(n => n[0]).join("");
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-bold text-slate-800 tracking-tight truncate max-w-[200px]">
                        {item.name}
                      </h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5 truncate max-w-[200px]">
                        {item.category} • {item.sold}
                      </p>
                    </div>
                  </div>
                  <span className="text-sm font-extrabold text-slate-800 shrink-0 ml-4">
                    {item.price}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
