import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Create Razorpay order (Backend returns Razorpay order details)
export const razorpayCreateOrderApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/payments/razorpay/create/`, reqBody, "");
};

// Verify Razorpay payment signature
export const razorpayVerifyPaymentApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/payments/razorpay/verify/`, reqBody, "");
};
