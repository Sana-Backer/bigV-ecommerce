"use client";

import React, { useState, useEffect } from "react";
import { 
  Search, 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  X,
  RefreshCcw
} from "lucide-react";
import { 
  getAdminPaymentsApi, 
  getAdminPaymentDetailApi 
} from "@/services/paymentsApi";

export default function RefundsManagement() {
  const [activeTab, setActiveTab] = useState("All Refunds");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [payments, setPayments] = useState([]);

  // Fetch real payments from API
  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        const allResponse = await getAdminPaymentsApi();
        
        if (allResponse && allResponse.status === 200) {
          const fetchedPayments = (allResponse.data?.data || allResponse.data?.results || []).map(p => {
            const d = new Date(p.created_at);
            const statusFormatted = p.status ? p.status.replace("_", " ").toUpperCase() : "UNKNOWN";
            
            return {
              id: p.id,
              order_number: p.order_number,
              amount: parseFloat(p.amount) || 0,
              refunded_amount: parseFloat(p.refunded_amount) || 0,
              status: statusFormatted,
              rawStatus: p.status,
              provider: p.provider,
              razorpay_payment_id: p.razorpay_payment_id || "N/A",
              razorpay_order_id: p.razorpay_order_id || "N/A",
              receipt: p.receipt || "",
              refundable_amount: p.refundable_amount,
              date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
            };
          });
          
          // Only show refunds by default on the Refunds page if we fetched all
          const refundTxns = fetchedPayments.filter(p => ["refunded", "partially_refunded"].includes(p.rawStatus));
          setPayments(refundTxns);
        }
      } catch (err) {
        console.error("Failed to fetch admin payments:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    // Search
    const matchesSearch = 
      payment.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.razorpay_payment_id?.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Tabs
    const matchesTab = 
      activeTab === "All Refunds" || 
      payment.status.toLowerCase() === activeTab.toLowerCase();
      
    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalEntries = filteredPayments.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage) || 1;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPayments = filteredPayments.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // View Payment Detail
  const handleViewPayment = async (payment) => {
    setSelectedPayment(payment);
    setIsDetailLoading(true);
    try {
      const response = await getAdminPaymentDetailApi(payment.id);
      if (response && response.status === 200) {
        const detailedPayment = response.data?.data || response.data;
        setSelectedPayment(prev => ({
          ...prev,
          ...detailedPayment
        }));
      }
    } catch (err) {
      console.error("Failed to fetch payment details:", err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  return (
    <div className="flex-1 bg-[#F8FAFC] p-8 h-screen overflow-y-auto no-scrollbar font-sans selection:bg-[#2C3B5E]/10">
      
      {/* Header section */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <h1 className="text-3xl font-black tracking-tight text-[#1E293B]">Refunds</h1>
            <div className="px-2.5 py-1 bg-[#E9F5FF] text-[#2C3B5E] text-xs font-extrabold rounded-full">
              {totalEntries} Total
            </div>
          </div>
          <p className="text-[#64748B] text-sm font-medium">Manage and track customer refunds</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-[0_4px_24px_rgba(0,0,0,0.02)] border border-slate-100 overflow-hidden">
        
        {/* Controls Bar */}
        <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          
          {/* Tabs */}
          <div className="flex bg-slate-200/50 p-1.5 rounded-xl w-fit">
            {["All Refunds", "Refunded", "Partially Refunded"].map((tab) => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-white text-[#2C3B5E] shadow-sm"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Search & Filter */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search order or payment ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-64 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#2C3B5E]/20 focus:border-[#2C3B5E]/30 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white border-b border-slate-100">
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Order No.</th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Date & Time</th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Refunded</th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider">Total Amount</th>
                <th className="py-4 px-6 text-xs font-extrabold text-slate-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400 font-medium">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <div className="w-6 h-6 border-2 border-slate-200 border-t-[#2C3B5E] rounded-full animate-spin"></div>
                      <p>Loading refunds...</p>
                    </div>
                  </td>
                </tr>
              ) : currentPayments.length > 0 ? (
                currentPayments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-slate-800">{payment.order_number}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{payment.razorpay_payment_id}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-700">{payment.date}</div>
                      <div className="text-[11px] text-slate-400 font-medium mt-0.5">{payment.time}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider border ${
                        payment.rawStatus === "refunded"
                          ? "bg-amber-50 text-amber-600 border-amber-100/50"
                          : "bg-orange-50 text-orange-600 border-orange-100/50"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-emerald-600">
                        ₹{payment.refunded_amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-700">
                        ₹{payment.amount.toFixed(2)}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleViewPayment(payment)}
                        className="p-2 text-slate-400 hover:text-[#2C3B5E] hover:bg-[#E9F5FF] rounded-lg transition-colors inline-flex"
                        title="View Details"
                      >
                        <Eye className="w-4.5 h-4.5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-400 gap-2">
                      <RefreshCcw className="w-8 h-8 opacity-20 mb-2" />
                      <p className="font-bold text-slate-500">No refunds found</p>
                      <p className="text-sm">Adjust your filters or search term</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {!isLoading && filteredPayments.length > 0 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <span className="text-xs font-bold text-slate-500">
              Showing <span className="text-slate-800">{indexOfFirstItem + 1}</span> to <span className="text-slate-800">{Math.min(indexOfLastItem, totalEntries)}</span> of <span className="text-slate-800">{totalEntries}</span> entries
            </span>
            <div className="flex gap-1.5">
              <button 
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-4.5 h-4.5" />
              </button>
              
              {/* Simple page numbers */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-8 h-8 rounded-lg text-xs font-extrabold transition-all ${
                    currentPage === page 
                      ? "bg-[#2C3B5E] text-white shadow-md shadow-[#2C3B5E]/20" 
                      : "text-slate-600 hover:bg-slate-200/50"
                  }`}
                >
                  {page}
                </button>
              ))}

              <button 
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-4.5 h-4.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Payment Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedPayment(null)}></div>
          
          <div className="relative w-full max-w-2xl max-h-[90vh] bg-white rounded-3xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-start justify-between bg-slate-50/50 shrink-0">
              <div>
                <div className="flex items-center gap-3 mb-1.5">
                  <h3 className="text-xl font-black text-slate-800">Refund Details</h3>
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                    selectedPayment.rawStatus === "refunded"
                      ? "bg-amber-100 text-amber-700"
                      : "bg-orange-100 text-orange-700"
                  }`}>
                    {selectedPayment.status}
                  </span>
                </div>
                <p className="text-sm font-medium text-slate-500">
                  Order <span className="font-bold text-slate-700">{selectedPayment.order_number}</span>
                </p>
              </div>
              <button 
                onClick={() => setSelectedPayment(null)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {isDetailLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="w-6 h-6 border-2 border-slate-200 border-t-[#2C3B5E] rounded-full animate-spin"></div>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Financial Summary */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Transaction Summary</h4>
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-sm flex flex-col gap-2">
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500">Original Amount:</span>
                          <span className="font-extrabold text-slate-800">₹{selectedPayment.amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="font-bold text-slate-500">Refunded Amount:</span>
                          <span className="font-extrabold text-emerald-600">₹{selectedPayment.refunded_amount?.toFixed(2)}</span>
                        </div>
                        {selectedPayment.refundable_amount !== undefined && (
                          <div className="flex justify-between border-t border-slate-100 pt-2 mt-1">
                            <span className="font-bold text-slate-500">Still Refundable:</span>
                            <span className="font-extrabold text-slate-800">₹{parseFloat(selectedPayment.refundable_amount).toFixed(2)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-3">
                      <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Technical Details</h4>
                      <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs flex flex-col justify-center gap-2">
                        <div>
                          <span className="block font-bold text-slate-500 mb-0.5">Payment ID</span>
                          <span className="font-medium text-slate-800">{selectedPayment.razorpay_payment_id || "N/A"}</span>
                        </div>
                        <div>
                          <span className="block font-bold text-slate-500 mb-0.5">Order ID</span>
                          <span className="font-medium text-slate-800">{selectedPayment.razorpay_order_id || "N/A"}</span>
                        </div>
                        {selectedPayment.receipt && (
                          <div>
                            <span className="block font-bold text-slate-500 mb-0.5">Receipt</span>
                            <span className="font-medium text-slate-800">{selectedPayment.receipt}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </>
              )}
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end">
              <button
                onClick={() => setSelectedPayment(null)}
                className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Close Details
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
