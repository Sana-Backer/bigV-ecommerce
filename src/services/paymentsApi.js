import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";
import { getAuthHeaders } from "./cartApi";

// Create Razorpay order (Backend returns Razorpay order details)
export const razorpayCreateOrderApi = async (reqBody) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/payments/razorpay/create/`, reqBody, headers);
};

// Verify Razorpay payment signature
export const razorpayVerifyPaymentApi = async (reqBody) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/payments/razorpay/verify/`, reqBody, headers);
};

// Initiate Razorpay refund
export const razorpayRefundApi = async (reqBody) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/payments/razorpay/refund/`, reqBody, headers);
};

// ==========================================
// Admin Facing APIs
// ==========================================

export const getAdminPaymentsApi = async (queryString = "") => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/admin/payments/${queryString}`, "", headers);
};

export const getAdminPaymentDetailApi = async (id) => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/admin/payments/${id}/`, "", headers);
};

// Razorpay webhook
export const razorpayWebhookApi = async (reqBody) => {
  // Webhooks often don't require auth headers from the client in the same way, 
  // but if this is triggered manually from the frontend, it might use them.
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/payments/webhooks/razorpay/`, reqBody, headers);
};
