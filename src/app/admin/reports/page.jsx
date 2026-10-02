"use client";

import React, { useState, useEffect } from "react";
import { 
  getSalesReportApi, 
  getProductsReportApi, 
  getCustomersReportApi, 
  getInventoryReportApi, 
  getOrderStatusReportApi 
} from "../../../services/reportsApi";
import { FileText, Download, Loader2 } from "lucide-react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState("Sales");
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [selectedRange, setSelectedRange] = useState("30d"); // 7d, 30d, 90d, 1y

  const tabs = [
    { name: "Sales", fetcher: getSalesReportApi },
    { name: "Products", fetcher: getProductsReportApi },
    { name: "Customers", fetcher: getCustomersReportApi },
    { name: "Inventory", fetcher: getInventoryReportApi },
    { name: "Order Status", fetcher: getOrderStatusReportApi },
  ];

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      const activeTabObj = tabs.find(t => t.name === activeTab);
      if (activeTabObj) {
        const token = typeof window !== "undefined" ? sessionStorage.getItem("token") : null;
        const reqHeader = token ? { Authorization: `Token ${token}` } : {};

        const toDate = new Date();
        const fromDate = new Date();
        let groupBy = "day";
        if (selectedRange === "7d") fromDate.setDate(toDate.getDate() - 7);
        else if (selectedRange === "30d") fromDate.setDate(toDate.getDate() - 30);
        else if (selectedRange === "90d") { fromDate.setDate(toDate.getDate() - 90); groupBy = "week"; }
        else if (selectedRange === "1y") { fromDate.setFullYear(toDate.getFullYear() - 1); groupBy = "month"; }

        const dateFromStr = fromDate.toISOString().split("T")[0];
        const dateToStr = toDate.toISOString().split("T")[0];

        // Build tab-specific query parameters
        let ordering = "";
        if (activeTab === "Products") ordering = "-revenue";
        if (activeTab === "Customers") ordering = "-total_spent";

        const params = new URLSearchParams({
          date_from: dateFromStr,
          date_to: dateToStr,
        });

        if (activeTab === "Sales") params.append("group_by", groupBy);
        if (ordering) params.append("ordering", ordering);
        if (activeTab === "Inventory") params.append("low_stock_threshold", "10");

        const queryString = `?${params.toString()}`;

        const response = await activeTabObj.fetcher(reqHeader, queryString);
        if (response?.status === 200) {
          const data = response.data?.data || response.data || [];
          setReportData(Array.isArray(data) ? data : [data]);
        } else {
          setReportData([]);
        }
      }
    } catch (error) {
      console.error("Error fetching report data:", error);
      setReportData([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedRange]);

  const extractHeaders = (dataList) => {
    if (!dataList || dataList.length === 0) return [];
    return Object.keys(dataList[0]);
  };

  const headers = extractHeaders(reportData);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight flex items-center gap-2">
            <FileText className="w-8 h-8 text-[#2C3B5E]" />
            Reports
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Detailed tabular reports for your store operations.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select 
            value={selectedRange} 
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-sm outline-none"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
            <option value="1y">Last 1 Year</option>
          </select>
          <button className="flex items-center gap-2 text-sm font-bold text-[#2C3B5E] bg-white border border-[#2C3B5E]/20 px-5 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-sm">
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 bg-slate-100/50 p-1 rounded-xl w-max">
        {tabs.map((tab) => (
          <button
            key={tab.name}
            onClick={() => setActiveTab(tab.name)}
            className={`px-5 py-2 rounded-lg text-sm font-bold transition-all ${
              activeTab === tab.name
                ? "bg-white text-[#2C3B5E] shadow-sm"
                : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
            }`}
          >
            {tab.name}
          </button>
        ))}
      </div>

      {/* Sales Graph Section */}
      {activeTab === "Sales" && !isLoading && reportData.length > 0 && (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex flex-col">
          <h3 className="text-lg font-bold text-[#2C3B5E] mb-6">Sales Revenue Trend</h3>
          <div className="w-full h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={reportData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSalesRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2C3B5E" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#2C3B5E" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="revenue" stroke="#2C3B5E" strokeWidth={3} fillOpacity={1} fill="url(#colorSalesRev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Table Section */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2C3B5E]">{activeTab} Report Data</h3>
        </div>
        
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#2C3B5E]" />
          </div>
        ) : reportData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center p-12 text-slate-400 font-medium">
            No data available for the selected period.
          </div>
        ) : activeTab === "Order Status" ? (
          <div className="flex-1 p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
            {['by_order_status', 'by_payment_status', 'by_fulfillment_status'].map(statusKey => {
               const dataRow = reportData[0] || {};
               const statusData = dataRow[statusKey];
               if (!statusData) return null;
               
               const chartData = Object.entries(statusData).map(([k, v]) => ({
                 name: k.toUpperCase(),
                 count: v
               }));
               
               const title = statusKey.replace(/_/g, " ").replace("by ", "");

               return (
                 <div key={statusKey} className="flex flex-col h-[300px]">
                   <h4 className="text-sm font-bold text-slate-500 mb-4 uppercase tracking-wider text-center">{title}</h4>
                   <ResponsiveContainer width="100%" height="100%">
                     <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#94a3b8' }} angle={-30} textAnchor="end" interval={0} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                        <Tooltip 
                          cursor={{ fill: 'rgba(226, 232, 240, 0.4)' }} 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} 
                        />
                        <Bar dataKey="count" fill="#2C3B5E" radius={[4, 4, 0, 0]} maxBarSize={50} />
                     </BarChart>
                   </ResponsiveContainer>
                 </div>
               )
            })}
          </div>
        ) : (
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                  {headers.map((header) => (
                    <th key={header} className="py-4 px-6 whitespace-nowrap">
                      {header.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    {headers.map((header) => (
                      <td 
                        key={header} 
                        className="py-4 px-6 max-w-[200px] truncate"
                        title={typeof row[header] !== "object" ? String(row[header] ?? "") : ""}
                      >
                        {typeof row[header] === "object" && row[header] !== null ? (
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(row[header]).map(([key, value]) => (
                              <span key={key} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-extrabold bg-[#F8FAFC] text-[#475569] border border-[#E2E8F0] shadow-xs">
                                <span className="uppercase tracking-wide">{key}</span>
                                <span className="bg-[#2C3B5E] text-white px-2 py-0.5 rounded-full shadow-sm">{value}</span>
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="font-semibold">{String(row[header] ?? "-")}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
