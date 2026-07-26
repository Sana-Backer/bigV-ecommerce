"use client";

import React, { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  ShieldAlert,
  ArrowLeft,
  AlertCircle
} from "lucide-react";
import {
  getStaffListApi,
  createStaffApi,
  updateUserApi,
  deactivateUserApi,
  changeUserRoleApi
} from "@/services/usersApi";

export default function AdminStaff() {
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [staffList, setStaffList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    role: "staff", // "staff" or "manager"
    password: "",
    is_active: true,
  });

  const fetchStaff = async () => {
    setIsLoading(true);
    try {
      const response = await getStaffListApi();
      if (response && response.status === 200 && response.data?.status === "success") {
        setStaffList(response.data.data);
      } else {
        setStaffList([]);
      }
    } catch (error) {
      console.error("Failed to fetch staff:", error);
      setStaffList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const resetForm = () => {
    setFormData({
      first_name: "",
      last_name: "",
      email: "",
      phone: "",
      role: "staff",
      password: "",
      is_active: true,
    });
    setEditingStaff(null);
    setViewMode("list");
  };

  const startEdit = (staff) => {
    setEditingStaff(staff);
    setFormData({
      first_name: staff.first_name || "",
      last_name: staff.last_name || "",
      email: staff.email || "",
      phone: staff.phone || "",
      role: staff.role || "staff",
      password: "", // Don't populate password on edit
      is_active: staff.is_active,
    });
    setViewMode("edit");
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to deactivate this staff member?")) return;
    try {
      const res = await deactivateUserApi(id);
      if (res && res.status === 200) {
        alert("Staff deactivated successfully.");
        fetchStaff();
      } else {
        alert(res?.data?.message || "Failed to deactivate staff.");
      }
    } catch (err) {
      console.error(err);
      alert("Error deactivating staff.");
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (viewMode === "add") {
        const payload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          role: formData.role,
          is_active: formData.is_active,
        };
        const res = await createStaffApi(payload);
        if (res && (res.status === 201 || res.status === 200) && res.data?.status === "success") {
          alert("Staff created successfully!");
          resetForm();
          fetchStaff();
        } else {
          alert(res?.response?.data?.message || res?.data?.message || "Failed to create staff.");
        }
      } else if (viewMode === "edit" && editingStaff) {
        // Update user basic details
        const updatePayload = {
          first_name: formData.first_name,
          last_name: formData.last_name,
          phone: formData.phone,
          is_active: formData.is_active,
        };
        const res = await updateUserApi(editingStaff.id, updatePayload);

        if (res && res.status === 200 && res.data?.status === "success") {
          // If role changed, update it separately (assuming Admin access or allowed)
          if (formData.role !== editingStaff.role) {
            try {
              await changeUserRoleApi(editingStaff.id, formData.role);
            } catch (roleErr) {
              console.error("Failed to update role:", roleErr);
              alert("Basic details updated, but failed to update role (requires Admin).");
            }
          }
          alert("Staff updated successfully!");
          resetForm();
          fetchStaff();
        } else {
          alert(res?.response?.data?.message || res?.data?.message || "Failed to update staff.");
        }
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "An error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const filteredStaff = staffList.filter((s) => {
    const search = searchTerm.toLowerCase();
    return (
      (s.first_name?.toLowerCase().includes(search) || "") ||
      (s.last_name?.toLowerCase().includes(search) || "") ||
      (s.email?.toLowerCase().includes(search) || "")
    );
  });

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-500">
        <button
          onClick={resetForm}
          className="flex items-center gap-2 text-slate-500 hover:text-[#2C3B5E] transition-colors font-semibold mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Staff List</span>
        </button>

        <div className="bg-white rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden">
          <div className="bg-gradient-to-r from-[#2C3B5E] to-[#1E2A47] p-8 text-white">
            <h2 className="text-2xl font-extrabold tracking-tight">
              {viewMode === "add" ? "Add New Staff Member" : "Edit Staff Member"}
            </h2>
            <p className="text-blue-100 font-medium mt-1 text-sm">
              {viewMode === "add"
                ? "Create a new manager or staff account."
                : `Update details for ${editingStaff?.email}`}
            </p>
          </div>

          <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  First Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
                  placeholder="e.g. Jane"
                />
              </div>

              {/* Last Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Last Name
                </label>
                <input
                  type="text"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
                  placeholder="e.g. Doe"
                />
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Email Address <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  required
                  disabled={viewMode === "edit"}
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="jane@lumora.com"
                />
              </div>

              {/* Phone */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
                  placeholder="+91 98765 43210"
                />
              </div>

              {/* Role */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  System Role <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
                >
                  <option value="staff">Staff</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {/* Password */}
              {viewMode === "add" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Password <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    minLength={8}
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm font-semibold outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E]"
                    placeholder="Min. 8 characters"
                  />
                </div>
              )}
            </div>

            {/* Status Toggle */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                className="w-4 h-4 text-[#2C3B5E] rounded focus:ring-[#2C3B5E]"
              />
              <label htmlFor="is_active" className="text-sm font-bold text-slate-700 select-none cursor-pointer">
                Account is Active
              </label>
            </div>

            <div className="pt-6 border-t border-slate-100 flex justify-end gap-4">
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-3 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 text-sm font-bold text-white bg-[#2C3B5E] hover:bg-[#1E2A47] rounded-xl transition-all shadow-md shadow-[#2C3B5E]/20 cursor-pointer disabled:opacity-70 flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <ShieldAlert className="w-4 h-4" />
                )}
                <span>{viewMode === "add" ? "Create Staff" : "Save Changes"}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Staff Management
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage admin users, roles, and access permissions
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode("add")}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search staff by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] font-medium"
          />
        </div>
      </div>

      {/* Staff Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                <th className="py-4.5 px-6">User Details</th>
                <th className="py-4.5 px-6">Role</th>
                <th className="py-4.5 px-6">Phone</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* User Details */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-sm shrink-0 border border-indigo-100">
                          {staff.first_name ? staff.first_name[0].toUpperCase() : (staff.email[0].toUpperCase())}
                        </div>
                        <div>
                          <span className="text-slate-800 font-bold block">
                            {staff.first_name || staff.last_name
                              ? `${staff.first_name || ""} ${staff.last_name || ""}`.trim()
                              : "No Name"}
                          </span>
                          <span className="text-xs text-slate-400 font-medium block mt-0.5">{staff.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase ${staff.role === 'admin' ? 'bg-purple-50 text-purple-600' :
                          staff.role === 'manager' ? 'bg-blue-50 text-blue-600' :
                            'bg-slate-100 text-slate-600'
                        }`}>
                        {staff.role}
                      </span>
                    </td>

                    {/* Phone */}
                    <td className="py-4.5 px-6 text-slate-500 font-medium">
                      {staff.phone || "—"}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${staff.is_active ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600"
                        }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${staff.is_active ? "bg-emerald-500" : "bg-rose-500"}`}></span>
                        {staff.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit button */}
                        <button
                          onClick={() => startEdit(staff)}
                          className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="Edit Staff"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        {/* Delete/Deactivate button */}
                        <button
                          onClick={() => handleDelete(staff.id)}
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          title="Deactivate Staff"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-bold">No staff members found</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
          <span>Showing {filteredStaff.length} of {staffList.length} staff</span>
        </div>
      </div>
    </div>
  );
}
