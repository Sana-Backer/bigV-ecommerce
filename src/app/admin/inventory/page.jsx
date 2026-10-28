"use client";

import React, { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
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
  ChevronDown,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  Loader2,
  Info
} from "lucide-react";
import {
  getStockListApi,
  setStockApi,
  getStockSummaryApi,
  adjustStockApi,
  exportStockApi,
  importStockApi
} from "@/services/inventoryApi";

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

  // Adjust modal mode ("set" count vs "+/-" adjustment)
  const [adjustMode, setAdjustMode] = useState("set"); // "set" | "adjust"
  const [adjustmentChange, setAdjustmentChange] = useState(0);
  const [movementType, setMovementType] = useState("adjustment");
  const [adjustmentNote, setAdjustmentNote] = useState("");

  // Backend Stock Summary
  const [stockSummary, setStockSummary] = useState(null);

  // Stocktake Import Modal State
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [isDryRun, setIsDryRun] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const importFileInputRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Initial Inventory Data from backend
  const [inventory, setInventory] = useState([]);

  // Fetch real inventory from backend
  const fetchInventory = async () => {
    setIsLoading(true);
    try {
      const response = await getStockListApi("");
      
      if (response && response.status === 200) {
        // Handle pagination structure robustly
        let prods = [];
        if (Array.isArray(response.data)) {
          prods = response.data;
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          prods = response.data.results;
        } else if (response.data?.data && Array.isArray(response.data.data)) {
          prods = response.data.data;
        } else if (response.data?.data?.results && Array.isArray(response.data.data.results)) {
          prods = response.data.data.results;
        }
        
        // Populate unique categories dynamically
        const uniqueCats = new Set(["All Categories"]);
        prods.forEach(p => {
          if (p.category) uniqueCats.add(p.category);
        });
        setCategoriesList(Array.from(uniqueCats));

        // Map backend schema to frontend state
        const mappedInventory = prods.map((prod, index) => {
          return {
            id: prod.variant_id || prod.product_id, // Unique ID for key
            product_id: prod.product_id,
            variant_id: prod.variant_id,
            name: prod.name,
            sku: prod.sku,
            quantity: prod.stock_quantity || 0,
            maxCapacity: prod.reorder_quantity || prod.low_stock_threshold || 100,
            unitPrice: parseFloat(prod.unit_price) || 0,
            category: prod.category || "Uncategorized",
            status: prod.status
          };
        });
        setInventory(mappedInventory);
      }
    } catch (err) {
      console.error("Failed to load inventory:", err);
      toast.error("Failed to load inventory from server");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummary = async () => {
    try {
      const response = await getStockSummaryApi();
      if (response && response.status === 200 && response.data?.status === "success") {
        setStockSummary(response.data.data);
      }
    } catch (err) {
      console.error("Failed to load stock summary:", err);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInventory();
    fetchSummary();
  }, []);

  // Filter Logic
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = 
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.location && item.location.toLowerCase().includes(searchTerm.toLowerCase()));

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
      location: item.location || "",
      unitPrice: item.unitPrice
    });
    setAdjustMode("set");
    setAdjustmentChange(0);
    setMovementType("adjustment");
    setAdjustmentNote("");
    setIsEditModalOpen(true);
    setIsActionMenuOpen(null);
  };

  // Edit stock level submit handler (supports both Set Count and Relative +/- Adjustment)
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (adjustMode === "adjust") {
        const changeNum = parseInt(adjustmentChange, 10);
        if (!changeNum || changeNum === 0) {
          toast.error("Adjustment change cannot be 0.");
          setIsLoading(false);
          return;
        }

        const payload = {
          change: changeNum,
          movement_type: movementType,
          note: adjustmentNote || "Manual adjustment from admin panel",
          reference: "ADMIN-ADJUST"
        };

        if (selectedItem.variant_id) {
          payload.variant_id = selectedItem.variant_id;
        } else {
          payload.product_id = selectedItem.product_id;
        }

        const response = await adjustStockApi(payload);
        if (response && (response.status === 200 || response.status === 201)) {
          toast.success("Stock adjustment applied successfully.");
          await fetchInventory();
          await fetchSummary();
          setIsEditModalOpen(false);
          setSelectedItem(null);
        } else {
          toast.error(response?.data?.message || "Failed to adjust stock.");
        }
      } else {
        const payload = {
          quantity: parseInt(editFormData.quantity, 10) || 0,
          note: adjustmentNote || "Manual stock count from admin panel"
        };

        if (selectedItem.variant_id) {
          payload.variant_id = selectedItem.variant_id;
        } else {
          payload.product_id = selectedItem.product_id;
        }

        const response = await setStockApi(payload);
        if (response && (response.status === 200 || response.status === 201)) {
          toast.success("Inventory stock quantity set successfully.");
          await fetchInventory();
          await fetchSummary();
          setIsEditModalOpen(false);
          setSelectedItem(null);
        } else {
          toast.error(response?.data?.message || "Failed to set inventory stock.");
        }
      }
    } catch (err) {
      console.error("Stock update error:", err);
      toast.error("Failed to update inventory.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const response = await exportStockApi();
      if (response && response.status === 200) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", `Stock_Report_${new Date().toISOString().slice(0, 10)}.xlsx`);
        document.body.appendChild(link);
        link.click();
        link.parentNode?.removeChild(link);
        window.URL.revokeObjectURL(url);
        toast.success("Stock report exported successfully.");
      } else {
        toast.error("Failed to export stock report.");
      }
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export stock report.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith(".xlsx")) {
        toast.error("Please select a valid Excel file (.xlsx)");
        return;
      }
      setImportFile(file);
      setImportResult(null);
    }
  };

  const handleStocktakeImport = async () => {
    if (!importFile) {
      toast.error("Please choose an Excel file to import.");
      return;
    }
    setIsImporting(true);
    setImportResult(null);
    try {
      const response = await importStockApi(importFile, isDryRun);
      const resData = response?.data || response?.response?.data;
      if (response && (response.status === 200 || response.status === 201)) {
        setImportResult({
          ok: true,
          dry_run: isDryRun,
          changes: resData?.data?.changes || []
        });
        toast.success(resData?.message || (isDryRun ? "Dry run completed." : "Stocktake imported successfully."));
        if (!isDryRun) {
          resetStocktakeModal();
          await fetchInventory();
          await fetchSummary();
        }
      } else {
        setImportResult({
          ok: false,
          errors: resData?.errors || resData?.message || "Import failed. Please check the file formatting."
        });
        toast.error(resData?.message || "Failed to process stocktake file.");
      }
    } catch (err) {
      console.error("Stocktake import error:", err);
      toast.error("An error occurred while uploading the stocktake file.");
    } finally {
      setIsImporting(false);
    }
  };

  const resetStocktakeModal = () => {
    setImportFile(null);
    setIsDryRun(false);
    setImportResult(null);
    setIsImportModalOpen(false);
    if (importFileInputRef.current) {
      importFileInputRef.current.value = "";
    }
  };

  // Stats computation
  const totalStockValue = stockSummary?.stock_value_at_selling_price != null
    ? parseFloat(stockSummary.stock_value_at_selling_price)
    : inventory.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const lowStockCount = stockSummary?.low_stock != null
    ? stockSummary.low_stock
    : inventory.filter(item => (item.quantity / item.maxCapacity) < 0.15 && item.quantity > 0).length;
  const outOfStockCount = stockSummary?.out_of_stock != null
    ? stockSummary.out_of_stock
    : inventory.filter(item => item.quantity === 0).length;
  const inStockCount = stockSummary?.in_stock != null
    ? stockSummary.in_stock
    : inventory.filter(item => item.quantity > 0).length;
  const inStockPercentage = stockSummary?.sku_count
    ? Math.round(((stockSummary.in_stock || 0) / stockSummary.sku_count) * 100)
    : (inventory.length ? Math.round(((inventory.length - outOfStockCount) / inventory.length) * 100) : 100);

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

          {/* Import Stocktake */}
          <button
            onClick={() => {
              setImportFile(null);
              setImportResult(null);
              setIsImportModalOpen(true);
            }}
            className="flex items-center gap-2 text-sm font-bold text-[#2C3B5E] bg-white border border-slate-200 px-4 py-2.5 rounded-xl hover:bg-slate-50 transition-all shadow-xs cursor-pointer"
          >
            <Upload className="w-4 h-4" />
            <span>Import Stocktake</span>
          </button>

          {/* Export Report */}
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center gap-2 text-sm font-bold text-white bg-[#2C3B5E] px-5 py-2.5 rounded-xl hover:bg-[#1E2A47] transition-all shadow-md shadow-[#2C3B5E]/10 cursor-pointer disabled:opacity-50"
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Summary Cards Grid with live headline numbers from backend */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Total Stock Value */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Total Stock Value</div>
            <span className="text-[10px] font-extrabold text-emerald-500 bg-emerald-50 px-2 py-0.5 rounded-md flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              Live
            </span>
          </div>
          <div className="mt-1 space-y-1">
            <span className="text-3xl font-extrabold text-[#2C3B5E] tracking-tight block">
              ₹{totalStockValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400 font-semibold block">
              {stockSummary?.units_on_hand ?? inventory.reduce((sum, item) => sum + item.quantity, 0)} units on hand
            </span>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Low Stock Alerts</div>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-amber-600 tracking-tight">
                {lowStockCount}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Items under threshold</span>
            </div>
          </div>
        </div>

        {/* Card 3: Out of Stock */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Out of Stock</div>
            <MinusCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-rose-600 tracking-tight">
                {outOfStockCount}
              </span>
              <span className="text-[10px] text-slate-400 font-bold">Require immediate restocking</span>
            </div>
          </div>
        </div>

        {/* Card 4: Tracked SKUs */}
        <div className="relative overflow-hidden rounded-3xl border border-slate-100 bg-white p-4 shadow-xs transition-all duration-300 hover:shadow-md hover:border-slate-200">
          <div className="flex items-center justify-between">
            <div className="text-slate-400 text-xs font-bold">Total Monitored SKUs</div>
            <Box className="w-4 h-4 text-[#2C3B5E]" />
          </div>
          <div className="mt-1 space-y-1">
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl font-extrabold text-slate-800 tracking-tight">
                {stockSummary?.sku_count ?? inventory.length}
              </span>
              <span className="text-[10px] text-emerald-600 font-bold">
                {inStockCount} active in stock
              </span>
            </div>
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
                      {/* Product without Image */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">{item.name}</span>
                          <span className="text-[10px] text-slate-400 font-medium">{item.category}</span>
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
                              Threshold: {item.maxCapacity}
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

                      {/* Value calculation */}
                      <td className="py-4.5 px-6">
                        <div className="flex flex-col">
                          <span className="text-slate-800 font-bold">
                            ₹{item.unitPrice}
                          </span>
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
                  <td colSpan="6" className="py-12 text-center text-slate-400">
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
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Target Item</span>
                <span className="text-sm font-extrabold text-[#2C3B5E] block mt-0.5">{selectedItem.name}</span>
                <div className="flex items-center gap-3 text-[10px] text-slate-400 font-mono mt-0.5">
                  <span>SKU: {selectedItem.sku}</span>
                  <span>•</span>
                  <span>Current: <strong className="text-slate-700">{selectedItem.quantity} units</strong></span>
                </div>
              </div>

              {/* Mode Toggle: Set Count vs Relative Adjustment */}
              <div className="flex bg-slate-100 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setAdjustMode("set")}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adjustMode === "set" ? "bg-white text-[#2C3B5E] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Set Absolute Count
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustMode("adjust")}
                  className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                    adjustMode === "adjust" ? "bg-white text-[#2C3B5E] shadow-xs" : "text-slate-500 hover:text-slate-800"
                  }`}
                >
                  Adjust (+/- Delta)
                </button>
              </div>

              {adjustMode === "set" ? (
                /* Set Stock Quantity */
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-600 block">New Exact Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={editFormData.quantity}
                    onChange={(e) => setEditFormData({ ...editFormData, quantity: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white font-semibold"
                  />
                  <span className="text-[10px] text-slate-400 block">Sets the final stock quantity in the database directly.</span>
                </div>
              ) : (
                /* Relative Adjustment */
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Quantity Change (+ to add, - to deduct)</label>
                    <input
                      type="number"
                      required
                      placeholder="e.g. +10 or -3"
                      value={adjustmentChange}
                      onChange={(e) => setAdjustmentChange(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white font-semibold"
                    />
                    <span className="text-[10px] text-slate-400 block">
                      New Total: <strong className="text-slate-700">{Math.max(0, selectedItem.quantity + (parseInt(adjustmentChange, 10) || 0))} units</strong>
                    </span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-600 block">Movement Reason</label>
                    <select
                      value={movementType}
                      onChange={(e) => setMovementType(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none transition-all focus:border-[#2C3B5E] focus:bg-white font-medium"
                    >
                      <option value="adjustment">Manual Adjustment</option>
                      <option value="damage">Damaged / Expired / Lost</option>
                      <option value="return">Customer Return</option>
                      <option value="purchase_receipt">Purchase Order Receipt</option>
                      <option value="stocktake">Stocktake Correction</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Note / Audit Trail */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-600 block">Audit Note (Optional)</label>
                <input
                  type="text"
                  placeholder="Reason for change..."
                  value={adjustmentNote}
                  onChange={(e) => setAdjustmentNote(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 px-3 text-xs outline-none transition-all focus:border-[#2C3B5E] focus:bg-white font-medium"
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
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#2C3B5E] rounded-xl hover:bg-[#1E2A47] transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isLoading ? "Saving..." : "Save Adjustments"}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Stocktake Bulk Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#EAF5FF] flex items-center justify-center text-[#2C3B5E]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Import Stocktake</h2>
                  <p className="text-xs text-slate-500 font-medium">Bulk update inventory quantities via an Excel spreadsheet (.xlsx)</p>
                </div>
              </div>
              <button
                onClick={resetStocktakeModal}
                disabled={isImporting}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-4 flex-1 text-slate-700">
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-1.5">
                <div className="flex items-center gap-2 font-bold text-[#2C3B5E]">
                  <Info className="w-4 h-4 text-[#2C3B5E]" />
                  <span>Stocktake Format</span>
                </div>
                <p className="text-slate-600 font-medium leading-relaxed">
                  Export your current stock levels first using <strong>Export Report</strong>, modify the counted stock in the Excel file, and re-upload here.
                </p>
                <p className="text-[11px] text-slate-500 italic">
                  * Matches rows by SKU. Items with identical counts are safely skipped.
                </p>
              </div>

              {/* File Dropzone */}
              <div className="space-y-1.5">
                <input
                  ref={importFileInputRef}
                  type="file"
                  accept=".xlsx"
                  className="hidden"
                  onChange={handleImportFileChange}
                />

                {!importFile ? (
                  <div
                    onClick={() => importFileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 hover:border-[#2C3B5E] bg-slate-50/50 hover:bg-[#EAF5FF]/30 rounded-2xl p-6 text-center cursor-pointer transition-all space-y-2"
                  >
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-500">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700">Click to select Stocktake Excel file (.xlsx)</p>
                      <p className="text-xs text-slate-400 font-medium">Files up to 10MB supported</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700">
                        <FileSpreadsheet className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-slate-800 truncate max-w-xs">{importFile.name}</p>
                        <p className="text-xs text-slate-500 font-medium">{(importFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={isImporting}
                      onClick={() => {
                        setImportFile(null);
                        setImportResult(null);
                        if (importFileInputRef.current) importFileInputRef.current.value = "";
                      }}
                      className="p-1.5 hover:bg-emerald-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Dry Run Checkbox */}
              <div className="flex items-start gap-3 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                <input
                  type="checkbox"
                  id="stocktake-dryrun"
                  checked={isDryRun}
                  onChange={(e) => setIsDryRun(e.target.checked)}
                  disabled={isImporting}
                  className="mt-0.5 w-4 h-4 text-[#2C3B5E] rounded border-slate-300 focus:ring-[#2C3B5E] cursor-pointer"
                />
                <label htmlFor="stocktake-dryrun" className="text-xs text-slate-700 cursor-pointer select-none">
                  <span className="font-bold text-slate-800 block">Dry run (Simulation mode)</span>
                  <span className="text-slate-500 font-medium">Checks all SKUs and quantities without writing changes to the database.</span>
                </label>
              </div>

              {/* Loading State */}
              {isImporting && (
                <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl flex items-center gap-3 text-blue-700">
                  <Loader2 className="w-5 h-5 animate-spin shrink-0" />
                  <div className="text-xs font-semibold">
                    <p className="font-bold">Processing stocktake...</p>
                    <p className="text-blue-600 font-normal">Validating rows and recalculating inventory counts.</p>
                  </div>
                </div>
              )}

              {/* Results Display */}
              {importResult && (
                <div className="space-y-2 pt-1">
                  {importResult.ok ? (
                    <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>{importResult.dry_run ? "Dry Run Completed (No Changes Saved)" : "Stocktake Applied Successfully!"}</span>
                      </div>
                      <p className="text-xs text-emerald-700 font-medium">
                        {importResult.changes ? `${importResult.changes.length} inventory item(s) updated.` : "All rows processed."}
                      </p>
                    </div>
                  ) : (
                    <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl space-y-2">
                      <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
                        <AlertTriangle className="w-5 h-5 text-rose-600" />
                        <span>Stocktake Validation Failed</span>
                      </div>
                      {importResult.errors && (
                        <div className="max-h-36 overflow-y-auto space-y-1 p-2 bg-white rounded-xl border border-rose-200 text-xs text-rose-700">
                          {Array.isArray(importResult.errors) ? (
                            importResult.errors.map((err, i) => <div key={i}>• {err}</div>)
                          ) : (
                            <div>{JSON.stringify(importResult.errors)}</div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-100 flex items-center justify-between gap-3 shrink-0 bg-slate-50/50">
              <button
                type="button"
                onClick={resetStocktakeModal}
                disabled={isImporting}
                className="px-5 py-2.5 text-xs font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-50"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleStocktakeImport}
                disabled={!importFile || isImporting}
                className="flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2C3B5E] hover:bg-[#1E2A47] rounded-xl transition-all cursor-pointer shadow-md shadow-[#2C3B5E]/10 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isImporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                <span>{isDryRun ? "Run Validation" : "Apply Stocktake"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
