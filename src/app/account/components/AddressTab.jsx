"use client";

import React, { useState, useEffect } from "react";
import { getMyAddressesApi, addMyAddressApi, updateMyAddressApi, deleteMyAddressApi, patchMyAddressApi } from "@/services/auth";
import { Loader2, Plus, Edit2, Trash2, MapPin, X, CheckCircle, AlertCircle } from "lucide-react";

export default function AddressTab() {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "success" });

  const showNotification = (message, type = "success") => {
    setNotification({ message, type });
    setTimeout(() => setNotification({ message: "", type: "success" }), 3500);
  };

  const [formData, setFormData] = useState({
    label: "",
    address_type: "both",
    full_name: "",
    phone: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    postal_code: "",
    country: "India",
    is_default: false,
  });

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const res = await getMyAddressesApi();
      if (res.status === 200) {
        setAddresses(res.data?.data || res.data || []);
      }
    } catch (err) {
      console.error("Error fetching addresses", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (address = null) => {
    if (address) {
      setEditingId(address.id);
      setFormData({
        label: address.label || "",
        address_type: address.address_type || "both",
        full_name: address.full_name || "",
        phone: address.phone || "",
        line1: address.line1 || "",
        line2: address.line2 || "",
        city: address.city || "",
        state: address.state || "",
        postal_code: address.postal_code || "",
        country: address.country || "India",
        is_default: address.is_default || false,
      });
    } else {
      setEditingId(null);
      setFormData({
        label: "",
        address_type: "both",
        full_name: "",
        phone: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postal_code: "",
        country: "India",
        is_default: false,
      });
    }
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const value = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let res;
      if (editingId) {
        res = await updateMyAddressApi(editingId, formData);
      } else {
        res = await addMyAddressApi(formData);
      }
      if (res.status === 200 || res.status === 201) {
        setModalOpen(false);
        showNotification(editingId ? "Address updated successfully" : "Address added successfully", "success");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to save address", err);
      showNotification(err.response?.data?.message || "Failed to save address", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure you want to delete this address?")) {
      try {
        const res = await deleteMyAddressApi(id);
        if (res.status === 200 || res.status === 204) {
          showNotification("Address deleted successfully", "success");
          fetchAddresses();
        }
      } catch (err) {
        console.error("Failed to delete address", err);
        showNotification("Failed to delete address", "error");
      }
    }
  };

  const handleSetDefault = async (id) => {
    try {
      const res = await patchMyAddressApi(id, { is_default: true });
      if (res.status === 200) {
        showNotification("Default address updated", "success");
        fetchAddresses();
      }
    } catch (err) {
      console.error("Failed to set default", err);
      showNotification("Failed to set default address", "error");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="animate-spin text-[#2C332E]" size={32} />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-serif text-slate-800">My Addresses</h2>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 bg-[#2C332E] text-white px-5 py-2.5 rounded-xl font-semibold hover:bg-[#1A1F1B] transition-colors"
        >
          <Plus size={18} />
          Add New
        </button>
      </div>

      {addresses.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-12 text-center flex flex-col items-center">
          <MapPin size={48} className="text-slate-300 mb-4" />
          <h3 className="text-lg font-bold text-slate-700 mb-2">No addresses found</h3>
          <p className="text-slate-500 mb-6 max-w-sm mx-auto">
            You haven't saved any addresses yet. Add one now to speed up checkout.
          </p>
          <button
            onClick={() => handleOpenModal()}
            className="text-[#2C332E] font-bold border-2 border-[#2C332E] px-6 py-2 rounded-xl hover:bg-[#2C332E] hover:text-white transition-colors"
          >
            Add Address
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {addresses.map((addr) => (
            <div
              key={addr.id}
              className={`relative bg-white rounded-2xl shadow-sm border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                addr.is_default ? "border-emerald-500 ring-1 ring-emerald-500" : "border-slate-100"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="font-extrabold text-slate-800 text-lg">
                      {addr.full_name}
                    </h3>
                    {addr.label && (
                      <span className="bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-widest">
                        {addr.label}
                      </span>
                    )}
                  </div>
                  {addr.is_default && (
                    <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-wider">
                      <CheckCircle size={12} />
                      Default
                    </span>
                  )}
                </div>
                
                <div className="text-slate-500 text-sm space-y-1 mb-4 leading-relaxed font-medium">
                  <p>{addr.line1}</p>
                  {addr.line2 && <p>{addr.line2}</p>}
                  <p>
                    {addr.city}, {addr.state} {addr.postal_code}
                  </p>
                  <p>{addr.country}</p>
                  {addr.phone && <p className="pt-2 text-slate-600 font-semibold flex items-center gap-2">📞 {addr.phone}</p>}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleOpenModal(addr)}
                    className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                  >
                    <Edit2 size={14} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(addr.id)}
                    className="flex items-center gap-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg transition-colors text-xs font-bold"
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                
                {!addr.is_default && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="text-slate-500 hover:text-slate-800 text-xs font-bold underline underline-offset-4 decoration-slate-300 hover:decoration-slate-800 transition-all"
                  >
                    Set as Default
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Address Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-0">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
          <div className="relative bg-white rounded-3xl w-full max-w-2xl shadow-2xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
              <h3 className="text-xl font-bold text-slate-800">
                {editingId ? "Edit Address" : "Add New Address"}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <div className="overflow-y-auto px-8 py-6 custom-scrollbar">
              <form id="address-form" onSubmit={handleSubmit} className="space-y-5">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Full Name *</label>
                    <input required type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Phone Number *</label>
                    <input required type="text" name="phone" placeholder="+91..." value={formData.phone} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 1 *</label>
                  <input required type="text" name="line1" value={formData.line1} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Line 2</label>
                  <input type="text" name="line2" value={formData.line2} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">City *</label>
                    <input required type="text" name="city" value={formData.city} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">State *</label>
                    <input required type="text" name="state" value={formData.state} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5 sm:col-span-1 col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pincode *</label>
                    <input required type="text" name="postal_code" value={formData.postal_code} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 pt-2">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Label</label>
                    <input type="text" name="label" placeholder="e.g. Home, Office" value={formData.label} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Address Type</label>
                    <select name="address_type" value={formData.address_type} onChange={handleChange} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500">
                      <option value="both">Both (Shipping & Billing)</option>
                      <option value="shipping">Shipping Only</option>
                      <option value="billing">Billing Only</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <input
                    type="checkbox"
                    id="is_default"
                    name="is_default"
                    checked={formData.is_default}
                    onChange={handleChange}
                    className="w-5 h-5 text-indigo-600 rounded focus:ring-indigo-500 border-slate-300"
                  />
                  <label htmlFor="is_default" className="text-sm font-semibold text-slate-700 cursor-pointer">
                    Set as default address
                  </label>
                </div>
              </form>
            </div>
            
            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex justify-end gap-3 shrink-0 rounded-b-3xl">
              <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 hover:bg-slate-200 transition-colors">
                Cancel
              </button>
              <button form="address-form" type="submit" disabled={submitting} className="flex items-center gap-2 bg-[#2C332E] text-white px-8 py-2.5 rounded-xl font-bold hover:bg-[#1A1F1B] transition-colors disabled:opacity-70">
                {submitting && <Loader2 className="animate-spin" size={16} />}
                {submitting ? "Saving..." : "Save Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Notification Toast */}
      {notification.message && (
        <div className={`fixed bottom-6 right-6 z-[100] py-4 px-6 rounded-xl shadow-[0_20px_50px_rgba(45,49,80,0.25)] flex items-center gap-3 animate-fade-in border ${
          notification.type === 'success' 
            ? 'bg-[#2d3150] text-[#F0D4DD] border-[#F0D4DD]/20' 
            : 'bg-red-50 text-red-600 border-red-200'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-[#C18386]" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          <span className="text-sm font-medium tracking-wide">{notification.message}</span>
        </div>
      )}
    </div>
  );
}
