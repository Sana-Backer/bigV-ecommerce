"use client";

import React, { useState, useEffect } from "react";
import { 
  getRevenueTrendAnalyticsApi, 
  getCategoryPerformanceAnalyticsApi, 
  getCustomerGrowthAnalyticsApi, 
  getAverageOrderValueAnalyticsApi 
} from "../../../services/analyticsApi";
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { LineChart as LineChartIcon, Loader2 } from "lucide-react";

export default function AnalyticsPage() {
  const [selectedRange, setSelectedRange] = useState("30d");
  const [isLoading, setIsLoading] = useState(true);
  
  const [revenueData, setRevenueData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [aovData, setAovData] = useState([]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
        const reqHeader = token ? { Authorization: `Token ${token}` } : {};

        let period = "daily";
        const toDate = new Date();
        const fromDate = new Date();
        if (selectedRange === "7d") { fromDate.setDate(toDate.getDate() - 7); period = "daily"; }
        else if (selectedRange === "30d") { fromDate.setDate(toDate.getDate() - 30); period = "daily"; }
        else if (selectedRange === "90d") { fromDate.setDate(toDate.getDate() - 90); period = "weekly"; }
        else if (selectedRange === "1y") { fromDate.setFullYear(toDate.getFullYear() - 1); period = "monthly"; }

        const dateFromStr = fromDate.toISOString().split("T")[0];
        const dateToStr = toDate.toISOString().split("T")[0];

        const periodQuery = `?period=${period}`;
        const dateQuery = `?date_from=${dateFromStr}&date_to=${dateToStr}`;
        
        // Fetch all analytics data concurrently
        const [revRes, catRes, custRes, aovRes] = await Promise.allSettled([
          getRevenueTrendAnalyticsApi(reqHeader, periodQuery),
          getCategoryPerformanceAnalyticsApi(reqHeader, dateQuery),
          getCustomerGrowthAnalyticsApi(reqHeader, periodQuery),
          getAverageOrderValueAnalyticsApi(reqHeader, periodQuery)
        ]);

        if (revRes.status === "fulfilled" && revRes.value?.status === 200) {
          const raw = revRes.value.data?.data || revRes.value.data;
          if (raw && raw.labels) {
            setRevenueData(raw.labels.map((l, i) => ({ label: l, revenue: raw.revenue?.[i] || 0 })));
          } else {
            setRevenueData([]);
          }
        } else { setRevenueData([]); }

        if (catRes.status === "fulfilled" && catRes.value?.status === 200) {
          const raw = catRes.value.data?.data || catRes.value.data;
          setCategoryData(Array.isArray(raw) ? raw : []);
        } else { setCategoryData([]); }

        if (custRes.status === "fulfilled" && custRes.value?.status === 200) {
          const raw = custRes.value.data?.data || custRes.value.data;
          if (raw && raw.labels) {
            setCustomerData(raw.labels.map((l, i) => ({ label: l, new_customers: raw.new_customers?.[i] || 0 })));
          } else {
            setCustomerData([]);
          }
        } else { setCustomerData([]); }

        if (aovRes.status === "fulfilled" && aovRes.value?.status === 200) {
          const raw = aovRes.value.data?.data || aovRes.value.data;
          if (raw && raw.labels) {
            setAovData(raw.labels.map((l, i) => ({ label: l, aov: raw.average_order_value?.[i] || 0 })));
          } else {
            setAovData([]);
          }
        } else { setAovData([]); }

      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnalytics();
  }, [selectedRange]);

  const COLORS = ['#2C3B5E', '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

  const actualRevenue = revenueData;
  const actualCategory = categoryData;
  const actualCustomer = customerData;
  const actualAov = aovData;

  const CustomTooltip = ({ active, payload, label, prefix = "" }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-xl border border-slate-100 p-4 rounded-2xl shadow-xl shadow-slate-200/60 min-w-[160px]">
          <p className="text-slate-400 font-extrabold text-[10px] uppercase tracking-widest mb-3">{label}</p>
          {payload.map((entry, index) => (
            <div key={index} className="flex items-center justify-between gap-6 mt-1.5">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full shadow-sm" style={{ backgroundColor: entry.color || entry.fill || "#2C3B5E" }} />
                <span className="text-slate-600 font-bold text-xs capitalize">{entry.name?.replace("_", " ")}</span>
              </div>
              <span className="font-extrabold text-[#2C3B5E] text-sm tracking-tight">{prefix}{Number(entry.value).toLocaleString()}</span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  const EmptyState = ({ title }) => (
    <div className="flex-1 w-full flex flex-col items-center justify-center min-h-[280px]">
      <LineChartIcon className="w-12 h-12 text-slate-100 mb-3" />
      <p className="text-sm font-bold text-slate-400">No {title.toLowerCase()} data available</p>
      <p className="text-xs font-medium text-slate-300 mt-1">for the selected time period.</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight flex items-center gap-2">
            <LineChartIcon className="w-8 h-8 text-[#2C3B5E]" />
            Analytics Overview
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Visual representations of key store performance metrics.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRange} 
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm outline-none cursor-pointer"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 1 Year</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex h-[400px] items-center justify-center">
          <Loader2 className="w-10 h-10 animate-spin text-[#2C3B5E]" />
        </div>
      ) : (
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          
          {/* Revenue Trend Area Chart */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col group min-h-[350px]">
            <h3 className="text-lg font-bold text-[#2C3B5E] mb-2">Revenue Trend</h3>
            {actualRevenue.length === 0 ? (
              <EmptyState title="Revenue" />
            ) : (
              <div className="flex-1 w-full flex flex-col justify-end">
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={actualRevenue} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2C3B5E" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#2C3B5E" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} minTickGap={30} />
                    <YAxis hide={true} domain={[0, dataMax => (dataMax === 0 ? 100 : 'auto')]} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2C3B5E" strokeWidth={3.5} fillOpacity={1} fill="url(#colorValue)" activeDot={{ r: 6, fill: "#2C3B5E", stroke: "#fff", strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Category Performance Pie Chart */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col group min-h-[350px]">
            <h3 className="text-lg font-bold text-[#2C3B5E] mb-2">Category Performance</h3>
            {actualCategory.length === 0 ? (
              <EmptyState title="Category" />
            ) : (
              <div className="flex-1 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie
                      data={actualCategory}
                      cx="50%"
                      cy="45%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={6}
                      dataKey="revenue"
                      nameKey="name"
                      stroke="none"
                    >
                      {actualCategory.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip prefix="₹" />} />
                    <Legend verticalAlign="bottom" height={30} iconType="circle" wrapperStyle={{ fontSize: '11px', fontWeight: 600, color: '#64748B' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Customer Growth Bar Chart */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col group min-h-[350px]">
            <h3 className="text-lg font-bold text-[#2C3B5E] mb-2">Customer Growth</h3>
            {actualCustomer.length === 0 ? (
              <EmptyState title="Customer" />
            ) : (
              <div className="flex-1 w-full flex flex-col justify-end">
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={actualCustomer} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} minTickGap={30} />
                    <YAxis hide={true} domain={[0, dataMax => (dataMax === 0 ? 10 : 'auto')]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#F8FAFC' }} />
                    <Bar dataKey="new_customers" name="New Customers" fill="#3B82F6" radius={[6, 6, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Average Order Value Line Chart */}
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col group min-h-[350px]">
            <h3 className="text-lg font-bold text-[#2C3B5E] mb-2">Average Order Value (AOV)</h3>
            {actualAov.length === 0 ? (
              <EmptyState title="AOV" />
            ) : (
              <div className="flex-1 w-full flex flex-col justify-end">
                <ResponsiveContainer width="100%" height={280}>
                  <LineChart data={actualAov} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                    <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} dy={10} minTickGap={30} />
                    <YAxis hide={true} domain={[0, dataMax => (dataMax === 0 ? 100 : 'auto')]} />
                    <Tooltip content={<CustomTooltip prefix="₹" />} cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line type="monotone" dataKey="aov" name="AOV" stroke="#10B981" strokeWidth={3.5} dot={{ r: 0 }} activeDot={{ r: 6, fill: "#10B981", stroke: "#fff", strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
