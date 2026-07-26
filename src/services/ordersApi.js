import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

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
