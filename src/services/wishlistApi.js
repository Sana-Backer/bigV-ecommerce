import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Add product to wishlist
// reqBody should be: { product_id: "..." }
export const addToWishlistApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/wishlist/items/`, reqBody);
};

// Get wishlist details
export const getWishlistApi = async () => {
  return await commonAPI("GET", `${api}/wishlist/`, "");
};

// Remove item from wishlist
export const removeWishlistItemApi = async (itemId) => {
  return await commonAPI("DELETE", `${api}/wishlist/items/${itemId}/`, {});
};

// Move wishlist item to cart
// reqBody should be: { variant_id: "...", quantity: 1 }
export const moveWishlistItemToCartApi = async (itemId, reqBody) => {
  return await commonAPI("POST", `${api}/wishlist/items/${itemId}/move-to-cart/`, reqBody);
};

// Clear wishlist
export const clearWishlistApi = async () => {
  return await commonAPI("DELETE", `${api}/wishlist/clear/`, {});
};
