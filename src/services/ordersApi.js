import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";
import { getAuthHeaders } from "./cartApi";

// Fetch orders for admin
export const getAdminOrdersApi = async (queryString = "") => {
  return await commonAPI("GET", `${api}/admin/orders/${queryString}`, "");
};

// Update order status
export const updateOrderStatusApi = async (id, statusData) => {
  return await commonAPI("PATCH", `${api}/admin/orders/${id}/status/`, statusData);
};

// Update payment status
export const updateOrderPaymentStatusApi = async (id, paymentData) => {
  return await commonAPI("PATCH", `${api}/admin/orders/${id}/payment-status/`, paymentData);
};

// Fetch order detail
export const getAdminOrderDetailApi = async (id) => {
  return await commonAPI("GET", `${api}/admin/orders/${id}/`, "");
};

// Update fulfillment status
export const updateOrderFulfillmentStatusApi = async (id, fulfillmentData) => {
  return await commonAPI("PATCH", `${api}/admin/orders/${id}/fulfillment-status/`, fulfillmentData);
};

// Cancel order
export const cancelAdminOrderApi = async (id, cancelData = {}) => {
  return await commonAPI("POST", `${api}/admin/orders/${id}/cancel/`, cancelData);
};

// ==========================================
// Customer Facing APIs
// ==========================================

// Fetch customer orders (My Orders)
export const getMyOrdersApi = async (queryString = "") => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/orders/${queryString}`, "", headers);
};

// Fetch customer order details
export const getMyOrderDetailApi = async (id) => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/orders/${id}/`, "", headers);
};

// Fetch customer order details by order_number
export const getMyOrderByNumberApi = async (orderNumber) => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/orders/by-number/${orderNumber}/`, "", headers);
};

// Cancel customer order
export const cancelMyOrderApi = async (id, cancelData = {}) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/orders/${id}/cancel/`, cancelData, headers);
};
