"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  ShoppingBag,
  Layers,
  CheckCircle,
  AlertCircle,
  ArrowLeft,
  Upload,
  X
} from "lucide-react";
import Link from "next/link";
import { addProductApi, getProductsApi, getProductDetailApi, updateProductApi, addProductImageApi, addProductVariantApi, updateProductVariantApi } from "@/services/productsApi";
import { getCategoriesApi } from "@/services/categoryApi";

export default function AdminProducts() {
  const [viewMode, setViewMode] = useState("list"); // "list" | "add" | "edit"
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  const [productList, setProductList] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [detailProduct, setDetailProduct] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "399.00",
    stock: "0",
    category: "",
    isActive: true,
  });

  const [images, setImages] = useState({
    main: null,
    close: null,
    other1: null,
    other2: null,
    other3: null,
    other4: null,
  });

  const [imageFiles, setImageFiles] = useState({
    main: null,
    close: null,
    other1: null,
    other2: null,
    other3: null,
    other4: null,
  });

  // File input refs
  const fileRefs = {
    main: useRef(null),
    close: useRef(null),
    other1: useRef(null),
    other2: useRef(null),
    other3: useRef(null),
    other4: useRef(null),
  };

  const fetchCategories = async () => {
    try {
      const response = await getCategoriesApi();
      if (response && response.status === 200 && response.data?.status === "success") {
        setCategoriesList(response.data.data);
        if (response.data.data.length > 0) {
          setFormData(prev => ({ ...prev, category: response.data.data[0].id }));
        }
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error);
    }
  };

  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const response = await getProductsApi();
      if (response && response.status === 200 && response.data?.status === "success") {
        const mapped = response.data.data.map(product => {
          // If variants exist, calculate stock and status dynamically
          let stock = 0;
          if (product.variants && product.variants.length > 0) {
            stock = product.variants.reduce((acc, curr) => acc + (curr.stock_quantity || 0), 0);
          } else {
            stock = product.in_stock ? 50 : 0;
          }
          return {
            id: product.id,
            name: product.name,
            price: `₹${product.base_price}`,
            image: product.primary_image || "/product1.png",
            category: product.category ? product.category.name : "",
            stock: stock,
            status: stock > 0 ? "In Stock" : "Out of Stock",
            statusClass: stock > 0 ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
            isActive: product.is_active
          };
        });
        setProductList(mapped);
      } else {
        setProductList([]);
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
      setProductList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleImageChange = (key, file) => {
    if (file) {
      const url = URL.createObjectURL(file);
      setImages((prev) => ({ ...prev, [key]: url }));
      setImageFiles((prev) => ({ ...prev, [key]: file }));
    }
  };

  const removeImage = (key) => {
    setImages((prev) => ({ ...prev, [key]: null }));
    setImageFiles((prev) => ({ ...prev, [key]: null }));
    if (fileRefs[key].current) {
      fileRefs[key].current.value = "";
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "399.00",
      stock: "0",
      category: categoriesList[0]?.id || "",
      isActive: true,
    });
    setImages({
      main: null,
      close: null,
      other1: null,
      other2: null,
      other3: null,
      other4: null,
    });
    setImageFiles({
      main: null,
      close: null,
      other1: null,
      other2: null,
      other3: null,
      other4: null,
    });
    setEditingProduct(null);
    setViewMode("list");
  };

  const startEdit = async (product) => {
    setIsLoading(true);
    try {
      const response = await getProductDetailApi(product.id);
      if (response && response.status === 200 && response.data?.status === "success") {
        const prodDetail = response.data.data;
        setEditingProduct(prodDetail);
        
        const defaultVariant = prodDetail.variants?.find(v => v.is_default) || prodDetail.variants?.[0];
        const stockQty = defaultVariant ? defaultVariant.stock_quantity.toString() : "0";

        setFormData({
          name: prodDetail.name,
          description: prodDetail.description || "",
          price: prodDetail.base_price.toString(),
          stock: stockQty,
          category: prodDetail.category ? prodDetail.category.id : "",
          isActive: prodDetail.is_active,
        });

        const newImages = {
          main: null,
          close: null,
          other1: null,
          other2: null,
          other3: null,
          other4: null,
        };
        
        if (prodDetail.images && prodDetail.images.length > 0) {
          prodDetail.images.forEach((imgObj, idx) => {
            const keys = ["main", "close", "other1", "other2", "other3", "other4"];
            if (idx < keys.length) {
              newImages[keys[idx]] = imgObj.image;
            }
          });
        }
        setImages(newImages);
        setImageFiles({
          main: null,
          close: null,
          other1: null,
          other2: null,
          other3: null,
          other4: null,
        });

        setViewMode("edit");
      } else {
        alert("Failed to fetch product details.");
      }
    } catch (err) {
      console.error("Failed to load product for editing:", err);
      alert("An error occurred while fetching product details.");
    } finally {
      setIsLoading(false);
    }
  };

  const showProductDetails = async (productId) => {
    setIsLoading(true);
    try {
      const response = await getProductDetailApi(productId);
      if (response && response.status === 200 && response.data?.status === "success") {
        setDetailProduct(response.data.data);
        setActiveImageIndex(0);
      } else {
        alert("Failed to fetch product details.");
      }
    } catch (err) {
      console.error("Failed to load product details:", err);
      alert("Error loading product details.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setIsLoading(true);

    const cleanPrice = formData.price.replace(/[^\d.]/g, "");
    const basePrice = parseFloat(cleanPrice) || 0.0;
    const sku = editingProduct
      ? editingProduct.sku
      : `PROD-${formData.name.toUpperCase().replace(/[^A-Z0-9]/g, "")}-${Date.now().toString().slice(-4)}`;

    const reqBody = {
      category: formData.category,
      name: formData.name,
      sku: sku,
      brand: "Lumora",
      description: formData.description || "",
      short_description: formData.description ? formData.description.slice(0, 150) : "",
      base_price: basePrice.toFixed(2),
      sale_price: null,
      is_featured: false,
      is_active: formData.isActive
    };

    try {
      if (viewMode === "add") {
        const response = await addProductApi(reqBody);
        if (response && (response.status === 201 || response.status === 200)) {
          const createdProduct = response.data.data;
          const createdProductId = createdProduct.id;

          // 1. Create default product variant with stock & price
          const stockNum = parseInt(formData.stock) || 0;
          const variantBody = {
            name: "Default Variant",
            sku: `${sku}-DEF`,
            attributes: { size: "Default" },
            price: basePrice.toFixed(2),
            sale_price: null,
            stock_quantity: stockNum,
            weight: "0.100",
            is_default: true,
            is_active: true
          };

          try {
            await addProductVariantApi(createdProductId, variantBody);
          } catch (vErr) {
            console.error("Failed to create default variant:", vErr);
          }

          // 2. Upload images sequentially if any to prevent database lock issues
          for (const [key, file] of Object.entries(imageFiles)) {
            if (file !== null) {
              const imageKeys = ["main", "close", "other1", "other2", "other3", "other4"];
              const slotIndex = imageKeys.indexOf(key);
              const sortOrder = slotIndex >= 0 ? slotIndex : 0;

              const imageData = new FormData();
              imageData.append("image", file);
              imageData.append("alt_text", `${formData.name} ${key}`);
              imageData.append("sort_order", sortOrder);

              const imageHeaders = {
                "Content-Type": "multipart/form-data",
              };

              try {
                await addProductImageApi(createdProductId, imageData, imageHeaders);
              } catch (err) {
                console.error(`Failed to upload ${key} image:`, err);
              }
            }
          }

          alert("Product created successfully!");
          fetchProducts();
        } else {
          alert("Failed to save product to the server.");
        }
      } else if (viewMode === "edit" && editingProduct) {
        const response = await updateProductApi(editingProduct.id, reqBody);
        if (response && (response.status === 200 || response.status === 204)) {
          
          // 1. Update default variant if exists
          const defaultVariant = editingProduct.variants?.find(v => v.is_default) || editingProduct.variants?.[0];
          if (defaultVariant) {
            const stockNum = parseInt(formData.stock) || 0;
            const variantBody = {
              name: defaultVariant.name || "Default Variant",
              sku: defaultVariant.sku || `${sku}-DEF`,
              attributes: defaultVariant.attributes || { size: "Default" },
              price: basePrice.toFixed(2),
              sale_price: null,
              stock_quantity: stockNum,
              weight: defaultVariant.weight || "0.100",
              is_default: true,
              is_active: true
            };

            try {
              await updateProductVariantApi(defaultVariant.id, variantBody);
            } catch (vErr) {
              console.error("Failed to update product variant:", vErr);
            }
          }

          // 2. Upload images sequentially if any new ones are selected
          for (const [key, file] of Object.entries(imageFiles)) {
            if (file !== null) {
              const imageKeys = ["main", "close", "other1", "other2", "other3", "other4"];
              const slotIndex = imageKeys.indexOf(key);
              const sortOrder = slotIndex >= 0 ? slotIndex : 0;

              const imageData = new FormData();
              imageData.append("image", file);
              imageData.append("alt_text", `${formData.name} ${key}`);
              imageData.append("sort_order", sortOrder);

              const imageHeaders = {
                "Content-Type": "multipart/form-data",
              };

              try {
                await addProductImageApi(editingProduct.id, imageData, imageHeaders);
              } catch (err) {
                console.error(`Failed to upload ${key} image:`, err);
              }
            }
          }

          alert("Product updated successfully!");
          fetchProducts();
        } else {
          alert("Failed to update product on the server.");
        }
      }
    } catch (error) {
      console.error("Error saving product:", error);
      alert("API request failed. Failed to save product.");
    } finally {
      setIsLoading(false);
      resetForm();
    }
  };

  // Filter products based on search term and category
  const filteredProducts = productList.filter((prod) => {
    const matchesSearch = prod.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prod.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "All" || prod.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const categories = ["All", ...categoriesList.map(c => c.name.toLowerCase())];

  if (viewMode === "add" || viewMode === "edit") {
    return (
      <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
        {/* Header with toggle */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <button 
              onClick={resetForm}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-800 mr-1"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-2xl font-bold text-[#553C9A] tracking-tight">
              Product Management{" "}
              <span className="text-[#8D96A0] font-normal">
                / {viewMode === "add" ? "Add Product" : "Edit Product"}
              </span>
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm font-bold text-[#553C9A]">Product Active</span>
            <button
              onClick={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formData.isActive ? "bg-[#553C9A]" : "bg-slate-200"
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

        {/* Form Container */}
        <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          
          {/* Left Column */}
          <div className="space-y-6">
            {/* Basic Information Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
                Basic Information
              </h2>
              
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="Enter product name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Description</label>
                <textarea
                  rows={4}
                  placeholder="Enter product description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium resize-none"
                />
              </div>
            </div>

            {/* Price & Stock Card */}
            <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
              <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
                Price & Inventory
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Price (₹)</label>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium capitalize"
                  >
                    {categoriesList.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 font-bold block mb-1">Stock</label>
                <input
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 px-4 text-sm outline-none transition-all focus:border-[#553C9A] focus:ring-1 focus:ring-[#553C9A] font-medium"
                />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-4 pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="flex-1 py-3 text-sm font-bold text-slate-500 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer text-center"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-3 text-sm font-bold text-white bg-[#553C9A] rounded-xl hover:bg-[#432F7A] transition-colors cursor-pointer text-center shadow-md shadow-[#553C9A]/10"
              >
                {viewMode === "add" ? "Save Product" : "Update Product"}
              </button>
            </div>
          </div>

          {/* Right Column: Images */}
          <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-xs space-y-4">
            <h2 className="text-lg font-bold text-slate-800 border-b border-slate-50 pb-2">
              Product Images
            </h2>

            <div className="grid grid-cols-2 gap-4">
              {/* Image Slots */}
              {[
                { label: "Main Image", key: "main" },
                { label: "Close View", key: "close" },
                { label: "Other Image 1", key: "other1" },
                { label: "Other Image 2", key: "other2" },
                { label: "Other Image 3", key: "other3" },
                { label: "Other Image 4", key: "other4" },
              ].map(({ label, key }) => (
                <div key={key} className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-600 block">{label}</label>
                  
                  <div className="relative group border-2 border-dashed border-slate-200 rounded-2xl h-36 flex flex-col items-center justify-center p-3 text-center transition-colors hover:border-[#553C9A] bg-slate-50/50">
                    <input
                      type="file"
                      ref={fileRefs[key]}
                      accept="image/*"
                      onChange={(e) => handleImageChange(key, e.target.files[0])}
                      className="hidden"
                      id={`file-${key}`}
                    />
                    
                    {images[key] ? (
                      <div className="absolute inset-0 w-full h-full rounded-2xl overflow-hidden p-1.5 bg-white">
                        <img
                          src={images[key]}
                          alt={label}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(key)}
                          className="absolute top-2 right-2 bg-rose-500 hover:bg-rose-600 text-white rounded-full p-1 shadow-md transition-colors cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <label
                        htmlFor={`file-${key}`}
                        className="cursor-pointer flex flex-col items-center gap-1.5 h-full justify-center w-full select-none"
                      >
                        <Plus className="w-6 h-6 text-slate-400 group-hover:text-[#553C9A] transition-colors" />
                        <span className="text-xs text-slate-400 font-medium">Drag and drop here</span>
                        <span className="text-xs font-bold text-[#553C9A] hover:underline">Browse Files</span>
                      </label>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </form>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Products
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Manage your inventory, pricing, and skincare variants
          </p>
        </div>
        <button 
          onClick={() => setViewMode("add")}
          className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid gap-6 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 flex items-center justify-center">
            <ShoppingBag className="w-6 h-6 text-pink-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Total Products</span>
            <span className="text-2xl font-extrabold text-slate-800">{productList.length}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Layers className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Categories</span>
            <span className="text-2xl font-extrabold text-slate-800">{categories.length - 1}</span>
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-emerald-500" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase block">Active Items</span>
            <span className="text-2xl font-extrabold text-slate-800">
              {productList.filter(p => p.status !== "Out of Stock").length}
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search controls */}
      <div className=" flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Search */}
        <div className="relative w-full md:max-w-md">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="search"
            placeholder="Search products by name or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-10 pr-4 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white focus:ring-1 focus:ring-[#2C3B5E] font-medium"
          />
        </div>

        {/* Category Filter selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-2 py-1 rounded-xl text-xs font-semibold transition-all capitalize border ${selectedCategory === cat
                    ? "bg-[#2C3B5E] text-white border-[#2C3B5E]"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                {cat === "All" ? "All Categories" : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-[#EAF5FF] text-[11px] font-extrabold text-[#7E8B9B] uppercase tracking-wider">
                <th className="py-4.5 px-6">Product Details</th>
                <th className="py-4.5 px-6">Category</th>
                <th className="py-4.5 px-6">Price</th>
                <th className="py-4.5 px-6">Stock Status</th>
                <th className="py-4.5 px-6">Quantity</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product) => (
                  <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Product Image and Name */}
                    <td className="py-4.5 px-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 rounded-xl ${product.bgColor || "bg-pink-50"} overflow-hidden flex items-center justify-center border border-slate-100 shrink-0`}>
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.style.display = "none";
                              e.target.parentNode.className = `w-12 h-12 rounded-xl ${product.bgColor || "bg-pink-50"} flex items-center justify-center font-bold text-xs text-slate-700`;
                              e.target.parentNode.innerText = product.name.split(" ").map(n => n[0]).join("");
                            }}
                          />
                        </div>
                        <div>
                          <span className="text-slate-800 font-bold block">{product.name}</span>
                          <span className="text-xs text-slate-400 font-medium">ID: #PROD-00{product.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4.5 px-6">
                      <span className="text-slate-500 font-medium capitalize">{product.category}</span>
                    </td>

                    {/* Price */}
                    <td className="py-4.5 px-6 text-slate-800 font-bold">{product.price}</td>

                    {/* Stock status tag */}
                    <td className="py-4.5 px-6">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${product.statusClass}`}>
                        {product.status}
                      </span>
                    </td>

                    {/* Quantity in stock */}
                    <td className="py-4.5 px-6">
                      <span className="text-slate-600 font-bold">{product.stock} units</span>
                    </td>

                    {/* Action buttons */}
                    <td className="py-4.5 px-6 text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* View Product Details page */}
                        <button
                          onClick={() => showProductDetails(product.id)}
                          className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="View Product Details"
                        >
                          <Eye className="w-4.5 h-4.5" />
                        </button>
                        {/* Edit button */}
                        <button
                          onClick={() => startEdit(product)}
                          className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          title="Edit Product"
                        >
                          <Edit className="w-4.5 h-4.5" />
                        </button>
                        {/* Delete button */}
                        <button
                          className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4.5 h-4.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="w-8 h-8 text-slate-300" />
                      <span className="font-bold">No products found matching filters</span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer / Pagination */}
        <div className="flex items-center justify-between px-6 py-4.5 border-t border-slate-50 text-xs font-bold text-slate-500">
          <span>Showing {filteredProducts.length} of {productList.length} products</span>
          <div className="flex items-center gap-2">
            <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-400 disabled:opacity-50 cursor-pointer" disabled>
              &lt;
            </button>
            <button className="p-1 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-600 cursor-pointer" disabled>
              &gt;
            </button>
          </div>
        </div>
      </div>

      {detailProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-4xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-2 py-2 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-[#2C3B5E]" />
                <h2 className="text-md font-medium text-[#2C3B5E]">Product Detail</h2>
              </div>
              <button 
                onClick={() => setDetailProduct(null)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-2 overflow-y-auto space-y-2 flex-1 text-slate-700">
              
              {/* Product Info Summary */}
              <div className="flex flex-col md:flex-row gap-4">
                
                {/* Images display */}
                <div className="w-full md:w-2/5 shrink-0 space-y-1">
                  <div className="aspect-square bg-slate-100 rounded-2xl overflow-hidden border border-slate-100 flex items-center justify-center">
                    <img 
                      src={detailProduct.images?.[activeImageIndex]?.image || detailProduct.images?.[0]?.image || "/product1.png"} 
                      alt={detailProduct.name} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentNode.className = "aspect-square bg-pink-50 flex items-center justify-center font-bold text-xl text-slate-700 w-full h-full";
                        e.target.parentNode.innerText = detailProduct.name.slice(0, 2).toUpperCase();
                      }}
                    />
                  </div>
                  {/* Thumbnail gallery */}
                  {detailProduct.images && detailProduct.images.length > 1 && (
                    <div className="grid grid-cols-4 gap-2">
                      {detailProduct.images.map((imgObj, idx) => (
                        <div 
                          key={imgObj.id || idx} 
                          onClick={() => setActiveImageIndex(idx)}
                          className={`aspect-square bg-slate-50 border rounded-lg overflow-hidden cursor-pointer transition-all ${
                            activeImageIndex === idx 
                              ? "border-[#2C3B5E] ring-2 ring-[#2C3B5E]/20" 
                              : "border-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <img src={imgObj.image} alt="Thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Main Details */}
                <div className="flex-1 space-y-2 text-left">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#2C3B5E] bg-[#EAF5FF] px-2 py-1 rounded-md uppercase tracking-wider">
                      {detailProduct.category?.name || "Uncategorized"}
                    </span>
                    <h3 className="text-xl font-extrabold text-slate-800 mt-2 leading-tight">
                      {detailProduct.name}
                    </h3>
                    <span className="text-xs text-slate-400 font-medium block mt-1">SKU: {detailProduct.sku}</span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-semibold text-slate-800">
                      ₹{detailProduct.base_price}
                    </span>
                    {detailProduct.sale_price && (
                      <span className="text-sm font-medium text-slate-400 line-through">
                        ₹{detailProduct.sale_price}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4 border-t border-b border-slate-100 py-3.5">
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Brand</span>
                      <span className="text-sm font-bold text-slate-700">{detailProduct.brand || "Lumora"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Status</span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase mt-0.5 border ${
                        detailProduct.in_stock
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-rose-50 text-rose-600 border-rose-100"
                      }`}>
                        {detailProduct.in_stock ? "In Stock" : "Out of Stock"}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Visibility</span>
                    <span className={`text-xs font-bold ${detailProduct.is_active ? "text-emerald-600" : "text-slate-500"}`}>
                      {detailProduct.is_active ? "Active & Visible in Catalog" : "Inactive / Hidden"}
                    </span>
                  </div>
                </div>

              </div>

              {/* Description */}
              {detailProduct.description && (
                <div className="space-y-1.5 border-t border-slate-100 pt-4 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-bold">Description</span>
                  <p className="text-sm font-medium text-slate-600 leading-relaxed whitespace-pre-line bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    {detailProduct.description}
                  </p>
                </div>
              )}

              {/* Variants list */}
              {detailProduct.variants && detailProduct.variants.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4 text-left">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block font-bold">Variants</span>
                  <div className="grid gap-2">
                    {detailProduct.variants.map((variant) => (
                      <div key={variant.id} className="flex items-center justify-between bg-slate-50/50 hover:bg-slate-50 border border-slate-100 rounded-xl p-3.5 transition-colors">
                        <div>
                          <span className="text-sm font-bold text-slate-700 block">{variant.name}</span>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-0.5 font-semibold">SKU: {variant.sku}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-extrabold text-slate-800 block font-bold">₹{variant.price}</span>
                          <span className="text-xs text-slate-500 font-medium">{variant.stock_quantity} units available</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-3 shrink-0 bg-slate-50/50">
              <button 
                onClick={() => setDetailProduct(null)}
                className="px-5 py-2.5 text-sm font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Close Details
              </button>
              <button 
                onClick={() => {
                  setDetailProduct(null);
                  startEdit(detailProduct);
                }}
                className="px-5 py-2.5 text-sm font-bold text-white bg-[#2C3B5E] hover:bg-[#1E2A47] rounded-xl transition-all cursor-pointer shadow-md shadow-[#2C3B5E]/10"
              >
                Edit Product
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
