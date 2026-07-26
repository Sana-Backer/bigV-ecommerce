"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Ticket,
  Percent,
  TrendingUp,
  Clock,
  Search,
  Filter,
  Plus,
  Edit,
  Trash2,
  X,
  CheckCircle,
  AlertCircle,
  ToggleLeft,
  ToggleRight,
  Calendar,
  Layers,
  ArrowLeft
} from "lucide-react";
import { getCategoriesApi } from "@/services/categoryApi";
import { getProductsApi } from "@/services/productsApi";
import { 
  getAdminCouponsApi, 
  createAdminCouponApi, 
  updateAdminCouponApi, 
  deleteAdminCouponApi 
} from "@/services/couponApi";

export default function AdminCoupons() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All"); // "All" | "Active" | "Scheduled" | "Expired"
  const [editingCoupon, setEditingCoupon] = useState(null);
  
  // Tab state inside Create/Edit form modal
  const [activeFormTab, setActiveFormTab] = useState("promotion"); // "promotion" | "coupon"

  // Dropdown lists fetched from API
  const [categoriesList, setCategoriesList] = useState([]);
  const [productsList, setProductsList] = useState([]);

  // Coupon data state
  const [coupons, setCoupons] = useState([]);

  // Form State
  const [formData, setFormData] = useState({
    code: "",
    title: "", 
    description: "",
    discount_type: "percentage",
    discount_value: "",
    minimum_order_amount: "0",
    maximum_discount_amount: "",
    usage_limit_per_user: "1",
    valid_from: "",
    valid_until: "",
    usage_limit: "100",
    is_active: true,
    category_id: "",
    product_id: "",
    max_price: "2000"
  });

  // Fetch real data on load
  useEffect(() => {
    const loadApiData = async () => {
      try {
        const catRes = await getCategoriesApi();
        if (catRes && catRes.status === 200 && catRes.data?.status === "success") {
          setCategoriesList(catRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      }

      try {
        const prodRes = await getProductsApi();
        if (prodRes && prodRes.status === 200 && prodRes.data?.status === "success") {
          setProductsList(prodRes.data.data || []);
        }
      } catch (err) {
        console.error("Failed to load products:", err);
      }

      try {
        const couponRes = await getAdminCouponsApi();
        if (couponRes && couponRes.status === 200) {
          setCoupons(couponRes.data?.results || couponRes.data?.data || couponRes.data || []);
        }
      } catch (err) {
        console.error("Failed to load coupons:", err);
      }
    };
    loadApiData();
  }, []);

  // Calculate dynamic stats
  const stats = useMemo(() => {
    const today = new Date().toISOString();
    const active = coupons.filter(c => c.is_active && c.valid_from <= today && c.valid_until >= today).length;
    const expiringSoon = coupons.filter(c => {
      if (!c.is_active || c.valid_until < today) return false;
      const diffTime = new Date(c.valid_until) - new Date(today);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays <= 7;
    }).length;
    const totalRedemptions = coupons.reduce((acc, curr) => acc + (curr.used_count || 0), 0);
    const avgDiscount = Math.round(
      coupons
        .filter(c => c.discount_type === "percentage")
        .reduce((acc, curr) => acc + curr.discount_value, 0) /
      (coupons.filter(c => c.discount_type === "percentage").length || 1)
    );

    return { active, expiringSoon, totalRedemptions, avgDiscount };
  }, [coupons]);

  // Handle open modal for creating
  const handleOpenAdd = () => {
    setEditingCoupon(null);
    setActiveFormTab("promotion");
    
    // Default Dates: Now & One Month Later
    const now = new Date();
    const startStr = now.toISOString().slice(0, 16);
    const end = new Date();
    end.setMonth(end.getMonth() + 1);
    const endStr = end.toISOString().slice(0, 16);

    setFormData({
      code: "",
      title: "",
      description: "",
      discount_type: "percentage",
      discount_value: "",
      minimum_order_amount: "0",
      maximum_discount_amount: "",
      usage_limit_per_user: "1",
      valid_from: startStr,
      valid_until: endStr,
      usage_limit: "100",
      is_active: true,
      category_id: "",
      product_id: "",
      max_price: "2000"
    });
    setIsModalOpen(true);
  };

  // Handle open modal for editing
  const handleOpenEdit = (coupon) => {
    setEditingCoupon(coupon);
    setActiveFormTab(coupon.is_promotion ? "promotion" : "coupon");

    const formatDt = (dtStr) => {
      if (!dtStr) return "";
      return dtStr.slice(0, 16);
    };

    setFormData({
      code: coupon.code || "",
      title: coupon.title || "",
      description: coupon.description || "",
      discount_type: coupon.discount_type || "percentage",
      discount_value: (coupon.discount_value || "").toString(),
      minimum_order_amount: (coupon.minimum_order_amount || 0).toString(),
      maximum_discount_amount: (coupon.maximum_discount_amount || "").toString(),
      usage_limit_per_user: (coupon.usage_limit_per_user || "1").toString(),
      valid_from: formatDt(coupon.valid_from),
      valid_until: formatDt(coupon.valid_until),
      usage_limit: (coupon.usage_limit || 100).toString(),
      is_active: coupon.is_active,
      category_id: coupon.category_id || "",
      product_id: coupon.product_id || "",
      max_price: coupon.max_price || "2000"
    });
    setIsModalOpen(true);
  };

  // Delete handler
  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this promotion/coupon?")) {
      try {
        const res = await deleteAdminCouponApi(id);
        if (res.status === 204 || res.status === 200) {
          setCoupons(prev => prev.filter(c => c.id !== id));
        }
      } catch (err) {
        console.error("Failed to delete coupon:", err);
      }
    }
  };

  // Toggle active status switch
  const handleToggleActive = async (id) => {
    const coupon = coupons.find(c => c.id === id);
    if (!coupon) return;
    try {
      const res = await updateAdminCouponApi(id, { is_active: !coupon.is_active });
      if (res.status === 200) {
        setCoupons(prev => prev.map(c => (c.id === id ? { ...c, is_active: !c.is_active } : c)));
      }
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
    }
  };

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.code.trim()) return;

    const discountVal = parseFloat(formData.discount_value) || 0;
    const minOrderVal = parseFloat(formData.minimum_order_amount) || 0;
    const maxDiscountVal = parseFloat(formData.maximum_discount_amount) || null;
    const usageLimitPerUserVal = parseInt(formData.usage_limit_per_user) || 1;
    const usageLimitVal = parseInt(formData.usage_limit) || null;
    const formattedCode = formData.code.toUpperCase().replace(/\s+/g, "");

    const reqBody = {
      code: formattedCode,
      description: formData.description,
      discount_type: formData.discount_type,
      discount_value: discountVal,
      minimum_order_amount: minOrderVal,
      maximum_discount_amount: maxDiscountVal,
      usage_limit_per_user: usageLimitPerUserVal,
      valid_from: formData.valid_from,
      valid_until: formData.valid_until,
      usage_limit: usageLimitVal,
      is_active: formData.is_active,
    };

    try {
      if (editingCoupon) {
        // Edit
        const res = await updateAdminCouponApi(editingCoupon.id, reqBody);
        if (res.status === 200) {
          setCoupons(prev => prev.map(c => (c.id === editingCoupon.id ? { ...c, ...reqBody, title: formData.title } : c)));
          setIsModalOpen(false);
        }
      } else {
        // Add
        const res = await createAdminCouponApi(reqBody);
        if (res.status === 201) {
          const createdCoupon = res.data?.data || res.data || reqBody;
          setCoupons(prev => [{ ...createdCoupon, title: formData.title, id: createdCoupon.id || Date.now().toString() }, ...prev]);
          setIsModalOpen(false);
        }
      }
    } catch (err) {
      console.error("Failed to save coupon:", err);
      alert("Failed to save coupon. Check console for details.");
    }
  };

  // Filtered listing
  const filteredCoupons = useMemo(() => {
    const today = new Date().toISOString();

    return coupons.filter(c => {
      // Search term match
      const matchesSearch =
        c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.title.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;

      // Status tab filter match
      if (statusFilter === "Active") {
        return c.is_active && c.valid_from <= today && c.valid_until >= today;
      }
      if (statusFilter === "Scheduled") {
        return c.is_active && c.valid_from > today;
      }
      if (statusFilter === "Expired") {
        return !c.is_active || c.valid_until < today;
      }
      return true;
    });
  }, [coupons, searchTerm, statusFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1E1B1B] tracking-tight flex items-center gap-2">
            Coupons & Promotions
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
Create and manage coupons, discounts, and promotional campaigns from a single dashboard.          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer w-fit self-start sm:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Create </span>
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Active Campaigns</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.active}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center">
            <Percent className="w-6 h-6 text-indigo-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Avg. discount rate</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.avgDiscount}%</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
            <Clock className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Expiring soon</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.expiringSoon}</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4 transition-all hover:scale-[1.02] duration-200">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 flex items-center justify-center">
            <TrendingUp className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Total Redemptions</span>
            <span className="text-2xl font-extrabold text-slate-800">{stats.totalRedemptions}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white p-4 rounded-3xl border border-slate-100 shadow-xs">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search coupon codes or titles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] font-medium"
          />
        </div>

        {/* Status Filter Tab Controls */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto no-scrollbar">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block shrink-0" />
          <div className="flex gap-1.5">
            {["All", "Active", "Scheduled", "Expired"].map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border shrink-0 cursor-pointer ${
                  statusFilter === filter
                    ? "bg-[#2C3B5E] text-white border-[#2C3B5E]"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Coupon List Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                <th className="py-4 px-2">Campaign Info</th>
                <th className="py-4 px-1">Campaign Code</th>
                <th className="py-4 px-2">Campaign Type</th>
                <th className="py-4 px-2">Discount Value</th>
                <th className="py-4 px-2">Scope / Requirement</th>
                <th className="py-4 px-2">Date Range</th>
                <th className="py-4 px-2">Usage Limit</th>
                <th className="py-4 px-2">Active Status</th>
                <th className="py-4 px-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {filteredCoupons.length > 0 ? (
                filteredCoupons.map((coupon) => {
                  const today = new Date().toISOString();
                  const isExpired = coupon.valid_until < today;
                  const isScheduled = coupon.valid_from > today;
                  let statusTag = (
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                      Active
                    </span>
                  );
                  if (!coupon.is_active) {
                    statusTag = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-slate-50 text-slate-500 border border-slate-100">
                        Disabled
                      </span>
                    );
                  } else if (isExpired) {
                    statusTag = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-rose-50 text-rose-600 border border-rose-100">
                        Expired
                      </span>
                    );
                  } else if (isScheduled) {
                    statusTag = (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-blue-50 text-blue-600 border border-blue-100">
                        Scheduled
                      </span>
                    );
                  }

                  return (
                    <tr key={coupon.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Code and Description */}
                      <td className="py-2 px-3">
                        <div className="space-y-1 max-w-[220px]">
                       
                          {coupon.title && <span className="text-slate-900 font-bold block text-[13px]">{coupon.title}</span>}
                          {coupon.description && (
                            <span className="text-md text-slate-600 font-medium block leading-snug line-clamp-2" title={coupon.description}>
                              {coupon.description}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-2 px-1 font-bold font-mono">{coupon.code}</td>

                      {/* Campaign Type */}
                      <td className="py-2  px-2">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold ${
                          coupon.is_promotion 
                            ? "bg-indigo-50 text-indigo-600 border border-indigo-100" 
                            : "bg-purple-50 text-purple-600 border border-purple-100"
                        }`}>
                          {coupon.is_promotion ? "Promotion" : "Coupon"}
                        </span>
                      </td>

                      {/* Discount Value */}
                      <td className="py-2 px-2">
                        <div className="flex flex-col gap-0.5">
                          <span className="text-slate-800 font-extrabold text-[15px]">
                            {coupon.discount_type === "percentage" && `${coupon.discount_value}% OFF`}
                            {coupon.discount_type === "fixed" && `₹${coupon.discount_value} OFF`}
                            {coupon.discount_type === "free_shipping" && "Free Shipping"}
                          </span>
                          <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                            {coupon.discount_type.replace("_", " ")}
                          </span>
                        </div>
                      </td>

                      {/* Scope/Requirements */}
                      <td className="py-2 px-2">
                        <div className="flex flex-col text-xs font-bold text-slate-600">
                          {coupon.is_promotion ? (
                            <>
                              {coupon.category_id && <span>Category Applied</span>}
                              {coupon.product_id && <span>Product Spec.</span>}
                              {coupon.max_price && <span>Max Price: ₹{coupon.max_price}</span>}
                              {!coupon.category_id && !coupon.product_id && <span>Storewide Promo</span>}
                            </>
                          ) : (
                            <span>
                              {coupon.minimum_order_amount > 0 ? `Min Spend: ₹${coupon.minimum_order_amount}` : "No Min Spend"}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="py-2 px-2 text-[13px] text-slate-500 font-medium">
                        <div className="flex flex-col gap-1.5 whitespace-nowrap">
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md w-fit">
                            <Calendar className="w-3 h-3 text-slate-800" />
                            <span>{new Date(coupon.valid_from).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</span>
                          </div>
                          <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded-md w-fit font-semibold text-slate-600">
                            <Clock className="w-3 h-3 text-slate-800" />
                            <span>{new Date(coupon.valid_until).toLocaleDateString('en-US', {month:'short', day:'numeric', year:'numeric'})}</span>
                          </div>
                        </div>
                      </td>

                      {/* Usage counter */}
                      <td className="py-2 px-2">
                        {coupon.is_promotion ? (
                          <span className="text-slate-400 text-xs font-semibold">Unlimited</span>
                        ) : (
                          <div className="space-y-1">
                            <span className="text-slate-700 font-bold block">
                              {coupon.used_count} / {coupon.usage_limit}
                            </span>
                            <div className="w-24 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div
                                className="bg-[#553C9A] h-1.5 rounded-full"
                                style={{ width: `${Math.min(100, ((coupon.used_count || 0) / coupon.usage_limit) * 100)}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>

                      {/* Active toggler */}
                      <td className="py-2 flex flex-col items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(coupon.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none cursor-pointer ${
                            coupon.is_active ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform shadow-sm ${
                              coupon.is_active ? 'translate-x-4.5' : 'translate-x-1'
                            }`}
                          />
                        </button>
                           <div className="flex items-center gap-2 flex-wrap">

                            {statusTag}
                          </div>
                      </td>

                      {/* Actions */}
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleOpenEdit(coupon)}
                            className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                            title="Edit Promotion/Coupon"
                          >
                            <Edit className="w-4.5 h-4.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(coupon.id)}
                            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                            title="Delete Promotion/Coupon"
                          >
                            <Trash2 className="w-4.5 h-4.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="8" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-bold">No items found matching your criteria</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
          <span>Showing {filteredCoupons.length} of {coupons.length} items</span>
        </div>
      </div>

      {/* Slide-out Add/Edit Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[90vh] shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-2 pb-2 shrink-0">
              <h2 className="text-xl font-bold text-slate-800">
                {editingCoupon ? "Edit Promotion/Coupon" : "Create Promotion/Coupon"}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tab selector */}
            <div className="px-2 pt-1 shrink-0">
              <div className="flex bg-slate-100/50 p-1.5 rounded-2xl border border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveFormTab("promotion")}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeFormTab === "promotion"
                      ? "bg-[#2C3B5E] text-white shadow-md shadow-[#2C3B5E]/10"
                      : "text-[#2C3B5E] hover:bg-slate-50"
                  }`}
                >
                  Create Promotion
                </button>
                <button
                  type="button"
                  onClick={() => setActiveFormTab("coupon")}
                  className={`flex-1 py-2.5 text-center text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    activeFormTab === "coupon"
                      ? "bg-[#2C3B5E] text-white shadow-md shadow-[#2C3B5E]/10"
                      : "text-[#2C3B5E] hover:bg-slate-50"
                  }`}
                >
                  Create Coupon
                </button>
              </div>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
              
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 min-h-0">
                {activeFormTab === "promotion" ? (
                  /* PROMOTION FORM FIELDS */
                  <div className="space-y-4">
                    {/* Row 1: Name and Code */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Promotion Name *</label>
                        <input
                          type="text"
                          required
                          placeholder="Enter promotion name"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Promotion Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="PROMO2024"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-mono font-bold outline-none focus:border-[#2C3B5E] uppercase"
                        />
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Describe your promotion..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E] resize-none"
                      />
                    </div>

                    {/* Row 3: Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Promotion Type *</label>
                        <select
                          value={formData.discount_type}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_type: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold outline-none focus:border-[#2C3B5E]"
                        >
                          <option value="percentage">Percentage Discount</option>
                          <option value="fixed">Fixed Amount Discount</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Value *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder="10.00"
                          value={formData.discount_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Row 4: Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Start Date *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.valid_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">End Date *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.valid_until}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Targeted settings block */}
                    <div className="bg-slate-50/60 p-4 rounded-2xl border border-slate-100 space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Category</label>
                          <select
                            value={formData.category_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                          >
                            <option value="">Select Category</option>
                            {categoriesList.map(cat => (
                              <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Products</label>
                          <select
                            value={formData.product_id}
                            onChange={(e) => setFormData(prev => ({ ...prev, product_id: e.target.value }))}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                          >
                            <option value="">Select Product</option>
                            {productsList.map(prod => (
                              <option key={prod.id} value={prod.id}>{prod.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                          <span>Price Range</span>
                          <span>₹0 - ₹{formData.max_price}</span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="5000"
                          step="100"
                          value={formData.max_price}
                          onChange={(e) => setFormData(prev => ({ ...prev, max_price: e.target.value }))}
                          className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-[#2C3B5E]"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* COUPON FORM FIELDS */
                  <div className="space-y-4">
                    {/* Row 1: Code and Title */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coupon Code *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. LUSHNEW20"
                          value={formData.code}
                          onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-mono font-bold outline-none focus:border-[#2C3B5E] uppercase"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coupon Title *</label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Welcome Offer 20% Off"
                          value={formData.title}
                          onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Row 2: Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Description</label>
                      <textarea
                        rows={2}
                        placeholder="Summarize coupon rules..."
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E] resize-none"
                      />
                    </div>

                    {/* Row 3: Type and Value */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Coupon Type *</label>
                        <select
                          value={formData.discount_type}
                          onChange={(e) => {
                            const type = e.target.value;
                            setFormData(prev => ({
                              ...prev,
                              discount_type: type,
                              discount_value: prev.discount_value
                            }));
                          }}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-semibold outline-none focus:border-[#2C3B5E]"
                        >
                          <option value="percentage">Percentage OFF</option>
                          <option value="fixed">Fixed Amount OFF</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Value *</label>
                        <input
                          type="number"
                          min="0"
                          required
                          placeholder={formData.discount_type === "percentage" ? "20" : "150"}
                          value={formData.discount_value}
                          onChange={(e) => setFormData(prev => ({ ...prev, discount_value: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Row 4: Dates */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Start Date *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.valid_from}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_from: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">End Date *</label>
                        <input
                          type="datetime-local"
                          required
                          value={formData.valid_until}
                          onChange={(e) => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Row 5: Min spend & limits */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Min Spend (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="E.g. 1000"
                          value={formData.minimum_order_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, minimum_order_amount: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Usage Limit</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="E.g. 500"
                          value={formData.usage_limit}
                          onChange={(e) => setFormData(prev => ({ ...prev, usage_limit: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>

                    {/* Row 6: Max Discount & Per-User Limit */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Max Discount (₹)</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="E.g. 500"
                          value={formData.maximum_discount_amount}
                          onChange={(e) => setFormData(prev => ({ ...prev, maximum_discount_amount: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Per-User Limit</label>
                        <input
                          type="number"
                          min="1"
                          placeholder="E.g. 1"
                          value={formData.usage_limit_per_user}
                          onChange={(e) => setFormData(prev => ({ ...prev, usage_limit_per_user: e.target.value }))}
                          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-xs font-bold outline-none focus:border-[#2C3B5E]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Sticky Modal Footer */}
              <div className="p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex gap-4 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer text-center"
                >
                  {activeFormTab === "promotion" 
                    ? (editingCoupon ? "Save Promotion" : "Create Promotion")
                    : (editingCoupon ? "Save Coupon" : "Create Coupon")
                  }
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  );
}
