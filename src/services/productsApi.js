import { api } from "./serverUrl";
import { commonAPI } from "./commonAPI";

export const addProductApi = async (reqBody) => {
    return await commonAPI("POST", `${api}/products/`, reqBody);
};

export const getProductsApi = async (query = "") => {
    return await commonAPI("GET", `${api}/products/${query ? `?${query}` : ''}`, "");
};

export const getProductDetailApi = async (id) => {
    return await commonAPI("GET", `${api}/products/${id}/`, "");
};

export const getFeaturedProductsApi = async () => {
    return await commonAPI("GET", `${api}/products/featured/`, "");
};

export const getProductsByCategoryApi = async (slug, query = "") => {
    return await commonAPI("GET", `${api}/products/by-category/${slug}/${query ? `?${query}` : ''}`, "");
};

export const searchProductsApi = async (searchQuery) => {
    return await commonAPI("GET", `${api}/products/search/?search=${encodeURIComponent(searchQuery)}`, "");
};

export const getProductFilterOptionsApi = async (query = "") => {
    return await commonAPI("GET", `${api}/products/filters/${query ? `?${query}` : ''}`, "");
};

export const updateProductApi = async (id, reqBody) => {
    return await commonAPI("PUT", `${api}/products/${id}/`, reqBody);
};

export const deleteProductApi = async (id) => {
    return await commonAPI("DELETE", `${api}/products/${id}/`, "");
};

export const addProductImageApi = async (productId, reqBody, reqHeader) => {
    return await commonAPI("POST", `${api}/products/${productId}/images/`, reqBody, reqHeader);
};

export const addProductVariantApi = async (productId, reqBody) => {
    return await commonAPI("POST", `${api}/products/${productId}/variants/`, reqBody);
};

export const updateProductVariantApi = async (variantId, reqBody) => {
    return await commonAPI("PUT", `${api}/variants/${variantId}/`, reqBody);
};

export const getProductVariantsApi = async (productId) => {
    return await commonAPI("GET", `${api}/products/${productId}/variants/`, "");
};

export const deleteProductVariantApi = async (variantId) => {
    return await commonAPI("DELETE", `${api}/variants/${variantId}/`, "");
};

export const deleteProductImageApi = async (imageId) => {
    return await commonAPI("DELETE", `${api}/images/${imageId}/`, "");
};