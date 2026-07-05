"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  AlertCircle,
  ArrowLeft,
  Upload,
  X,
  ChevronLeft,
  ChevronRight,
  FolderTree
} from "lucide-react";
import {
  addCategoryApi,
  getCategoriesApi,
  updateCategoryApi,
  deleteCategoryApi
} from "@/services/categoryApi";

export default function CategoryManagement() {
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedParent, setSelectedParent] = useState("All");
  const [isLoading, setIsLoading] = useState(false);
  
  // Initial categories matching the user's screenshot as backup fallback
  const initialCategories = [
    {
      id: "cat-1",
      name: "Skincare",
      description: "Premium dermatological solutions for all skin types.",
      products: 124,
      isActive: true,
      image: "/category3.png",
      parent: null,
    }
  ];

  const [categoryList, setCategoryList] = useState([]);
  const [editingCategory, setEditingCategory] = useState(null);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    parent: "",
    isActive: true,
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const fileInputRef = useRef(null);

  const fetchCategories = async () => {
    setIsLoading(true);
    try {
      const response = await getCategoriesApi();
      if (response && response.status === 200 && response.data?.status === "success") {
        setCategoryList(response.data.data);
        console.log(response.data);
        
      } else {
        setCategoryList(initialCategories);
      }
    } catch (error) {
      console.error("Failed to fetch categories from API:", error);
      setCategoryList(initialCategories);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleImageChange = (file) => {
    if (file) {
      setImageFile(file);
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);
    const data = new FormData();
    data.append("name", formData.name);
    data.append("description", formData.description);
    if (formData.parent) {
      data.append("parent", formData.parent);
    }
    data.append("is_active", formData.isActive);
    if (imageFile) {
      data.append("image", imageFile);
    }

    const headers = {
      "Content-Type": "multipart/form-data",
    };

    try {
      if (viewMode === "add") {
        const response = await addCategoryApi(data, headers);
        if (response && (response.status === 201 || response.status === 200)) {
          alert("Category created successfully!");
          console.log(response);
          
        } else {
          // Fallback local addition if api isn't connected
          const newCategory = {
            id: `cat-${Date.now()}`,
            name: formData.name,
            description: formData.description,
            products: 0,
            isActive: formData.isActive,
            image: imagePreview || "/category3.png",
            parent: formData.parent ? formData.parent : null,
          };
          setCategoryList([newCategory, ...categoryList]);
        }
      } else if (viewMode === "edit" && editingCategory) {
        const response = await updateCategoryApi(editingCategory.id, data, headers);
        if (response && response.status === 200) {
          alert("Category updated successfully!");
        } else {
          // Fallback local update
          setCategoryList(
            categoryList.map((cat) =>
              cat.id === editingCategory.id
                ? {
                    ...cat,
                    name: formData.name,
                    description: formData.description,
                    isActive: formData.isActive,
                    image: imagePreview || cat.image,
                    parent: formData.parent ? formData.parent : null,
                  }
                : cat
            )
          );
        }
      }
    } catch (error) {
      console.error("Error saving category via API:", error);
      alert("API request failed. Saving changes locally as fallback.");
      // Fallback local updates
      if (viewMode === "add") {
        const newCategory = {
          id: `cat-${Date.now()}`,
          name: formData.name,
          description: formData.description,
          products: 0,
          isActive: formData.isActive,
          image: imagePreview || "/category3.png",
          parent: formData.parent ? formData.parent : null,
        };
        setCategoryList([newCategory, ...categoryList]);
      } else {
        setCategoryList(
          categoryList.map((cat) =>
            cat.id === editingCategory.id
              ? {
                  ...cat,
                  name: formData.name,
                  description: formData.description,
                  isActive: formData.isActive,
                  image: imagePreview || cat.image,
                  parent: formData.parent ? formData.parent : null,
                }
              : cat
          )
        );
      }
    } finally {
      setIsLoading(false);
      resetForm();
      fetchCategories();
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      parent: "",
      isActive: true,
    });
    setImagePreview(null);
    setImageFile(null);
    setEditingCategory(null);
    setViewMode("list");
  };

  const startEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parent: category.parent || "",
      isActive: category.isActive ?? category.is_active ?? true,
    });
    setImagePreview(category.image);
    setViewMode("edit");
  };

  const deleteCategory = async (id) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      setIsLoading(true);
      try {
        const response = await deleteCategoryApi(id);
        if (response && (response.status === 204 || response.status === 200)) {
          alert("Category deleted successfully!");
        } else {
          setCategoryList(categoryList.filter((cat) => cat.id !== id));
        }
      } catch (error) {
        console.error("Failed to delete category via API:", error);
        alert("API request failed. Deleting locally as fallback.");
        setCategoryList(categoryList.filter((cat) => cat.id !== id));
      } finally {
        setIsLoading(false);
        fetchCategories();
      }
    }
  };

  // Filter logic
  const filteredCategories = categoryList.filter((cat) => {
    const matchesSearch =
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesParent =
      selectedParent === "All" ||
      (selectedParent === "None" && !cat.parent) ||
      cat.parent === selectedParent;
    return matchesSearch && matchesParent;
  });

  // Unique parents list for filter options
  const parentOptions = categoryList.filter((cat) => !cat.parent);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
      
      {viewMode === "list" ? (
        <>
          {/* Page Header */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-[#2C3B5E] ">
                Category Management
              </h1>
              <p className="text-sm font-medium text-slate-400">
                Organize and curate your boutique's product taxonomy with precision and elegance.
              </p>
            </div>
            <button
              onClick={() => setViewMode("add")}
              className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
            </button>
          </div>

          {/* Search & Filter Bar */}
          <div className="  flex flex-col md:flex-row gap-4 justify-between items-center">
            {/* Search */}
            <div className="relative w-full md:max-w-md">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="search"
                placeholder="Search categories by name or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] font-medium"
              />
            </div>

            {/* Parent Filter */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Hierarchy:</span>
              <select
                value={selectedParent}
                onChange={(e) => setSelectedParent(e.target.value)}
                className="rounded-xl border border-slate-200 bg-white py-2 px-3 text-xs outline-none transition-all focus:border-[#2C3B5E] font-bold text-slate-600"
              >
                <option value="All">All Categories</option>
                <option value="None">Root Categories</option>
                {parentOptions.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    Under {opt.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Categories Table Card */}
          <div className="rounded-xl border border-slate-100 bg-white shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                    <th className="py-4.5 px-6 w-1/4">Category</th>
                    <th className="py-4.5 px-6 w-2/5">Description</th>
                    <th className="py-4.5 px-6 text-center">Products</th>
                    <th className="py-4.5 px-6 text-center">Status</th>
                    <th className="py-4.5 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
                  {filteredCategories.length > 0 ? (
                    filteredCategories.map((category) => (
                      <tr key={category.id} className="hover:bg-slate-50/50 transition-colors">
                        {/* Category Name & Image */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-3.5">
                            <div className="w-12 h-12 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border border-slate-100 shrink-0">
                              <img
                                src={category.image}
                                alt={category.name}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  e.target.style.display = "none";
                                  e.target.parentNode.className = "w-12 h-12 rounded-xl bg-[#2C3B5E]/10 flex items-center justify-center font-bold text-xs text-[#2C3B5E]";
                                  e.target.parentNode.innerText = category.name.slice(0, 2).toUpperCase();
                                }}
                              />
                            </div>
                            <div>
                              <span className="text-slate-800 font-bold block">{category.name}</span>
                              {category.parent && (
                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                  <FolderTree className="w-3 h-3 text-[#2C3B5E]" /> Sub-category
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Description */}
                        <td className="py-4.5 px-6">
                          <span className="text-slate-500 font-medium line-clamp-2 leading-relaxed">
                            {category.description || "No description provided."}
                          </span>
                        </td>

                        {/* Products count in custom rust/terracotta color */}
                        <td className="py-4.5 px-6 text-center">
                          <span className="font-extrabold text-[#B35C4A] text-base">
                            {category.products}
                          </span>
                        </td>

                        {/* Status Active/Inactive pill */}
                        <td className="py-4.5 px-6 text-center">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${
                              category.isActive
                                ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {category.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>

                        {/* Action buttons */}
                        <td className="py-4.5 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => startEdit(category)}
                              className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                              title="Edit Category"
                            >
                              <Edit className="w-4.5 h-4.5" />
                            </button>
                            <button
                              onClick={() => deleteCategory(category.id)}
                              className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                              title="Delete Category"
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
                          <span className="font-bold">No categories found matching filters</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination mirroring the screenshot */}
            <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
              <span>Showing {filteredCategories.length} of {categoryList.length} categories</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-pointer disabled:opacity-40"
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setCurrentPage(1)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === 1 ? "bg-[#2C3B5E] text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  1
                </button>
                <button
                  onClick={() => setCurrentPage(2)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === 2 ? "bg-[#2C3B5E] text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  2
                </button>
                <button
                  onClick={() => setCurrentPage(3)}
                  className={`w-7 h-7 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                    currentPage === 3 ? "bg-[#2C3B5E] text-white" : "border border-slate-200 hover:bg-slate-50 text-slate-600"
                  }`}
                >
                  3
                </button>
                <button
                  onClick={() => setCurrentPage((p) => p + 1)}
                  className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-400 cursor-pointer"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        /* Add & Edit views */
        <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={resetForm}
                className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-800 mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-[#2C3B5E] tracking-tight">
                Category Management{" "}
                <span className="text-[#8D96A0] font-normal">
                  / {viewMode === "add" ? "Add Category" : "Edit Category"}
                </span>
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-[#2C3B5E]">Category Active</span>
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, isActive: !prev.isActive }))}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  formData.isActive ? "bg-[#2C3B5E]" : "bg-slate-200"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    formData.isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            {/* Left Column: Form Details */}
            <div className="space-y-6 bg-white rounded-3xl border border-slate-100 p-6 shadow-xs">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
                Category Details
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter category name (e.g. Skincare, Fragrance)"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium"
                />
                {formData.name && (
                  <span className="text-[11px] font-medium text-slate-400 mt-1 block">
                    URL Slug Preview (Auto-generated on save): <span className="font-bold text-[#2C3B5E]">{formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")}</span>
                  </span>
                )}
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter category description..."
                  value={formData.description}
                  onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Parent Category (Optional)</label>
                <select
                  value={formData.parent}
                  onChange={(e) => setFormData((prev) => ({ ...prev, parent: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:ring-1 focus:ring-[#2C3B5E] font-medium capitalize"
                >
                  <option value="">None (Root Category)</option>
                  {categoryList
                    .filter((cat) => !cat.parent && cat.id !== editingCategory?.id)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Form Action buttons */}
              <div className="flex gap-4 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-sm font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-colors cursor-pointer text-center shadow-md shadow-[#2C3B5E]/10"
                >
                  {viewMode === "add" ? "Save Category" : "Update Category"}
                </button>
              </div>
            </div>

            {/* Right Column: Category Banner/Image */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
                Category Image
              </h2>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-600 block">Thumbnail / Cover Image</label>

                <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl h-52 flex flex-col items-center justify-center p-4 text-center transition-colors hover:border-[#2C3B5E] bg-slate-50/50">
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={(e) => handleImageChange(e.target.files[0])}
                    className="hidden"
                    id="category-image-file"
                  />

                  {imagePreview ? (
                    <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden p-2 bg-white">
                      <img
                        src={imagePreview}
                        alt="Category Preview"
                        className="w-full h-full object-cover rounded-xl"
                      />
                      <button
                        type="button"
                        onClick={removeImage}
                        className="absolute top-4.5 right-4.5 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1.5 shadow-md transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <label
                      htmlFor="category-image-file"
                      className="cursor-pointer flex flex-col items-center gap-2 h-full justify-center w-full select-none"
                    >
                      <Upload className="w-8 h-8 text-slate-400 group-hover:text-[#2C3B5E] transition-colors" />
                      <span className="text-xs text-slate-400 font-medium">Drag and drop category image here</span>
                      <span className="text-xs font-bold text-[#2C3B5E] hover:underline">Browse Files</span>
                    </label>
                  )}
                </div>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
