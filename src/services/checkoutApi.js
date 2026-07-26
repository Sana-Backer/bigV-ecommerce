import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Helper to get guest token
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

// Validate cart for checkout
// reqBody is typically empty but can contain specific validation flags if needed by backend
export const checkoutValidateApi = async (reqBody = {}) => {
  return await commonAPI("POST", `${api}/checkout/validate/`, reqBody, getAuthHeaders());
};

// Get checkout quote (pricing, shipping, taxes, discounts)
// reqBody can optionally contain { coupon_code: "..." }
export const checkoutQuoteApi = async (reqBody = {}) => {
  return await commonAPI("POST", `${api}/checkout/quote/`, reqBody, getAuthHeaders());
};

// Create the final order
/* 
reqBody example:
{
  shipping_address_id: "uuid" (if authenticated),
  billing_address_id: "uuid" (if authenticated),
  guest_email: "...",
  guest_phone: "...",
  guest_shipping_address: { ... },
  guest_billing_address: { ... },
  coupon_code: "...",
  payment_method: "CARD" / "COD" / etc,
  notes: "..."
}
*/
export const createOrderApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/checkout/create-order/`, reqBody, getAuthHeaders());
};
