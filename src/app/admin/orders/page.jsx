"use client";

import React, { useState, useEffect } from "react";
import {
  ShoppingBag,
  ShoppingCart,
  TrendingUp,
  TrendingDown,
  Box,
  Calendar,
  Download,
  Eye,
  MoreVertical,
  Search,
  X,
  CheckCircle2,
  Clock,
  Truck,
  XCircle,
  AlertCircle,
  CreditCard,
  User,
  MapPin,
  ChevronRight,
  ChevronDown,
  ChevronLeft
} from "lucide-react";
import { 
  getAdminOrdersApi, 
  updateOrderStatusApi, 
  updateOrderPaymentStatusApi,
  getAdminOrderDetailApi,
  updateOrderFulfillmentStatusApi,
  cancelAdminOrderApi
} from "@/services/ordersApi";

export default function OrderManagement() {
  const [activeTab, setActiveTab] = useState("All Orders");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDateRange, setSelectedDateRange] = useState("Last 30 Days");
  const [isDateDropdownOpen, setIsDateDropdownOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [orders, setOrders] = useState([]);

  // Fetch real orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      setIsLoading(true);
      try {
        const response = await getAdminOrdersApi();
         console.log(response);
        if (response && response.status === 200) {
          const fetchedOrders = (response.data?.data || response.data?.results || []).map(o => {
            const d = new Date(o.created_at);
            const name = o.customer_name || "Guest User";
            const avatar = name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase() || "GU";
            const statusFormatted = o.status ? o.status.charAt(0).toUpperCase() + o.status.slice(1).toLowerCase() : "Pending";
            
            return {
              id: o.order_number,
              realId: o.id,
              customer: {
                name: name,
                email: o.customer_email || "N/A",
                avatar: avatar,
                phone: o.customer_phone || "N/A",
                address: "View details for address"
              },
              products: [],
              rawProductCount: o.item_count || 0,
              payment: o.payment_status || "PENDING",
              status: statusFormatted,
              fulfillment: o.fulfillment_status ? o.fulfillment_status.charAt(0).toUpperCase() + o.fulfillment_status.slice(1).toLowerCase() : "Unfulfilled",
              date: d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
              time: d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true }),
              total: parseFloat(o.total_amount) || 0,
              paymentMethod: "N/A"
            };
          });
          setOrders(fetchedOrders);
         
          
        }
      } catch (err) {
        console.error("Failed to fetch admin orders:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  // Filters
  const dateRanges = ["Today", "Last 7 Days", "Last 30 Days", "All Time"];

  const filteredOrders = orders.filter(order => {
    // Search
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.email.toLowerCase().includes(searchTerm.toLowerCase());
      
    // Tabs
    const matchesTab = 
      activeTab === "All Orders" || 
      order.status.toLowerCase() === activeTab.toLowerCase();
      
    return matchesSearch && matchesTab;
  });

  // Pagination Logic
  const totalEntries = filteredOrders.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Change Status Handler
  const handleStatusChange = async (orderId, newStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.realId) return;
    
    try {
      const response = await updateOrderStatusApi(order.realId, { status: newStatus.toLowerCase() });
      if (response && response.status === 200) {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, status: newStatus } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        alert(response?.data?.message || "Invalid status transition.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update order status.");
    }
  };

  // Change Payment Status Handler
  const handlePaymentChange = async (orderId, newPaymentStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.realId) return;

    try {
      const response = await updateOrderPaymentStatusApi(order.realId, { payment_status: newPaymentStatus.toLowerCase() });
      if (response && response.status === 200) {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, payment: newPaymentStatus } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, payment: newPaymentStatus }));
        }
      } else {
        alert(response?.data?.message || "Invalid payment status transition.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update payment status.");
    }
  };

  // Change Fulfillment Status Handler
  const handleFulfillmentChange = async (orderId, newFulfillmentStatus) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.realId) return;

    try {
      const response = await updateOrderFulfillmentStatusApi(order.realId, { fulfillment_status: newFulfillmentStatus.toLowerCase() });
      if (response && response.status === 200) {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, fulfillment: newFulfillmentStatus } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, fulfillment: newFulfillmentStatus }));
        }
      } else {
        alert(response?.data?.message || "Invalid fulfillment status transition.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to update fulfillment status.");
    }
  };

  // Cancel Order Handler
  const handleCancelOrder = async (orderId) => {
    const order = orders.find(o => o.id === orderId);
    if (!order || !order.realId) return;
    
    if (!window.confirm("Are you sure you want to cancel this order?")) return;

    try {
      const response = await cancelAdminOrderApi(order.realId, { reason: "Cancelled by admin" });
      if (response && response.status === 200) {
        setOrders(prevOrders => 
          prevOrders.map(o => 
            o.id === orderId ? { ...o, status: "Cancelled" } : o
          )
        );
        if (selectedOrder && selectedOrder.id === orderId) {
          setSelectedOrder(prev => ({ ...prev, status: "Cancelled" }));
        }
      } else {
        alert(response?.data?.message || "Failed to cancel order.");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to cancel order.");
    }
  };

  // View Order Detail
  const handleViewOrder = async (order) => {
    setSelectedOrder(order); // Show modal immediately with list data
    if (order.realId) {
      setIsDetailLoading(true);
      try {
        const response = await getAdminOrderDetailApi(order.realId);
        if (response && response.status === 200) {
          const detailedOrder = response.data?.data || response.data;
          
          // Merge detailed data into selectedOrder
          setSelectedOrder(prev => {
            if (!prev || prev.id !== order.id) return prev;
            
            // Format address function to support both old and new field names
            const formatAddress = (addr) => {
              if (addr && typeof addr === 'object') {
                const parts = [
                  addr.line1 || addr.street_address_1,
                  addr.line2 || addr.street_address_2,
                  addr.city,
                  addr.state,
                  addr.postal_code || addr.pin_code,
                  addr.country
                ].filter(p => p && p.trim() !== '');
                if (parts.length > 0) {
                  return parts.join(", ");
                }
              }
              return "Address not provided";
            };
            
            const shippingAddressStr = formatAddress(detailedOrder.shipping_address_snapshot);
            const billingAddressStr = formatAddress(detailedOrder.billing_address_snapshot);

            // Format real products from detailedOrder.items
            let realOrderProducts = prev.products;
            if (detailedOrder.items && detailedOrder.items.length > 0) {
              realOrderProducts = detailedOrder.items.map(item => {
                let itemName = item.product_name || "Unknown Product";
                if (item.variant_name) itemName += ` - ${item.variant_name}`;
                return {
                  id: item.id,
                  name: itemName,
                  image: "/product1.png", // Assuming image is not returned in order items, fallback to placeholder
                  price: parseFloat(item.unit_price) || 0,
                  quantity: item.quantity || 1
                };
              });
            }

            // Extract payment method from notes if it exists
            let paymentMethod = "N/A";
            if (detailedOrder.notes && detailedOrder.notes.includes("Payment Method:")) {
              paymentMethod = detailedOrder.notes.split("Payment Method:")[1].trim();
            } else if (detailedOrder.notes) {
              paymentMethod = detailedOrder.notes;
            }

            return {
              ...prev,
              fulfillment: detailedOrder.fulfillment_status ? detailedOrder.fulfillment_status.charAt(0).toUpperCase() + detailedOrder.fulfillment_status.slice(1).toLowerCase() : "Unfulfilled",
              customer: {
                ...prev.customer,
                address: shippingAddressStr,
                billingAddress: billingAddressStr
              },
              products: realOrderProducts,
              paymentMethod: paymentMethod,
              notes: detailedOrder.notes || "",
              couponCode: detailedOrder.coupon_code || "",
              statusHistory: detailedOrder.status_history || [],
              isCancellable: detailedOrder.is_cancellable !== undefined ? detailedOrder.is_cancellable : true,
              subtotal: detailedOrder.subtotal ? parseFloat(detailedOrder.subtotal) : prev.total,
              shipping_amount: detailedOrder.shipping_amount ? parseFloat(detailedOrder.shipping_amount) : 0,
              tax_amount: detailedOrder.tax_amount ? parseFloat(detailedOrder.tax_amount) : 0,
              discount_amount: detailedOrder.discount_amount ? parseFloat(detailedOrder.discount_amount) : 0,
              total: detailedOrder.total_amount ? parseFloat(detailedOrder.total_amount) : prev.total,
            };
          });
        }
      } catch (err) {
        console.error("Failed to fetch order details", err);
      } finally {
        setIsDetailLoading(false);
      }
    }
  };

  // Export CSV Report Handler
  const handleExport = () => {
    const headers = ["Order ID", "Customer Name", "Customer Email", "Products Count", "Payment Status", "Order Status", "Date", "Total (INR)"];
    const rows = orders.map(o => [
      o.id,
      o.customer.name,
      o.customer.email,
      o.products.length || o.rawProductCount,
      o.payment,
      o.status,
      o.date,
      o.total.toFixed(2)
    ]);
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lumora_Orders_Report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats computation
  const totalRevenue = orders
    .filter(o => o.payment === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  const todaySales = orders
    .filter(o => o.date === "Oct 24, 2023" && o.payment === "PAID")
    .reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
      
      {/* Top Banner and Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Order Management
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Oversee and fulfill luxury orders across all Lumora Beauty channels.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Date range picker dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDateDropdownOpen(!isDateDropdownOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>{selectedDateRange}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {isDateDropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1.5">
                {dateRanges.map((range) => (
                  <button
                    key={range}
                    onClick={() => {
                      setSelectedDateRange(range);
                      setIsDateDropdownOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedDateRange === range ? "text-[#2C3B5E] bg-[#EAF5FF]/40" : "text-slate-600"
                    }`}
                  >
                    {range}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Export Report */}
          <button
            onClick={handleExport}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-1">
        <div className="flex gap-2">
          {["All Orders", "Pending", "Processing", "Shipped"].map((tab) => (
            <button
              key={tab}
              onClick={() => {
                setActiveTab(tab);
                setCurrentPage(1);
              }}
              className={`relative pb-3 text-sm font-bold transition-all px-2 cursor-pointer ${
                activeTab === tab
                  ? "text-[#2C3B5E]"
                  : "text-slate-400 hover:text-slate-600"
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2C3B5E] rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Revenue */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
              <span className="text-xl font-extrabold text-pink-500">₹</span>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-pink-50 text-pink-600">
              +12.5%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              TOTAL REVENUE
            </span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              ₹{totalRevenue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Today's Sales */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-amber-50/70 flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-amber-600" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-600">
              +4.2%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              TODAY'S SALES
            </span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              ₹{todaySales > 0 ? todaySales.toLocaleString() : "8,400"}
            </span>
          </div>
        </div>

        {/* Card 3: Total Products */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50/70 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-600">
              +4%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              TOTAL PRODUCTS
            </span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              120
            </span>
          </div>
        </div>

        {/* Card 4: Total Orders */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="w-12 h-12 rounded-2xl bg-[#EAE6D8]/40 flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-[#8A8A68]" />
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#EAE6D8]/50 text-[#8A8A68]">
              -0%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">
              TOTAL ORDERS
            </span>
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              1,284
            </span>
          </div>
        </div>
      </div>

      {/* Orders Table Container */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Table Controls (Search) */}
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Search orders by ID, customer name or email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] font-medium"
            />
          </div>
          <span className="text-xs text-slate-400 font-bold">
            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, totalEntries)} of {totalEntries} entries
          </span>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 py-4 px-6">
                <th className="py-4.5 px-6">Order #</th>
                <th className="py-4.5 px-6">Customer</th>
                <th className="py-4.5 px-6">Products</th>
                <th className="py-4.5 px-6">Payment</th>
                <th className="py-4.5 px-6">Order Status</th>
                <th className="py-4.5 px-6">Date</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {currentOrders.length > 0 ? (
                currentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-4.5 px-6">
                      <span className="text-[#2C3B5E] font-extrabold">{order.id}</span>
                    </td>

                    {/* Customer */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#EAF5FF] text-[#2C3B5E] flex items-center justify-center text-xs font-bold shrink-0 border border-[#EAF5FF]/60 shadow-inner">
                          {order.customer.avatar}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{order.customer.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{order.customer.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Product Count */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-2">
                        <div className="w-8.5 h-8.5 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center text-slate-400 shadow-sm shrink-0">
                          <ShoppingBag className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                          {order.rawProductCount} {order.rawProductCount === 1 ? 'Item' : 'Items'}
                        </span>
                      </div>
                    </td>

                    {/* Payment Status */}
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                        order.payment === "PAID"
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                        {order.payment}
                      </span>
                    </td>

                    {/* Order Status */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          order.status === "Pending" ? "bg-amber-400" :
                          order.status === "Processing" ? "bg-indigo-500" :
                          order.status === "Shipped" ? "bg-blue-400" :
                          order.status === "Delivered" ? "bg-emerald-500" : "bg-rose-500"
                        }`} />
                        <span className={`font-bold capitalize ${
                          order.status === "Pending" ? "text-amber-500" :
                          order.status === "Processing" ? "text-indigo-600" :
                          order.status === "Shipped" ? "text-blue-500" :
                          order.status === "Delivered" ? "text-emerald-600" : "text-rose-500"
                        }`}>{order.status}</span>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="py-4.5 px-6">
                      <div className="flex flex-col">
                        <span className="text-slate-600 font-bold text-xs">{order.date}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{order.time}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleViewOrder(order)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="View Order Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        <button className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer">
                          <MoreVertical className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-bold">No orders found matching filters</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="p-5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Prev</span>
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`w-7.5 h-7.5 rounded-lg text-xs font-bold flex items-center justify-center transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-[#2C3B5E] text-white shadow-md shadow-[#2C3B5E]/20"
                      : "text-slate-500 hover:bg-slate-100"
                  }`}
                >
                  {page}
                </button>
              ))}
            </div>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-700 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <ShoppingCart className="w-5.5 h-5.5 text-[#2C3B5E]" />
                <h2 className="text-lg font-bold text-[#2C3B5E]">Order Details {selectedOrder.id}</h2>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-700 text-left">
              
              {/* Top Overview: Status Dropdowns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Order Status</span>
                  <select 
                    value={selectedOrder.status}
                    onChange={(e) => handleStatusChange(selectedOrder.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none text-slate-700 focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out_for_delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Payment Status</span>
                  <select
                    value={selectedOrder.payment}
                    onChange={(e) => handlePaymentChange(selectedOrder.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none text-slate-700 focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] cursor-pointer"
                  >
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Fulfillment Status</span>
                  <select
                    value={selectedOrder.fulfillment || "Unfulfilled"}
                    onChange={(e) => handleFulfillmentChange(selectedOrder.id, e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-bold outline-none text-slate-700 focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] cursor-pointer"
                    disabled={isDetailLoading}
                  >
                    <option value="Unfulfilled">Unfulfilled</option>
                    <option value="Processing">Processing</option>
                    <option value="Packed">Packed</option>
                    <option value="Shipped">Shipped</option>
                    <option value="Out_for_delivery">Out for Delivery</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>

                <div className="space-y-1 bg-[#F8FAFC] p-3 rounded-2xl border border-slate-50 flex flex-col justify-center">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Order Placed</span>
                  <span className="text-xs font-bold text-slate-700 mt-1">{selectedOrder.date} at {selectedOrder.time}</span>
                </div>
              </div>

              {/* Customer and Shipping Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 border-b border-slate-100 pb-5">
                {/* Customer Contact */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User className="w-4.5 h-4.5 text-[#2C3B5E]" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Customer Details</h4>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2 text-xs h-[104px]">
                    <div>
                      <span className="font-bold block text-slate-700">{selectedOrder.customer.name}</span>
                      <span className="text-slate-400 font-medium block mt-0.5">{selectedOrder.customer.email}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 block uppercase">Phone</span>
                      <span className="font-bold text-slate-600 block mt-0.5">{selectedOrder.customer.phone}</span>
                    </div>
                  </div>
                </div>

                {/* Shipping Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#2C3B5E]" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Shipping Address</h4>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs flex flex-col justify-center h-[104px]">
                    <span className="font-bold text-slate-600 leading-relaxed block">
                      {selectedOrder.customer.address}
                    </span>
                  </div>
                </div>

                {/* Billing Location */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4.5 h-4.5 text-[#2C3B5E]" />
                    <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Billing Address</h4>
                  </div>
                  <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs flex flex-col justify-center h-[104px]">
                    <span className="font-bold text-slate-600 leading-relaxed block">
                      {selectedOrder.customer.billingAddress || selectedOrder.customer.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Items Summary</h4>
                <div className="border border-slate-100 rounded-2xl overflow-hidden">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 py-3 px-4">
                        <th className="py-3 px-4">Product Details</th>
                        <th className="py-3 px-4 text-center">Qty</th>
                        <th className="py-3 px-4 text-right">Price</th>
                        <th className="py-3 px-4 text-right">Total</th>
                      </tr>
                    </thead>
                    <tbody className="text-xs font-bold text-slate-700 divide-y divide-slate-50">
                      {selectedOrder.products.length > 0 ? (
                        selectedOrder.products.map((item, idx) => (
                          <tr key={item.id || idx}>
                            <td className="py-3.5 px-4 flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <span className="font-extrabold text-slate-800">{item.name}</span>
                            </td>
                            <td className="py-3.5 px-4 text-center text-slate-500">{item.quantity}</td>
                            <td className="py-3.5 px-4 text-right">₹{item.price.toFixed(2)}</td>
                            <td className="py-3.5 px-4 text-right text-slate-800">₹{(item.price * item.quantity).toFixed(2)}</td>
                          </tr>
                        ))
                      ) : (
                        // Fallback item if no live sync products
                        <tr>
                          <td className="py-3.5 px-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0 flex items-center justify-center">
                              <ShoppingBag className="w-5 h-5 text-slate-300" />
                            </div>
                            <span className="font-extrabold text-slate-800">Luxury Skincare Item Collection</span>
                          </td>
                          <td className="py-3.5 px-4 text-center text-slate-500">{selectedOrder.rawProductCount}</td>
                          <td className="py-3.5 px-4 text-right">₹{(selectedOrder.total / selectedOrder.rawProductCount).toFixed(2)}</td>
                          <td className="py-3.5 px-4 text-right text-slate-800">₹{selectedOrder.total.toFixed(2)}</td>
                        </tr>
                      )}
                      
                      {/* Financial totals lines */}
                      <tr className="bg-slate-50/20 font-bold">
                        <td colSpan="3" className="py-3.5 px-4 text-right text-slate-400 uppercase tracking-wider text-[10px]">Subtotal</td>
                        <td className="py-3.5 px-4 text-right text-slate-700">₹{selectedOrder.subtotal ? selectedOrder.subtotal.toFixed(2) : selectedOrder.total.toFixed(2)}</td>
                      </tr>
                      {selectedOrder.discount_amount > 0 && (
                        <tr className="bg-slate-50/20 font-bold">
                          <td colSpan="3" className="py-3.5 px-4 text-right text-emerald-500 uppercase tracking-wider text-[10px]">Discount {selectedOrder.couponCode ? `(${selectedOrder.couponCode})` : ''}</td>
                          <td className="py-3.5 px-4 text-right text-emerald-600">-₹{selectedOrder.discount_amount.toFixed(2)}</td>
                        </tr>
                      )}
                      <tr className="bg-slate-50/20 font-bold">
                        <td colSpan="3" className="py-3.5 px-4 text-right text-slate-400 uppercase tracking-wider text-[10px]">Tax</td>
                        <td className="py-3.5 px-4 text-right text-slate-700">₹{selectedOrder.tax_amount ? selectedOrder.tax_amount.toFixed(2) : '0.00'}</td>
                      </tr>
                      <tr className="bg-slate-50/20 font-bold">
                        <td colSpan="3" className="py-3.5 px-4 text-right text-slate-400 uppercase tracking-wider text-[10px]">Shipping</td>
                        <td className="py-3.5 px-4 text-right text-slate-700">{selectedOrder.shipping_amount > 0 ? `₹${selectedOrder.shipping_amount.toFixed(2)}` : 'FREE'}</td>
                      </tr>
                      <tr className="bg-slate-50/30 border-t border-slate-100 font-extrabold">
                        <td colSpan="3" className="py-4 px-4 text-right text-[#2C3B5E] uppercase tracking-wider text-[10px]">Grand Total</td>
                        <td className="py-4 px-4 text-right text-[#2C3B5E] text-sm">₹{selectedOrder.total.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payment Details */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Payment Information</h4>
                <div className="bg-[#F8FAFC] border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center text-xs">
                  <div className="flex items-center gap-3">
                    <CreditCard className="w-5 h-5 text-[#2C3B5E]" />
                    <div>
                      <span className="font-bold text-slate-700 block">Payment Method</span>
                      <span className="text-slate-400 font-medium mt-0.5 block">{selectedOrder.paymentMethod}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 font-medium">Transaction Status:</span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${
                      selectedOrder.payment === "paid"
                        ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                        : "bg-rose-50 text-rose-600 border-rose-100"
                    }`}>
                      {selectedOrder.payment === "paid" ? "Settled Successfully" : "Payment Failed"}
                    </span>
                  </div>
                </div>
                {selectedOrder.notes && !selectedOrder.notes.includes("Payment Method:") && (
                  <div className="mt-2 bg-slate-50/50 border border-slate-100 rounded-2xl p-4 text-xs">
                    <span className="font-bold text-slate-700 block mb-1">Order Notes</span>
                    <span className="text-slate-600">{selectedOrder.notes}</span>
                  </div>
                )}
              </div>

              {/* Status History */}
              {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-extrabold text-slate-800 uppercase tracking-wider">Status History</h4>
                  <div className="space-y-4 ml-2">
                    {selectedOrder.statusHistory.map((history, idx) => (
                      <div key={idx} className="relative pl-6">
                        <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-[#2C3B5E]"></div>
                        {idx !== selectedOrder.statusHistory.length - 1 && (
                          <div className="absolute left-1 top-3.5 w-0.5 h-full bg-slate-200"></div>
                        )}
                        <div className="text-xs">
                          <span className="font-bold text-slate-700 capitalize">
                            {history.status_type} Status: {history.old_status ? history.old_status + ' ➔ ' : ''}{history.new_status}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(history.created_at).toLocaleString()} by {history.changed_by_email}
                          </span>
                          {history.reason && (
                            <span className="text-slate-500 italic block mt-1">{history.reason}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-between gap-3">
              <button
                onClick={() => handleCancelOrder(selectedOrder.id)}
                className="px-5 py-2.5 text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 rounded-xl hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={selectedOrder.status === "Cancelled" || selectedOrder.isCancellable === false}
              >
                Cancel Order
              </button>
              <button
                onClick={() => setSelectedOrder(null)}
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
