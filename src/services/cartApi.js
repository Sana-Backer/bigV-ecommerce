import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Helper to get or create guest token
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

// Add item to cart
// reqBody should be: { product_id: "...", variant_id: "...", quantity: 1 }
export const addToCartApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/cart/items/`, reqBody, getAuthHeaders());
};

// Get cart details
export const getCartApi = async () => {
  return await commonAPI("GET", `${api}/cart/`, "", getAuthHeaders());
};

// Update cart item quantity
export const updateCartItemApi = async (itemId, quantity) => {
  return await commonAPI("PATCH", `${api}/cart/items/${itemId}/`, { quantity }, getAuthHeaders());
};

// Remove item from cart
export const removeCartItemApi = async (itemId) => {
  return await commonAPI("DELETE", `${api}/cart/items/${itemId}/`, {}, getAuthHeaders());
};

// Get cart summary
export const getCartSummaryApi = async () => {
  return await commonAPI("GET", `${api}/cart/summary/`, "", getAuthHeaders());
};

// Clear cart
export const clearCartApi = async () => {
  return await commonAPI("DELETE", `${api}/cart/clear/`, {}, getAuthHeaders());
};
