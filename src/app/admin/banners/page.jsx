"use client";

import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Plus, Edit, Trash2, Image as ImageIcon, Link as LinkIcon, CheckCircle, XCircle } from "lucide-react";
import { getAdminBannersApi, createBannerApi, updateBannerApi, deleteBannerApi } from "@/services/bannersApi";

export default function BannersPage() {
  const [activeTab, setActiveTab] = useState("home_hero"); // "home_hero" or "home_promo"
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    placement: "home_hero",
    title: "",
    subtitle: "",
    link_url: "",
    cta_text: "",
    imagePreview: null,
    imageFile: null,
    is_active: true,
    sort_order: 0,
  });

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const res = await getAdminBannersApi();
      if (res.status === 200) {
        const fetchedBanners = res.data.results || res.data.data || res.data;
        setBanners(Array.isArray(fetchedBanners) ? fetchedBanners : []);
      }
    } catch (err) {
      console.error("Failed to fetch banners", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleOpenModal = (banner = null) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        placement: banner.placement,
        title: banner.title || "",
        subtitle: banner.subtitle || "",
        link_url: banner.link_url || "",
        cta_text: banner.cta_text || "",
        imagePreview: banner.image,
        imageFile: null,
        mobileImagePreview: banner.mobile_image || null,
        mobileImageFile: null,
        is_active: banner.is_active,
        sort_order: banner.sort_order || 0,
      });
    } else {
      setEditingBanner(null);
      setFormData({
        placement: activeTab,
        title: "",
        subtitle: "",
        link_url: "",
        cta_text: "",
        imagePreview: null,
        imageFile: null,
        mobileImagePreview: null,
        mobileImageFile: null,
        is_active: true,
        sort_order: banners.filter(b => b.placement === activeTab).length,
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
    const submitData = new FormData();
    submitData.append("placement", formData.placement);
    submitData.append("title", formData.title);
    submitData.append("subtitle", formData.subtitle);
    submitData.append("link_url", formData.link_url);
    submitData.append("cta_text", formData.cta_text);
    submitData.append("is_active", formData.is_active);
    submitData.append("sort_order", formData.sort_order);
    
    if (formData.imageFile) {
      submitData.append("image", formData.imageFile);
    }
    if (formData.mobileImageFile) {
      submitData.append("mobile_image", formData.mobileImageFile);
    }

    const reqHeader = { "Content-Type": "multipart/form-data" };

    try {
      if (editingBanner) {
        const res = await updateBannerApi(editingBanner.id, submitData, reqHeader);
        if (res.status === 200) {
          fetchBanners();
          handleCloseModal();
        }
      } else {
        const res = await createBannerApi(submitData, reqHeader);
        if (res.status === 201) {
          fetchBanners();
          handleCloseModal();
        }
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to save banner.");
    }
  };

  const handleDeleteBanner = async (id) => {
    if (window.confirm("Are you sure you want to delete this banner?")) {
      try {
        const res = await deleteBannerApi(id);
        if (res.status === 204 || res.status === 200) {
          fetchBanners();
        }
      } catch (err) {
        console.error("Failed to delete", err);
      }
    }
  };

  const handleToggleStatus = async (banner) => {
    try {
      const submitData = new FormData();
      submitData.append("is_active", !banner.is_active);
      const res = await updateBannerApi(banner.id, submitData, { "Content-Type": "multipart/form-data" });
      if (res.status === 200) {
        fetchBanners();
      }
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const handleMobileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, mobileImagePreview: previewUrl, mobileImageFile: file });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setFormData({ ...formData, imagePreview: previewUrl, imageFile: file });
    }
  };

  const displayedBanners = banners.filter(b => b.placement === activeTab).sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Banner Management
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage banners and promotional images across your store
          </p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Banner</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveTab("home_hero")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "home_hero"
              ? "border-[#2C3B5E] text-[#2C3B5E]"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
          }`}
        >
          Home Hero
        </button>
        <button
          onClick={() => setActiveTab("home_promo")}
          className={`pb-3 px-4 text-sm font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "home_promo"
              ? "border-[#2C3B5E] text-[#2C3B5E]"
              : "border-transparent text-slate-400 hover:text-slate-600 hover:border-slate-300"
          }`}
        >
          Home Secondary Promo
        </button>
      </div>

      {/* Banners Grid */}
      {loading ? (
        <div className="flex justify-center py-12 text-slate-400">Loading banners...</div>
      ) : displayedBanners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedBanners.map(banner => (
            <div key={banner.id} className="bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col group">
              <div className="relative aspect-video bg-slate-50 border-b border-slate-100">
                <img 
                  src={banner.image || "https://via.placeholder.com/600x300?text=No+Image"} 
                  alt={banner.title} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button onClick={() => handleOpenModal(banner)} className="p-2 bg-white rounded-full text-slate-700 hover:text-[#2C3B5E] shadow-sm transform hover:scale-110 transition-all cursor-pointer">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDeleteBanner(banner.id)} className="p-2 bg-white rounded-full text-slate-700 hover:text-rose-500 shadow-sm transform hover:scale-110 transition-all cursor-pointer">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-3 right-3">
                   <button 
                     onClick={() => handleToggleStatus(banner)}
                     className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border cursor-pointer backdrop-blur-md shadow-sm ${
                       banner.is_active 
                         ? "bg-emerald-50/90 text-emerald-600 border-emerald-200" 
                         : "bg-slate-50/90 text-slate-500 border-slate-200"
                     }`}
                   >
                     {banner.is_active ? "Active" : "Inactive"}
                   </button>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-slate-800 text-lg truncate">{banner.title || "Untitled Banner"}</h3>
                <p className="text-sm text-slate-500 mt-1 line-clamp-2">{banner.subtitle || "No subtitle provided."}</p>
                <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2 text-xs text-slate-400 font-medium overflow-hidden">
                  <LinkIcon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{banner.link_url || "No link specified"}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border border-slate-100 shadow-xs border-dashed">
          <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-slate-300" />
          </div>
          <h3 className="text-lg font-bold text-slate-700">No Banners Found</h3>
          <p className="text-sm text-slate-400 font-medium mt-1">There are no banners set up for the {activeTab === "home_hero" ? "Home Hero" : "Home Promo"} placement yet.</p>
          <button 
            onClick={() => handleOpenModal()}
            className="mt-6 px-5 py-2.5 bg-[#2C3B5E] text-white text-sm font-bold rounded-xl shadow-md cursor-pointer hover:bg-[#1E2A47] transition-all"
          >
            Create Your First Banner
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <h2 className="text-lg font-bold text-[#2C3B5E]">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </h2>
              <button 
                onClick={handleCloseModal}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <XCircle className="w-5.5 h-5.5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1">
              <form id="banner-form" onSubmit={handleSaveBanner} className="space-y-6">
                
                {/* Image Upload Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Desktop Image (Required)</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center text-center transition-colors hover:border-[#2C3B5E] group h-full min-h-[200px]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        required={!editingBanner} // Image is required for new banners
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {formData.imagePreview ? (
                        <div className="relative w-full h-full p-2">
                           <img src={formData.imagePreview} alt="Preview" className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm" />
                           <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                              <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                                <Edit className="w-3.5 h-3.5"/> Change Image
                              </span>
                           </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 h-full">
                           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#2C3B5E] transition-colors">
                             <ImageIcon className="w-5 h-5" />
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm font-bold text-slate-700">Click to upload desktop image</p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">Mobile Image (Optional)</label>
                    <div className="relative border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50 overflow-hidden flex flex-col items-center justify-center text-center transition-colors hover:border-[#2C3B5E] group h-full min-h-[200px]">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleMobileImageChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      {formData.mobileImagePreview ? (
                        <div className="relative w-1/2 mx-auto h-full p-2 aspect-[9/16]">
                           <img src={formData.mobileImagePreview} alt="Mobile Preview" className="w-full h-full object-cover rounded-xl border border-slate-100 shadow-sm" />
                           <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-xl m-2">
                              <span className="bg-white text-slate-800 text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-2">
                                <Edit className="w-3.5 h-3.5"/> Change
                              </span>
                           </div>
                        </div>
                      ) : (
                        <div className="p-6 flex flex-col items-center justify-center gap-2 h-full">
                           <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-slate-400 group-hover:text-[#2C3B5E] transition-colors">
                             <ImageIcon className="w-5 h-5" />
                           </div>
                           <div className="space-y-1">
                             <p className="text-sm font-bold text-slate-700">Click to upload mobile image</p>
                           </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Placement</label>
                    <select
                      value={formData.placement}
                      onChange={(e) => setFormData({...formData, placement: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                    >
                      <option value="home_hero">Home Hero</option>
                      <option value="home_promo">Home Secondary Promo</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Status</label>
                    <select
                      value={formData.is_active.toString()}
                      onChange={(e) => setFormData({...formData, is_active: e.target.value === "true"})}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Title</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g., Summer Mega Sale"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Call to Action (CTA)</label>
                      <input
                        type="text"
                        placeholder="e.g., Shop Now"
                        value={formData.cta_text}
                        onChange={(e) => setFormData({...formData, cta_text: e.target.value})}
                        className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                      />
                    </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Subtitle / Description</label>
                  <input
                    type="text"
                    placeholder="e.g., Up to 50% off on all products"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Destination Link</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                      <LinkIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="e.g., /products?category=summer"
                      value={formData.link_url}
                      onChange={(e) => setFormData({...formData, link_url: e.target.value})}
                      className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                    />
                  </div>
                  <p className="text-[10px] font-medium text-slate-400 mt-1 ml-1">
                    Enter an absolute URL (e.g. https://example.com) or a relative path (e.g. /products).
                  </p>
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Sort Order</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.sort_order}
                    onChange={(e) => setFormData({...formData, sort_order: parseInt(e.target.value) || 0})}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                  />
                  <p className="text-[10px] font-medium text-slate-400 mt-1 ml-1">
                    Lower numbers will appear first.
                  </p>
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-slate-100 bg-slate-50/50 shrink-0 flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCloseModal}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer shadow-sm"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="banner-form"
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-colors cursor-pointer shadow-md shadow-[#2C3B5E]/10"
              >
                {editingBanner ? "Update Banner" : "Create Banner"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
