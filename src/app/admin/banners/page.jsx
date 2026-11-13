"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Plus,
  Edit,
  Trash2,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  Smartphone,
  Monitor,
  ArrowUpDown,
  AlertCircle,
  ExternalLink,
  Sparkles,
  FolderTree,
  Tag,
  Layers,
} from "lucide-react";
import {
  getAdminBannersApi,
  createBannerApi,
  updateBannerApi,
  deleteBannerApi,
} from "@/services/bannersApi";
import { getCategoriesApi } from "@/services/categoryApi";

// Convert ISO string from API to local "YYYY-MM-DDTHH:mm" for <input type="datetime-local" />
const formatToInputDate = (isoString) => {
  if (!isoString) return "";
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "";
    const tzOffset = d.getTimezoneOffset() * 60000;
    return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16);
  } catch {
    return "";
  }
};

// Pretty display of date/time
const formatDisplayDate = (isoString) => {
  if (!isoString) return null;
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return null;
  }
};

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState("home_hero"); // "home_hero" | "home_promo" | "shop_category" | "all"
  const [statusFilter, setStatusFilter] = useState("all"); // "all" | "active" | "inactive" | "scheduled" | "expired" | "live"
  const [deviceFilter, setDeviceFilter] = useState("all"); // "all" | "desktop" | "mobile"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    placement: "home_hero",
    is_mobile: false,
    category: "",
    title: "",
    subtitle: "",
    link_url: "",
    cta_text: "",
    imagePreview: null,
    imageFile: null,
    mobileImagePreview: null,
    mobileImageFile: null,
    is_active: true,
    sort_order: 0,
    start_at: "",
    end_at: "",
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await getAdminBannersApi();
      if (res && (res.status === 200 || res.status === 201)) {
        const fetchedBanners =
          res.data?.results || res.data?.data || res.data || [];
        setBanners(Array.isArray(fetchedBanners) ? fetchedBanners : []);
      }
    } catch (err) {
      console.error("Failed to fetch banners", err);
      toast.error("Failed to load banners.");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await getCategoriesApi();
      if (res && res.status === 200) {
        const cats = res.data?.data || res.data || [];
        setCategories(Array.isArray(cats) ? cats : []);
      }
    } catch (err) {
      console.error("Failed to load categories for banners", err);
    }
  };

  useEffect(() => {
    fetchBanners();
    fetchCategories();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        placement: banner.placement || "home_hero",
        is_mobile: Boolean(banner.is_mobile),
        category: banner.category || "",
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        link_url: banner.link_url || "",
        cta_text: banner.cta_text || "",
        imagePreview: banner.image || null,
        imageFile: null,
        mobileImagePreview: banner.mobile_image || null,
        mobileImageFile: null,
        is_active: Boolean(banner.is_active),
        sort_order: banner.sort_order ?? 0,
        start_at: formatToInputDate(banner.start_at),
        end_at: formatToInputDate(banner.end_at),
      });
    } else {
      setEditingBanner(null);
      const defaultPlacement = activeTab === "all" ? "home_hero" : activeTab;
      setFormData({
        placement: defaultPlacement,
        is_mobile: deviceFilter === "mobile",
        category: "",
        title: "",
        subtitle: "",
        link_url: "",
        cta_text: "",
        imagePreview: null,
        imageFile: null,
        mobileImagePreview: null,
        mobileImageFile: null,
        is_active: true,
        sort_order: banners.filter((b) => b.placement === defaultPlacement).length,
        start_at: "",
        end_at: "",
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
  };

  const handleSaveBanner = async (e) => {
    e.preventDefault();

    // Client-side date order validation
    if (formData.start_at && formData.end_at) {
      const startDate = new Date(formData.start_at);
      const endDate = new Date(formData.end_at);
      if (startDate >= endDate) {
        toast.error("End date/time must be strictly after Start date/time.");
        return;
      }
    }

    if (!editingBanner && !formData.imageFile) {
      toast.error(formData.is_mobile ? "Phone Banner Image is required." : "Desktop Banner Image is required.");
      return;
    }

    setSubmitting(true);
    const submitData = new FormData();
    submitData.append("placement", formData.placement);
    submitData.append("is_mobile", formData.is_mobile ? "true" : "false");

    // Category FK: only valid for shop_category placement
    if (formData.placement === "shop_category" && formData.category) {
      submitData.append("category", formData.category);
    } else {
      submitData.append("category", "");
    }

    submitData.append("title", formData.title.trim());
    submitData.append("subtitle", formData.subtitle.trim());
    submitData.append("link_url", formData.link_url.trim());
    submitData.append("cta_text", formData.cta_text.trim());
    submitData.append("is_active", formData.is_active ? "true" : "false");
    submitData.append("sort_order", Number(formData.sort_order) || 0);

    // Schedule dates
    submitData.append(
      "start_at",
      formData.start_at ? new Date(formData.start_at).toISOString() : ""
    );
    submitData.append(
      "end_at",
      formData.end_at ? new Date(formData.end_at).toISOString() : ""
    );

    if (formData.imageFile) {
      submitData.append("image", formData.imageFile);
    }
    if (formData.mobileImageFile && !formData.is_mobile) {
      submitData.append("mobile_image", formData.mobileImageFile);
    }

    try {
      let res;
      if (editingBanner) {
        res = await updateBannerApi(editingBanner.id, submitData);
      } else {
        res = await createBannerApi(submitData);
      }

      if (res && (res.status === 200 || res.status === 201)) {
        toast.success(editingBanner ? "Banner updated successfully!" : "Banner created successfully!");
        fetchBanners();
        handleCloseModal();
      } else {
        const errorData = res?.response?.data || res?.data || {};
        const errorMsg =
          errorData?.errors?.category?.[0] ||
          errorData?.errors?.end_at?.[0] ||
          errorData?.errors?.start_at?.[0] ||
          errorData?.errors?.image?.[0] ||
          errorData?.errors?.detail ||
          errorData?.category?.[0] ||
          errorData?.end_at?.[0] ||
          errorData?.start_at?.[0] ||
          errorData?.image?.[0] ||
          errorData?.detail ||
          errorData?.message ||
          "Failed to save banner. Please check all fields.";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save banner due to a network error.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner permanently?")) {
      try {
        const res = await deleteBannerApi(id);
        if (res.status === 204 || res.status === 200) {
          toast.success("Banner deleted successfully.");
          fetchBanners();
        }
      } catch (err) {
        console.error("Failed to delete banner", err);
        toast.error("Failed to delete banner.");
      }
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const res = await updateBannerApi(banner.id, { is_active: !banner.is_active });
      if (res && (res.status === 200 || res.status === 201)) {
        toast.success(`Banner ${!banner.is_active ? "activated" : "deactivated"}.`);
        fetchBanners();
      } else {
        const errorData = res?.response?.data || res?.data || {};
        const errorMsg = errorData?.detail || errorData?.message || "Failed to toggle banner status.";
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
      toast.error("Failed to toggle status.");
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        imagePreview: previewUrl,
        imageFile: file,
      }));
    }
  };

  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData((prev) => ({
        ...prev,
        mobileImagePreview: previewUrl,
        mobileImageFile: file,
      }));
    }
  };

  // Helper to determine status type for badge & filtering
  const getBannerStatus = (banner) => {
    if (!banner.is_active) {
      return {
        key: "inactive",
        label: "Disabled",
        bg: "bg-slate-100 text-slate-600 border-slate-200",
        dot: "bg-slate-400",
      };
    }
    const now = new Date();
    if (banner.start_at && new Date(banner.start_at) > now) {
      return {
        key: "scheduled",
        label: "Scheduled",
        bg: "bg-amber-50 text-amber-700 border-amber-200",
        dot: "bg-amber-500",
      };
    }
    if (banner.end_at && new Date(banner.end_at) < now) {
      return {
        key: "expired",
        label: "Expired",
        bg: "bg-rose-50 text-rose-700 border-rose-200",
        dot: "bg-rose-500",
      };
    }
    return {
      key: "live",
      label: "Live Now",
      bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
      dot: "bg-emerald-500",
    };
  };

  // Filtered & sorted banners
  const displayedBanners = banners
    .filter((b) => {
      if (activeTab !== "all" && b.placement !== activeTab) return false;
      if (deviceFilter === "desktop" && b.is_mobile) return false;
      if (deviceFilter === "mobile" && !b.is_mobile) return false;
      if (statusFilter === "all") return true;
      const status = getBannerStatus(b);
      if (statusFilter === "active") return b.is_active;
      if (statusFilter === "inactive") return !b.is_active;
      if (statusFilter === "scheduled") return status.key === "scheduled";
      if (statusFilter === "expired") return status.key === "expired";
      if (statusFilter === "live") return status.key === "live";
      return true;
    })
    .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));

  const totalHero = banners.filter((b) => b.placement === "home_hero").length;
  const totalPromo = banners.filter((b) => b.placement === "home_promo").length;
  const totalShop = banners.filter((b) => b.placement === "shop_category").length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-12">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
              Banner Management
            </h1>
            <span className="bg-[#2C3B5E]/10 text-[#2C3B5E] text-xs font-bold px-2.5 py-0.5 rounded-full">
              {banners.length} Total
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 mt-1">
            Configure homepage hero carousels, secondary promos, and shop category banners with device targeting & scheduling
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Banner</span>
        </button>
      </div>

      {/* Tabs & Filters */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        {/* Placement Tabs */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab("home_hero")}
            className={`pb-2.5 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "home_hero"
                ? "border-[#2C3B5E] text-[#2C3B5E]"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>Home Hero</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {totalHero}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("home_promo")}
            className={`pb-2.5 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "home_promo"
                ? "border-[#2C3B5E] text-[#2C3B5E]"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>Home Secondary Promo</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {totalPromo}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("shop_category")}
            className={`pb-2.5 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "shop_category"
                ? "border-[#2C3B5E] text-[#2C3B5E]"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>Shop / Category Banners</span>
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {totalShop}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("all")}
            className={`pb-2.5 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer flex items-center gap-2 ${
              activeTab === "all"
                ? "border-[#2C3B5E] text-[#2C3B5E]"
                : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
            }`}
          >
            <span>All Placements</span>
          </button>
        </div>

        {/* Filters (Status & Device) */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Device Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Monitor className="w-3 h-3" />
              <span>Device:</span>
            </label>
            <select
              value={deviceFilter}
              onChange={(e) => setDeviceFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#2C3B5E]"
            >
              <option value="all">All Devices</option>
              <option value="desktop">Desktop / Laptop Only</option>
              <option value="mobile">Phone / Mobile Only</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>Status:</span>
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-slate-200 bg-white py-1.5 px-3 text-xs font-semibold text-slate-700 outline-none focus:border-[#2C3B5E]"
            >
              <option value="all">All Statuses</option>
              <option value="live">Live Now</option>
              <option value="scheduled">Scheduled</option>
              <option value="expired">Expired</option>
              <option value="active">Active Flag On</option>
              <option value="inactive">Disabled Flag Off</option>
            </select>
          </div>
        </div>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 text-slate-400">
          <div className="w-8 h-8 border-3 border-[#2C3B5E] border-t-transparent rounded-full animate-spin mb-3" />
          <span className="text-sm font-medium">Loading banners...</span>
        </div>
      ) : displayedBanners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBanners.map((banner) => {
            const status = getBannerStatus(banner);
            const startDisplay = formatDisplayDate(banner.start_at);
            const endDisplay = formatDisplayDate(banner.end_at);
            const createdDisplay = formatDisplayDate(banner.created_at);

            const placementName =
              banner.placement === "home_hero"
                ? "Hero"
                : banner.placement === "home_promo"
                ? "Promo"
                : "Shop Page";

            return (
              <div
                key={banner.id}
                className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col group relative"
              >
                {/* Banner Image Preview Container */}
                <div className={`relative ${banner.is_mobile ? "aspect-3/4 sm:aspect-square" : "aspect-video"} bg-slate-100 border-b border-slate-100 overflow-hidden`}>
                  <img
                    src={banner.image || "/placeholder.png"}
                    alt={banner.title || "Banner Image"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />

                  {/* Overlay Action Buttons */}
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => handleOpenModal(banner)}
                      title="Edit Banner"
                      className="p-2.5 bg-white rounded-full text-slate-700 hover:text-[#2C3B5E] shadow-md transform hover:scale-110 transition-all cursor-pointer"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteBanner(banner.id)}
                      title="Delete Banner"
                      className="p-2.5 bg-white rounded-full text-slate-700 hover:text-rose-600 shadow-md transform hover:scale-110 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 flex flex-wrap items-center gap-1.5">
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shadow-sm">
                      <ArrowUpDown className="w-3 h-3" />
                      #{banner.sort_order ?? 0}
                    </span>
                    <span className="bg-slate-900/80 backdrop-blur-md text-white text-[10px] font-medium px-2 py-0.5 rounded-full shadow-sm">
                      {placementName}
                    </span>
                    {banner.placement === "shop_category" && (
                      <span className="bg-indigo-600/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                        <FolderTree className="w-3 h-3" />
                        <span>{banner.category_name || "All Products"}</span>
                      </span>
                    )}
                  </div>

                  {/* Live Status Pill & Quick Toggle */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    <button
                      onClick={() => handleToggleStatus(banner)}
                      title="Click to toggle active status"
                      className={`px-2.5 py-1 text-[11px] font-bold rounded-full border cursor-pointer backdrop-blur-md shadow-sm transition-all flex items-center gap-1.5 ${status.bg}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${status.dot} ${status.key === "live" ? "animate-pulse" : ""}`} />
                      <span>{status.label}</span>
                    </button>
                  </div>

                  {/* Device Indicators (Desktop / Mobile) */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-1">
                    {banner.is_mobile ? (
                      <span
                        title="Phone screen banner (is_mobile=True)"
                        className="bg-sky-600/90 backdrop-blur-md px-2 py-1 rounded-md text-white flex items-center gap-1 text-[10px] font-bold shadow-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Phone Banner</span>
                      </span>
                    ) : (
                      <span
                        title="Desktop/laptop banner (is_mobile=False)"
                        className="bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-white flex items-center gap-1 text-[10px] font-bold shadow-sm"
                      >
                        <Monitor className="w-3.5 h-3.5" />
                        <span>Desktop Banner</span>
                      </span>
                    )}

                    {!banner.is_mobile && banner.mobile_image && (
                      <span
                        title="Alternate mobile view configured"
                        className="bg-emerald-600/90 backdrop-blur-md p-1 rounded-md text-white flex items-center gap-0.5 text-[9px] font-bold px-1.5 shadow-sm"
                      >
                        <Smartphone className="w-3.5 h-3.5" />
                        <span>Alt Mobile</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Banner Content Card Body */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">
                      {banner.title || <span className="text-slate-400 italic font-normal">Untitled Banner</span>}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                      {banner.subtitle || "No subtitle provided."}
                    </p>
                  </div>

                  {/* Category Target Tag (for shop category banners) */}
                  {banner.placement === "shop_category" && (
                    <div className="flex items-center gap-1.5 text-xs text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-xl w-fit font-semibold">
                      <FolderTree className="w-3.5 h-3.5 shrink-0" />
                      <span>
                        Target: {banner.category_name ? banner.category_name : "Default Shop (/products) & Fallback"}
                      </span>
                    </div>
                  )}

                  {/* CTA & Link Details */}
                  {(banner.cta_text || banner.link_url) && (
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      {banner.cta_text && (
                        <span className="text-[11px] font-bold bg-slate-100 text-[#2C3B5E] px-2.5 py-1 rounded-lg truncate">
                          CTA: &quot;{banner.cta_text}&quot;
                        </span>
                      )}
                      {banner.link_url && (
                        <a
                          href={banner.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          title={banner.link_url}
                          className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-[#2C3B5E] font-medium truncate ml-auto"
                        >
                          <LinkIcon className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[150px]">{banner.link_url}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      )}
                    </div>
                  )}

                  {/* Schedule Window Section */}
                  <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-slate-700">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Scheduling Window</span>
                    </div>

                    {startDisplay || endDisplay ? (
                      <div className="space-y-0.5 text-[11px] text-slate-600 pl-5">
                        {startDisplay && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Starts:</span>
                            <span className="font-semibold">{startDisplay}</span>
                          </div>
                        )}
                        {endDisplay && (
                          <div className="flex items-center justify-between">
                            <span className="text-slate-400 font-medium">Ends:</span>
                            <span className="font-semibold">{endDisplay}</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <p className="text-[11px] text-slate-400 pl-5">
                        Runs indefinitely (no scheduling limits)
                      </p>
                    )}
                  </div>

                  {/* Card Footer: Timestamps */}
                  {createdDisplay && (
                    <div className="pt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-50">
                      <span>Created {createdDisplay}</span>
                      <span className="font-mono text-[9px] uppercase text-slate-300">
                        {banner.id?.slice(0, 8)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-xs border-dashed text-center px-4">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Banners Found</h3>
          <p className="text-sm text-slate-400 font-medium mt-1 max-w-md">
            There are no banners matching your current placement, device, or status filters.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="mt-6 px-5 py-2.5 bg-[#2C3B5E] text-white text-sm font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#1E2A47] transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Your First Banner</span>
          </button>
        </div>
      )}

      {/* Add / Edit Banner Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[92vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/70">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#2C3B5E]" />
                <h2 className="text-lg font-bold text-[#2C3B5E]">
                  {editingBanner ? "Edit Banner Configuration" : "Add New Banner"}
                </h2>
              </div>
              <button
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scrollable Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-6">
              <form id="banner-form" onSubmit={handleSaveBanner} className="space-y-6">
                
                {/* 1. Device Targeting Selection */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-[#2C3B5E]" />
                      <span>Device Targeting</span>
                    </label>
                    <span className="text-[11px] text-slate-400">
                      Select which device screen this banner is specifically tailored for
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, is_mobile: false }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        !formData.is_mobile
                          ? "border-[#2C3B5E] bg-[#2C3B5E]/5 text-[#2C3B5E] ring-1 ring-[#2C3B5E]"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${!formData.is_mobile ? "bg-[#2C3B5E] text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Laptop / Desktop Banner</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Wide screens (Recommended: 1920x800)</p>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, is_mobile: true }))}
                      className={`p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                        formData.is_mobile
                          ? "border-sky-600 bg-sky-50 text-sky-900 ring-1 ring-sky-600"
                          : "border-slate-200 bg-white hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      <div className={`p-2.5 rounded-xl ${formData.is_mobile ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-500"}`}>
                        <Smartphone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Phone / Mobile Banner</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">Portrait screens (Recommended: 800x1200)</p>
                      </div>
                    </button>
                  </div>
                </div>

                {/* 2. Images Upload Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Primary Banner Image */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        {formData.is_mobile ? (
                          <Smartphone className="w-3.5 h-3.5 text-sky-600" />
                        ) : (
                          <Monitor className="w-3.5 h-3.5 text-[#2C3B5E]" />
                        )}
                        <span>
                          {formData.is_mobile ? "Phone Banner Image" : "Desktop Banner Image"}{" "}
                          {!editingBanner && <span className="text-rose-500">*</span>}
                        </span>
                      </label>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {formData.is_mobile ? "Recommended: 800x1200" : "Recommended: 1920x800"}
                      </span>
                    </div>

                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center text-center transition-colors hover:border-[#2C3B5E] group min-h-[200px]">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {formData.imagePreview ? (
                        <div className={`relative w-full h-full p-2 flex items-center justify-center ${formData.is_mobile ? "aspect-3/4" : "aspect-video"}`}>
                          <img
                            src={formData.imagePreview}
                            alt="Banner Preview"
                            className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm"
                          />
                          <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                            <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                              <Edit className="w-3.5 h-3.5" /> Change Image
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col items-center justify-center gap-2">
                          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#2C3B5E] transition-colors">
                            <ImageIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-slate-700">
                              Click to upload {formData.is_mobile ? "phone-sized" : "desktop"} banner image
                            </p>
                            <p className="text-[10px] text-slate-400 mt-0.5">PNG, JPG, WEBP up to 5MB</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Secondary / Mobile Alternate Image OR Mobile Notice */}
                  {!formData.is_mobile ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                          <Smartphone className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Mobile Image (Optional Legacy Fallback)</span>
                        </label>
                        <span className="text-[10px] text-slate-400 font-medium">Recommended: 800x1200</span>
                      </div>

                      <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center text-center transition-colors hover:border-[#2C3B5E] group min-h-[200px]">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleMobileImageChange}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        {formData.mobileImagePreview ? (
                          <div className="relative w-full h-full p-2 flex items-center justify-center">
                            <div className="h-44 w-28 relative">
                              <img
                                src={formData.mobileImagePreview}
                                alt="Mobile Alternate Preview"
                                className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm"
                              />
                            </div>
                            <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                              <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                                <Edit className="w-3.5 h-3.5" /> Change Alternate Mobile
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="p-6 flex flex-col items-center justify-center gap-2">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#2C3B5E] transition-colors">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-700">Click to upload mobile alternate</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">Falls back to desktop image if omitted</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-5 flex flex-col justify-center gap-3">
                      <div className="flex items-center gap-2 text-sky-900 font-bold text-sm">
                        <Smartphone className="w-4 h-4 text-sky-600" />
                        <span>Dedicated Phone Banner</span>
                      </div>
                      <p className="text-xs text-sky-800/80 leading-relaxed">
                        This banner will be delivered directly to smartphones. No secondary alternate image is necessary because you are uploading a dedicated portrait image tailored for phone users.
                      </p>
                      <div className="bg-white rounded-xl p-3 border border-sky-200/60 text-[11px] text-slate-600 space-y-1">
                        <p className="font-semibold text-slate-800">Pro Tip:</p>
                        <p>Upload a tall/portrait image (aspect ratio ~9:16 or 800x1200) with clear text for optimal readability on mobile screens.</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Placement & Status & Sort Order */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Placement Slot
                    </label>
                    <select
                      value={formData.placement}
                      onChange={(e) => {
                        const newPlacement = e.target.value;
                        setFormData((prev) => ({
                          ...prev,
                          placement: newPlacement,
                          // If switching away from shop_category, clear category
                          category: newPlacement === "shop_category" ? prev.category : "",
                        }));
                      }}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#2C3B5E]"
                    >
                      <option value="home_hero">Home — Hero Carousel</option>
                      <option value="home_promo">Home — Secondary Promo</option>
                      <option value="shop_category">Shop page — Category Banner</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Master Status
                    </label>
                    <select
                      value={formData.is_active ? "true" : "false"}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          is_active: e.target.value === "true",
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#2C3B5E]"
                    >
                      <option value="true">Active (Enabled)</option>
                      <option value="false">Inactive (Disabled)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Sort Order
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={formData.sort_order}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          sort_order: parseInt(e.target.value) || 0,
                        })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 outline-none focus:border-[#2C3B5E]"
                    />
                  </div>
                </div>

                {/* 4. Category Selector (Only for Shop Category Placement) */}
                {formData.placement === "shop_category" && (
                  <div className="bg-indigo-50/70 border border-indigo-200 rounded-2xl p-4.5 space-y-3 animate-in fade-in duration-300">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-indigo-950 uppercase tracking-wider flex items-center gap-2">
                        <FolderTree className="w-4 h-4 text-indigo-600" />
                        <span>Category Targeting</span>
                      </label>
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                        Shop Page
                      </span>
                    </div>

                    <select
                      value={formData.category}
                      onChange={(e) =>
                        setFormData({ ...formData, category: e.target.value })
                      }
                      className="w-full rounded-xl border border-indigo-200 bg-white py-2.5 px-4 text-sm font-semibold text-slate-800 outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 shadow-xs"
                    >
                      <option value="">Default Shop Banner — All Products (/products & Fallback)</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name} {cat.slug ? `(Slug: ${cat.slug})` : ""}
                        </option>
                      ))}
                    </select>

                    <p className="text-[11px] text-indigo-900/80 leading-relaxed">
                      Select which category’s shop page this banner belongs to. If left blank, it will serve as the default banner for the main <strong>/products</strong> page and act as the fallback for any categories without an individual banner.
                    </p>
                  </div>
                )}

                {/* 5. Title & CTA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Title / Label
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Summer Mega Sale"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData({ ...formData, title: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Call to Action (CTA Label)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., Shop Now, Explore"
                      value={formData.cta_text}
                      onChange={(e) =>
                        setFormData({ ...formData, cta_text: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                    />
                  </div>
                </div>

                {/* 6. Subtitle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Subtitle / Description
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Up to 40% off on all organic personal care essentials"
                    value={formData.subtitle}
                    onChange={(e) =>
                      setFormData({ ...formData, subtitle: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                  />
                </div>

                {/* 7. Destination Link */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Destination URL
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                      <LinkIcon className="h-4 w-4" />
                    </div>
                    <input
                      type="url"
                      placeholder="https://example.com/products or leave blank"
                      value={formData.link_url}
                      onChange={(e) =>
                        setFormData({ ...formData, link_url: e.target.value })
                      }
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 ml-1">
                    Full destination URL when clicked. Leave blank for a non-clickable banner.
                  </p>
                </div>

                {/* 8. Scheduling Section (start_at and end_at) */}
                <div className="bg-[#FCFAF7] border border-[#E6E4DD] rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                      <Calendar className="w-4 h-4 text-[#2C3B5E]" />
                      <span>Scheduling & Time Windows (Optional)</span>
                    </div>
                    {(formData.start_at || formData.end_at) && (
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, start_at: "", end_at: "" })
                        }
                        className="text-xs font-bold text-rose-600 hover:underline cursor-pointer"
                      >
                        Clear Schedule
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">
                    Set date/time window for when this banner should automatically appear and disappear on the storefront. Leave both blank for a banner that runs indefinitely.
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>Start Date & Time</span>
                        {formData.start_at && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, start_at: "" })
                            }
                            className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.start_at}
                        onChange={(e) =>
                          setFormData({ ...formData, start_at: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                      />
                      <span className="text-[10px] text-slate-400 block ml-1">
                        Banner hidden before this time
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                        <span>End Date & Time</span>
                        {formData.end_at && (
                          <button
                            type="button"
                            onClick={() =>
                              setFormData({ ...formData, end_at: "" })
                            }
                            className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold"
                          >
                            Remove
                          </button>
                        )}
                      </label>
                      <input
                        type="datetime-local"
                        value={formData.end_at}
                        onChange={(e) =>
                          setFormData({ ...formData, end_at: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 px-3 text-sm font-medium text-slate-800 outline-none focus:border-[#2C3B5E]"
                      />
                      <span className="text-[10px] text-slate-400 block ml-1">
                        Banner hidden after this time
                      </span>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70 shrink-0 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={submitting}
                className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="banner-form"
                disabled={submitting}
                className="px-6 py-2.5 text-sm font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-all cursor-pointer shadow-md shadow-[#2C3B5E]/10 flex items-center gap-2 disabled:opacity-50"
              >
                {submitting && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                <span>{editingBanner ? "Update Banner" : "Create Banner"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
