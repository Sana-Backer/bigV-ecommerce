import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";
import { getAuthHeaders } from "./cartApi";

// Validate cart for checkout
// reqBody is typically empty but can contain specific validation flags if needed by backend
export const checkoutValidateApi = async (reqBody = {}) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/checkout/validate/`, reqBody, headers);
};

// Get checkout quote (pricing, shipping, taxes, discounts)
// reqBody can optionally contain { coupon_code: "..." }
export const checkoutQuoteApi = async (reqBody = {}) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/checkout/quote/`, reqBody, headers);
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
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/checkout/create-order/`, reqBody, headers);
};
