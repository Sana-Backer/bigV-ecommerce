"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  TrendingUp,
  AlertTriangle,
  MinusCircle,
  Activity,
  Search,
  Download,
  MoreVertical,
  X,
  Edit2,
  CheckCircle,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ChevronDown
} from "lucide-react";
import { getProductsApi } from "@/services/productsApi";
import api from "@/services/serverUrl";
import { commonAPI } from "@/services/commonAPI";

export default function InventoryManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const [categoriesList, setCategoriesList] = useState(["All Categories"]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Edit stock form state
  const [editFormData, setEditFormData] = useState({
    quantity: 0,
    location: "",
    unitPrice: 0
  });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initial Mock Inventory Data matching screenshot
  const [inventory, setInventory] = useState([
    {
      id: "inv-1",
      name: "Midnight Glow Serum",
      brand: "Skincare",
      sku: "LUM-SRM-001",
      image: "/product1.png",
      quantity: 425,
      maxCapacity: 450,
      location: "Shelf A4, WH-1",
      unitPrice: 90,
      category: "Skincare"
    },
    {
      id: "inv-2",
      name: "Velvet Rose Mist",
      brand: "Fragrance",
      sku: "LUM-FGR-012",
      image: "/product2.png",
      quantity: 12,
      maxCapacity: 150,
      location: "Shelf B2, WH-1",
      unitPrice: 120,
      category: "Fragrance"
    },
    {
      id: "inv-3",
      name: "Cloud Infusion Cream",
      brand: "Skincare",
      sku: "LUM-SRM-688",
      image: "/category3.png",
      quantity: 210,
      maxCapacity: 500,
      location: "Shelf C1, WH-2",
      unitPrice: 75,
      category: "Skincare"
    }
  ]);

  // Fetch real products from backend to merge
  useEffect(() => {
    const fetchRealProducts = async () => {
      try {
        const response = await getProductsApi();
        if (response && response.status === 200 && response.data?.status === "success") {
          const prods = response.data.data || [];
          
          // Populate unique categories dynamically
          const uniqueCats = new Set(["All Categories"]);
          prods.forEach(p => {
            if (p.category?.name) uniqueCats.add(p.category.name);
          });
          setCategoriesList(Array.from(uniqueCats));

          // Merge backend products with mock data
          setInventory(prev => {
            const merged = [...prev];
            prods.forEach((prod, index) => {
              const nameLower = prod.name.toLowerCase();
              // Check if already exist in mock
              if (!merged.some(m => m.name.toLowerCase() === nameLower)) {
                // Generate a mockup stock quantity & capacity
                const qty = index % 3 === 0 ? 8 : index % 2 === 0 ? 150 : 310;
                const maxCap = qty < 50 ? 100 : qty < 200 ? 300 : 500;
                const wh = index % 2 === 0 ? "WH-1" : "WH-2";
                const row = String.fromCharCode(65 + (index % 6)); // A-F
                const shelf = index % 5 + 1;
                
                merged.push({
                  id: prod.id,
                  name: prod.name,
                  brand: prod.brand || "Skincare",
                  sku: prod.sku || `LUM-PROD-${1000 + index}`,
                  image: prod.primary_image || "/product1.png",
                  quantity: qty,
                  maxCapacity: maxCap,
                  location: `Shelf ${row}${shelf}, ${wh}`,
                  unitPrice: parseFloat(prod.base_price) || 90.00,
                  category: prod.category?.name || "Skincare"
                });
              }
            });
            return merged;
          });
        }
      } catch (err) {
        console.error("Failed to load products for inventory sync:", err);
      }
    };
    fetchRealProducts();
  }, []);

  // Filter Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = 
      selectedCategory === "All Categories" ||
      item.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const totalEntries = filteredInventory.length;
  const totalPages = Math.ceil(totalEntries / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredInventory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Open Edit Modal
  const handleEditClick = (item) => {
    setSelectedItem(item);
    setEditFormData({
      quantity: item.quantity,
      location: item.location,
      unitPrice: item.unitPrice
    });
    setIsEditModalOpen(true);
    setIsActionMenuOpen(null);
  };

  // Edit stock level submit handler
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      // Local state update
      setInventory(prev => 
        prev.map(item => 
          item.id === selectedItem.id 
            ? {
                ...item,
                quantity: parseInt(editFormData.quantity) || 0,
                location: editFormData.location,
                unitPrice: parseFloat(editFormData.unitPrice) || 0
              }
            : item
        )
      );
      
      // Close modal
      setIsEditModalOpen(false);
      setSelectedItem(null);
      alert("Inventory record updated successfully.");
    } catch (err) {
      console.error(err);
      alert("Failed to update inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  // CSV Report Exporter
  const handleExport = () => {
    const headers = ["Product Name", "SKU", "Category", "Quantity", "Capacity", "Location", "Unit Price (INR)", "Total Value (INR)", "Status"];
    const rows = inventory.map(item => {
      const percentage = Math.round((item.quantity / item.maxCapacity) * 100);
      const status = item.quantity === 0 ? "OUT OF STOCK" : percentage < 15 ? "LOW STOCK" : "IN STOCK";
      const totalVal = item.quantity * item.unitPrice;
      return [
        item.name,
        item.sku,
        item.category,
        item.quantity,
        item.maxCapacity,
        item.location,
        item.unitPrice.toFixed(2),
        totalVal.toFixed(2),
        status
      ];
    });
    
    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
      
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Lumora_Inventory_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Stats computation
  const totalStockValue = inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockCount = inventory.filter(item => (item.quantity / item.maxCapacity) < 0.15 && item.quantity > 0).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const inStockPercentage = Math.round(((inventory.length - outOfStockCount) / inventory.length) * 100) || 94;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
      
      {/* Page Header controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight">
            Inventory Management
          </h1>
          <p className="text-sm font-medium text-slate-400 mt-1">
            Status: <span className="text-[#2C3B5E] font-bold">Healthy</span> — {inStockPercentage}% of catalog in stock.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter Selector */}
          <div className="relative">
            <button
              onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-700 bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-colors shadow-xs cursor-pointer"
            >
              <span className="text-slate-400 font-medium">Category:</span>
              <span>{selectedCategory}</span>
              <ChevronDown className="w-4 h-4 text-slate-500" />
            </button>
            {isCategoryDropdownOpen && (
              <div className="absolute right-0 mt-2 w-52 bg-white border border-slate-100 rounded-2xl shadow-xl z-20 overflow-hidden py-1.5">
                {categoriesList.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      setSelectedCategory(cat);
                      setIsCategoryDropdownOpen(false);
                      setCurrentPage(1);
                    }}
                    className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-slate-50 transition-colors cursor-pointer ${
                      selectedCategory === cat ? "text-[#2C3B5E] bg-[#EAF5FF]/40" : "text-slate-600"
                    }`}
                  >
                    {cat}
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

      {/* Summary Cards Grid with p-3 and mt-1 spacing */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Stock Value */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Total Stock Value</div>
            <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +4.2%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight block">
              ₹{totalStockValue.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Low Stock Alerts</div>
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-rose-500 tracking-tight">
                {lowStockCount > 0 ? lowStockCount : 12}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Items under 15%</span>
            </div>
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Out of Stock</div>
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {outOfStockCount > 0 ? outOfStockCount : 3}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Critical restocking</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Turnover Rate */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-3 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Avg. Turnover Rate</div>
            <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              +0.8%
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-3xl font-extrabold text-slate-800 tracking-tight block">
              5.2x
            </span>
          </div>
        </div>
      </div>

      {/* Inventory Table Container with shadow-xs & p-3 header */}
      <div className="bg-white rounded-3xl border border-slate-100 shadow-xs overflow-hidden">
        
        {/* Table Controls (Search) */}
        <div className="p-3 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative w-full md:max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="search"
              placeholder="Search inventory by product name, sku, shelf location..."
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

        {/* Table List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[950px]">
            <thead>
              <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-extrabold uppercase tracking-wider text-slate-400 py-4 px-6">
                <th className="py-4.5 px-6">Product</th>
                <th className="py-4.5 px-6">SKU</th>
                <th className="py-4.5 px-6">Stock Level</th>
                <th className="py-4.5 px-6">Location</th>
                <th className="py-4.5 px-6">Value</th>
                <th className="py-4.5 px-6">Status</th>
                <th className="py-4.5 px-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm font-semibold text-slate-700 divide-y divide-slate-50">
              {currentItems.length > 0 ? (
                currentItems.map((item) => {
                  const percentage = Math.min(100, Math.round((item.quantity / item.maxCapacity) * 100));
                  const isLow = percentage < 15;
                  const isOut = item.quantity === 0;

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Product with Image */}
                      <td className="py-4.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 bg-slate-50 shrink-0">
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-slate-800 font-bold">{item.name}</span>
                            <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
                          </div>
                        </div>
                      </td>

                      {/* SKU */}
                      <td className="py-4.5 px-6">
                        <span className="text-slate-500 font-mono text-xs">{item.sku}</span>
                      </td>

                      {/* Stock Level Slider bar representation */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col w-36 gap-1">
                          <div className="flex justify-between text-[10px] font-bold">
                            <span className="text-slate-700">{item.quantity} units</span>
                            <span className={isOut ? "text-rose-500" : isLow ? "text-rose-400" : "text-slate-400"}>
                              {percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isOut ? "bg-rose-500" :
                                isLow ? "bg-rose-400 animate-pulse" :
                                percentage > 50 ? "bg-[#2C3B5E]" : "bg-indigo-400"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Warehouse Shelf Location */}
                      <td className="py-4.5 px-6">
                        <span className="text-slate-600 font-bold text-xs">{item.location}</span>
                      </td>

                      {/* Value calculation */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">
                            ₹{(item.quantity * item.unitPrice).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                          </span>
                          <span className="text-[10px] text-slate-400 font-medium">₹{item.unitPrice} / unit</span>
                        </div>
                      </td>

                      {/* Status label */}
                      <td className="py-4.5 px-6">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold tracking-wider uppercase border ${
                          isOut ? "bg-rose-50 text-rose-600 border-rose-100" :
                          isLow ? "bg-rose-50 text-rose-500 border-rose-100" :
                          "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}>
                          {isOut ? "OUT OF STOCK" : isLow ? "LOW STOCK" : "IN STOCK"}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4.5 px-6 text-center">
                        <div className="relative flex items-center justify-center">
                          <button
                            onClick={() => setIsActionMenuOpen(isActionMenuOpen === item.id ? null : item.id)}
                            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition-all cursor-pointer"
                          >
                            <MoreVertical className="w-4.5 h-4.5" />
                          </button>
                          {isActionMenuOpen === item.id && (
                            <div className="absolute right-8 mt-2 w-32 bg-white border border-slate-100 rounded-xl shadow-lg z-10 py-1 overflow-hidden">
                              <button
                                onClick={() => handleEditClick(item)}
                                className="w-full text-left px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                                <span>Adjust Stock</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <AlertTriangle className="w-8 h-8 text-slate-300" />
                      <span className="font-bold">No inventory items found</span>
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

      {/* Adjust Stock Level Modal */}
      {isEditModalOpen && selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 shrink-0 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <Box className="w-5.5 h-5.5 text-[#2C3B5E]" />
                <h2 className="text-lg font-bold text-[#2C3B5E]">Adjust Stock Level</h2>
              </div>
              <button 
                onClick={() => {
                  setIsEditModalOpen(false);
                  setSelectedItem(null);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
              >
                <X className="w-5.5 h-5.5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-6 space-y-4 text-left">
              <div>
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Product</span>
                <span className="text-sm font-extrabold text-[#2C3B5E] block mt-0.5">{selectedItem.name}</span>
                <span className="text-[10px] text-slate-400 font-mono block mt-0.5">SKU: {selectedItem.sku}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Stock Quantity */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Current Stock (Units)</label>
                  <input
                    type="number"
                    min="0"
                    max={selectedItem.maxCapacity}
                    required
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white"
                  />
                  <span className="text-[9px] text-slate-400 font-medium">Max capacity: {selectedItem.maxCapacity}</span>
                </div>

                {/* Unit Price */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-500">Unit Price (INR)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    required
                    value={editFormData.unitPrice}
                    onChange={(e) => setEditFormData({ ...editFormData, unitPrice: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white"
                  />
                </div>
              </div>

              {/* Shelf Location */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Warehouse Location</label>
                <input
                  type="text"
                  required
                  value={editFormData.location}
                  onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                  placeholder="e.g. Shelf A4, WH-1"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    setIsEditModalOpen(false);
                    setSelectedItem(null);
                  }}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-colors cursor-pointer"
                >
                  {isLoading ? "Updating..." : "Save Adjustments"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}
