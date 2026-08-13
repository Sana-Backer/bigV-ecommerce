import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";
import axios from "axios";

// Helper to get or create guest token
export const getGuestToken = async () => {
  if (typeof window !== "undefined") {
    let guestToken = localStorage.getItem("guestToken");
    if (!guestToken) {
      try {
        const uniqueId = crypto.randomUUID().substring(0, 8);
        const res = await axios.post(`${api}/auth/guest/session/`, {
          email: `guest_${uniqueId}@example.com`,
          first_name: "Guest"
        });
        if (res.status === 201 && res.data?.data?.session_key) {
          guestToken = res.data.data.session_key;
          localStorage.setItem("guestToken", guestToken);
        }
      } catch (err) {
        console.error("Failed to create guest session", err);
      }
    }
    return guestToken;
  }
  return null;
};

// Helper to add guest token header if user is not authenticated
export const getAuthHeaders = async () => {
  const headers = {};
  if (typeof window !== "undefined" && !localStorage.getItem("customerToken")) {
    const guestToken = await getGuestToken();
    if (guestToken) {
      headers["X-Guest-Token"] = guestToken;
    }
  }
  return headers;
};

// Add item to cart
// reqBody should be: { product_id: "...", variant_id: "...", quantity: 1 }
export const addToCartApi = async (reqBody) => {
  const headers = await getAuthHeaders();
  return await commonAPI("POST", `${api}/cart/items/`, reqBody, headers);
};

// Get cart details
export const getCartApi = async () => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/cart/`, "", headers);
};

// Update cart item quantity
export const updateCartItemApi = async (itemId, quantity) => {
  const headers = await getAuthHeaders();
  return await commonAPI("PATCH", `${api}/cart/items/${itemId}/`, { quantity }, headers);
};

// Remove item from cart
export const removeCartItemApi = async (itemId) => {
  const headers = await getAuthHeaders();
  return await commonAPI("DELETE", `${api}/cart/items/${itemId}/`, {}, headers);
};

// Get cart summary
export const getCartSummaryApi = async () => {
  const headers = await getAuthHeaders();
  return await commonAPI("GET", `${api}/cart/summary/`, "", headers);
};

// Clear cart
export const clearCartApi = async () => {
  const headers = await getAuthHeaders();
  return await commonAPI("DELETE", `${api}/cart/clear/`, {}, headers);
};
