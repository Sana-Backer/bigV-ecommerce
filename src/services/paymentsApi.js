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
