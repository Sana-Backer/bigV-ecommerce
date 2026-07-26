import React, { useState, useEffect } from "react";
import { ArrowLeft, Edit, Trash2, Plus } from "lucide-react";
import {
  getProductVariantsApi,
  addProductVariantApi,
  updateProductVariantApi,
  deleteProductVariantApi
} from "@/services/productsApi";

export default function ManageVariantsSection({
  product,
  onBack,
  onRefreshProducts
}) {
  const [variantList, setVariantList] = useState([]);
  const [isVariantsLoading, setIsVariantsLoading] = useState(false);
  const [isVariantEditing, setIsVariantEditing] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const [variantFormData, setVariantFormData] = useState({
    name: "",
    sku: "",
    price: "",
    sale_price: "",
    stock_quantity: "0",
    weight: "0.100",
    is_default: false,
    attributes: { size: "", fragrance: "", color: "" }
  });

  const fetchVariants = async (productId) => {
    setIsVariantsLoading(true);
    try {
      const response = await getProductVariantsApi(productId);
      if (response && response.status === 200) {
        const data = response.data?.status === "success" ? response.data.data : response.data;
        setVariantList(data || []);
      }
    } catch (error) {
      console.error("Failed to fetch product variants:", error);
    } finally {
      setIsVariantsLoading(false);
    }
  };

  useEffect(() => {
    if (product) {
      fetchVariants(product.id);
      setVariantFormData({
        name: "",
        sku: `${product.sku || "PROD"}-VAR-${Date.now().toString().slice(-3)}`,
        price: product.price ? product.price.replace(/[^\d.]/g, "") : "399.00",
        sale_price: "",
        stock_quantity: product.stock ? product.stock.toString() : "0",
        weight: "0.100",
        is_default: false,
        attributes: { size: "", fragrance: "", color: "" }
      });
      setIsVariantEditing(null);
    }
  }, [product]);

  const handleVariantSave = async (e) => {
    e.preventDefault();
    if (!variantFormData.name.trim()) return;

    setIsLoading(true);

    const nameSlug = variantFormData.name.toUpperCase().replace(/[^A-Z0-9]/g, "");
    const generatedSku = `${product.sku || "PROD"}-VAR-${nameSlug}-${Date.now().toString().slice(-3)}`;
    const finalSku = isVariantEditing ? isVariantEditing.sku : generatedSku;

    const cleanPrice = product.price ? product.price.replace(/[^\d.]/g, "") : "399.00";
    const basePrice = parseFloat(cleanPrice) || 399.00;

    const attrs = { size: variantFormData.name };

    const reqBody = {
      name: variantFormData.name,
      sku: finalSku,
      attributes: attrs,
      price: basePrice.toFixed(2),
      sale_price: null,
      stock_quantity: parseInt(product.stock) || 0,
      weight: "0.100",
      is_default: variantFormData.is_default,
      is_active: true
    };

    try {
      let response;
      if (isVariantEditing) {
        response = await updateProductVariantApi(isVariantEditing.id, reqBody);
      } else {
        response = await addProductVariantApi(product.id, reqBody);
      }

      if (response && (response.status === 200 || response.status === 201)) {
        setIsVariantEditing(null);
        setVariantFormData({
          name: "",
          sku: `${product.sku || "PROD"}-VAR-${Date.now().toString().slice(-3)}`,
          price: product.price ? product.price.replace(/[^\d.]/g, "") : "399.00",
          sale_price: "",
          stock_quantity: product.stock ? product.stock.toString() : "0",
          weight: "0.100",
          is_default: false,
          attributes: { size: "", fragrance: "", color: "" }
        });
        fetchVariants(product.id);
        if (onRefreshProducts) onRefreshProducts();
      } else {
        alert("Failed to save variant. Make sure the name is unique.");
      }
    } catch (err) {
      console.error("Save variant failed:", err);
      alert("Failed to save variant. Please check fields and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVariantDelete = async (variantId) => {
    if (!window.confirm("Are you sure you want to delete/deactivate this variant?")) return;
    try {
      const response = await deleteProductVariantApi(variantId);
      if (response && (response.status === 204 || response.status === 200)) {
        fetchVariants(product.id);
        if (onRefreshProducts) onRefreshProducts();
      }
    } catch (err) {
      console.error("Delete variant failed:", err);
    }
  };

  const startEditVariant = (variant) => {
    setIsVariantEditing(variant);
    setVariantFormData({
      name: variant.name,
      sku: variant.sku,
      price: variant.price,
      sale_price: variant.sale_price || "",
      stock_quantity: variant.stock_quantity.toString(),
      weight: variant.weight || "0.100",
      is_default: variant.is_default,
      attributes: {
        size: variant.attributes?.size || "",
        fragrance: variant.attributes?.fragrance || "",
        color: variant.attributes?.color || ""
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8 px-2 text-slate-800">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer text-slate-500 hover:text-slate-800 mr-1"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-2xl font-bold text-[#2C3B5E] tracking-tight">
            Manage Variants
          </h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Variants List Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#2C3B5E] mb-4">Current Variants</h2>

            {isVariantsLoading ? (
              <div className="py-12 text-center text-slate-400 font-semibold">Loading variants...</div>
            ) : variantList.length > 0 ? (
              <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto pr-2">
                {variantList.map((variant) => (
                  <div key={variant.id} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-slate-700">{variant.name}</span>
                      {variant.is_default && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-100">
                          Default
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => startEditVariant(variant)}
                        className="text-slate-400 hover:text-[#2C3B5E] p-1.5 rounded-lg hover:bg-slate-50 transition-all cursor-pointer"
                        title="Edit Variant"
                      >
                        <Edit className="w-4.5 h-4.5" />
                      </button>
                      <button
                        onClick={() => handleVariantDelete(variant.id)}
                        className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-all cursor-pointer"
                        title="Delete Variant"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <p className="font-bold">No variants found for this product</p>
                <p className="text-xs text-slate-400 font-semibold mt-1">Create one using the form on the right.</p>
              </div>
            )}
          </div>
        </div>

        {/* Add / Edit Variant Form */}
        <div className="space-y-4">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-xs">
            <h2 className="text-lg font-bold text-[#2C3B5E] mb-4">
              {isVariantEditing ? "Edit Variant" : "Add New Variant"}
            </h2>

            <form onSubmit={handleVariantSave} className="space-y-4">
              {/* Variant Name */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-500">Variant Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 50ml - Lavender"
                  value={variantFormData.name}
                  onChange={(e) => setVariantFormData(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2.5 px-3.5 text-sm outline-none transition-all focus:border-[#2C3B5E] focus:bg-white"
                />
              </div>

              {/* Default Variant Checkbox */}
              <div className="flex items-center gap-2.5 pt-1 select-none">
                <input
                  type="checkbox"
                  id="is-default-variant"
                  checked={variantFormData.is_default}
                  onChange={(e) => setVariantFormData(prev => ({ ...prev, is_default: e.target.checked }))}
                  className="h-4 w-4 rounded border-slate-300 text-[#2C3B5E] focus:ring-[#2C3B5E]"
                />
                <label htmlFor="is-default-variant" className="text-xs font-bold text-slate-600 cursor-pointer">
                  Set as default variant
                </label>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3 pt-2">
                {isVariantEditing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsVariantEditing(null);
                      setVariantFormData({
                        name: "",
                        sku: `${product.sku || "PROD"}-VAR-${Date.now().toString().slice(-3)}`,
                        price: product.price ? product.price.replace(/[^\d.]/g, "") : "399.00",
                        sale_price: "",
                        stock_quantity: product.stock ? product.stock.toString() : "0",
                        weight: "0.100",
                        is_default: false,
                        attributes: { size: "", fragrance: "", color: "" }
                      });
                    }}
                    className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all cursor-pointer text-center"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#2C3B5E] hover:bg-[#1E2A47] text-white transition-all cursor-pointer shadow-md shadow-[#2C3B5E]/10"
                >
                  {isVariantEditing ? "Update Variant" : "Add Variant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
