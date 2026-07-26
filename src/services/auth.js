import api from "./serverUrl";
import { commonAPI } from "./commonAPI";

export const adminLoginApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/login/`, reqBody);
};

export const userRegisterApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/register/`, reqBody);
};

export const userLoginApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/login/`, reqBody);
};

export const logoutApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/logout/`, reqBody);
};

export const tokenRefreshApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/token/refresh/`, reqBody);
};

export const getMeApi = async () => {
  return await commonAPI("GET", `${api}/auth/me/`, "");
};

export const updateMeApi = async (reqBody) => {
  return await commonAPI("PUT", `${api}/auth/me/`, reqBody);
};

// ── Profile ────────────────────────────────────────────────────────────

export const getMyProfileApi = async () => {
  return await commonAPI("GET", `${api}/auth/me/profile/`, "");
};

export const updateMyProfileApi = async (reqBody) => {
  return await commonAPI("PUT", `${api}/auth/me/profile/`, reqBody);
};

// ── Addresses ──────────────────────────────────────────────────────────

export const getMyAddressesApi = async () => {
  return await commonAPI("GET", `${api}/auth/me/addresses/`, "");
};

export const addMyAddressApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/auth/me/addresses/`, reqBody);
};

export const getMyAddressDetailApi = async (id) => {
  return await commonAPI("GET", `${api}/auth/me/addresses/${id}/`, "");
};

export const updateMyAddressApi = async (id, reqBody) => {
  return await commonAPI("PUT", `${api}/auth/me/addresses/${id}/`, reqBody);
};

export const patchMyAddressApi = async (id, reqBody) => {
  return await commonAPI("PATCH", `${api}/auth/me/addresses/${id}/`, reqBody);
};

export const deleteMyAddressApi = async (id) => {
  return await commonAPI("DELETE", `${api}/auth/me/addresses/${id}/`, {});
};