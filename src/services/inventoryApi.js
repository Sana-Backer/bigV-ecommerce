import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

const INVENTORY_BASE_URL = `${api}/admin/inventory`;

// ------------------------------------------------------------------
// Stock Management
// ------------------------------------------------------------------
export const getStockListApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/stock/`, "", reqHeader);
};

export const getStockSummaryApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/stock/summary/`, "", reqHeader);
};

export const adjustStockApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/stock/adjust/`, data, reqHeader);
};

export const bulkAdjustStockApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/stock/bulk-adjust/`, data, reqHeader);
};

export const setStockApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/stock/set/`, data, reqHeader);
};

export const exportStockApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/stock/export/`, "", reqHeader);
};

export const importStockApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/stock/import/`, data, reqHeader);
};

export const getMovementsApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/movements/`, "", reqHeader);
};

// ------------------------------------------------------------------
// Inventory Policies
// ------------------------------------------------------------------
export const getPoliciesApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/policies/`, "", reqHeader);
};

export const createPolicyApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/policies/`, data, reqHeader);
};

export const updatePolicyApi = async (id, data, reqHeader) => {
  return await commonAPI("PATCH", `${INVENTORY_BASE_URL}/policies/${id}/`, data, reqHeader);
};

export const deletePolicyApi = async (id, reqHeader) => {
  return await commonAPI("DELETE", `${INVENTORY_BASE_URL}/policies/${id}/`, "", reqHeader);
};

// ------------------------------------------------------------------
// Suppliers
// ------------------------------------------------------------------
export const getSuppliersApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/suppliers/`, "", reqHeader);
};

export const createSupplierApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/suppliers/`, data, reqHeader);
};

export const updateSupplierApi = async (id, data, reqHeader) => {
  return await commonAPI("PATCH", `${INVENTORY_BASE_URL}/suppliers/${id}/`, data, reqHeader);
};

export const deleteSupplierApi = async (id, reqHeader) => {
  return await commonAPI("DELETE", `${INVENTORY_BASE_URL}/suppliers/${id}/`, "", reqHeader);
};

// ------------------------------------------------------------------
// Purchase Orders
// ------------------------------------------------------------------
export const getPurchaseOrdersApi = async (reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/purchase-orders/`, "", reqHeader);
};

export const createPurchaseOrderApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/purchase-orders/`, data, reqHeader);
};

export const getPurchaseOrderDetailsApi = async (id, reqHeader) => {
  return await commonAPI("GET", `${INVENTORY_BASE_URL}/purchase-orders/${id}/`, "", reqHeader);
};

export const markPurchaseOrderOrderedApi = async (id, data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/purchase-orders/${id}/mark-ordered/`, data, reqHeader);
};

export const receivePurchaseOrderApi = async (id, data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/purchase-orders/${id}/receive/`, data, reqHeader);
};

export const cancelPurchaseOrderApi = async (id, data, reqHeader) => {
  return await commonAPI("POST", `${INVENTORY_BASE_URL}/purchase-orders/${id}/cancel/`, data, reqHeader);
};
