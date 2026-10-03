import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Fetch active banners for the storefront (Public API)
export const getActiveBannersApi = async () => {
  return await commonAPI("GET", `${api}/api/banners/`, "", "");
};

// Admin APIs for banners
export const getAdminBannersApi = async (reqHeader) => {
  return await commonAPI("GET", `${api}/api/admin/banners/`, "", reqHeader);
};

export const createBannerApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${api}/api/admin/banners/`, data, reqHeader);
};

export const updateBannerApi = async (id, data, reqHeader) => {
  return await commonAPI("PATCH", `${api}/api/admin/banners/${id}/`, data, reqHeader);
};

export const deleteBannerApi = async (id, reqHeader) => {
  return await commonAPI("DELETE", `${api}/api/admin/banners/${id}/`, "", reqHeader);
};
