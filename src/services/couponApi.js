import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Helper to get or create guest token for cart-facing coupon logic
const getGuestToken = () => {
  if (typeof window !== "undefined") {
    let guestToken = localStorage.getItem("guestToken");
    if (!guestToken) {
      guestToken = crypto.randomUUID();
      localStorage.setItem("guestToken", guestToken);
    }
    return guestToken;
  }
  return null;
};

// Helper to add guest token header if user is not authenticated
const getAuthHeaders = () => {
  const headers = {};
  if (typeof window !== "undefined" && !localStorage.getItem("customerToken")) {
    headers["X-Guest-Token"] = getGuestToken();
  }
  return headers;
};

// ---------------------------------------------------------------------------
// Cart-facing API
// ---------------------------------------------------------------------------

// Apply coupon to cart
// reqBody should be: { code: "COUPON_CODE" }
export const applyCouponApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/coupons/apply/`, reqBody, getAuthHeaders());
};

// Remove coupon from cart
export const removeCouponApi = async () => {
  return await commonAPI("DELETE", `${api}/coupons/remove/`, {}, getAuthHeaders());
};

// ---------------------------------------------------------------------------
// Admin API
// ---------------------------------------------------------------------------

// Get list of coupons (supports query params like ?is_active=true & search=...)
export const getAdminCouponsApi = async (queryParams = "") => {
  return await commonAPI("GET", `${api}/admin/coupons/${queryParams}`, "");
};

// Create a new coupon
export const createAdminCouponApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/admin/coupons/`, reqBody);
};

// Get coupon details by ID
export const getAdminCouponDetailApi = async (couponId) => {
  return await commonAPI("GET", `${api}/admin/coupons/${couponId}/`, "");
};

// Update coupon by ID
export const updateAdminCouponApi = async (couponId, reqBody) => {
  return await commonAPI("PATCH", `${api}/admin/coupons/${couponId}/`, reqBody);
};

// Delete (deactivate) coupon by ID
export const deleteAdminCouponApi = async (couponId) => {
  return await commonAPI("DELETE", `${api}/admin/coupons/${couponId}/`, {});
};
