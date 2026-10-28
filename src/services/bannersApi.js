import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Fetch active banners for the storefront (Public API)
export const getActiveBannersApi = async (placement = "") => {
  const query = placement ? `?placement=${encodeURIComponent(placement)}` : "";
  return await commonAPI("GET", `${api}/banners/${query}`, "", "");
};

// Admin APIs for banners
export const getAdminBannersApi = async (params = {}, reqHeader) => {
  let query = "";
  if (params && typeof params === "object") {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        searchParams.append(key, val);
      }
    });
    const qs = searchParams.toString();
    if (qs) query = `?${qs}`;
  }
  return await commonAPI("GET", `${api}/admin/banners/${query}`, "", reqHeader);
};

export const createBannerApi = async (data, reqHeader) => {
  return await commonAPI("POST", `${api}/admin/banners/`, data, reqHeader);
};

export const updateBannerApi = async (id, data, reqHeader) => {
  return await commonAPI("PATCH", `${api}/admin/banners/${id}/`, data, reqHeader);
};

export const deleteBannerApi = async (id, reqHeader) => {
  return await commonAPI("DELETE", `${api}/admin/banners/${id}/`, "", reqHeader);
};
