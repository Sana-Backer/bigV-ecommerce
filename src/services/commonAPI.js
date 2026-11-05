
import axios from "axios";
import { api } from "./serverUrl";

export const commonAPI = async (
  httpMethod,
  url,
  reqBody,
  reqHeader,
  extraConfig = {}
) => {
  let token = null;
  let refreshToken = null;
  let tokenKey = "customerToken";
  let refreshKey = "customerRefreshToken";

  if (typeof window !== "undefined") {
    if (localStorage.getItem("adminToken")) {
      token = localStorage.getItem("adminToken");
      refreshToken = localStorage.getItem("adminRefreshToken");
      tokenKey = "adminToken";
      refreshKey = "adminRefreshToken";
    } else {
      token = localStorage.getItem("customerToken");
      refreshToken = localStorage.getItem("customerRefreshToken");
    }
  }

  const headers = { ...reqHeader };

  const isFormData =
    typeof FormData !== "undefined" && reqBody instanceof FormData;

  if (isFormData) {
    delete headers["Content-Type"];
    delete headers["content-type"];
  } else if (!headers["Content-Type"] && !headers["content-type"]) {
    headers["Content-Type"] = "application/json";
  }

  const isAuthRoute =
    url.includes("/auth/login/") ||
    url.includes("/auth/register/") ||
    url.includes("/auth/token/refresh/");

  if (token && !headers["Authorization"] && !isAuthRoute) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const reqConfig = {
    ...extraConfig,
    method: httpMethod,
    url,
    data: reqBody,
    headers,
  };

  try {
    return await axios(reqConfig);
  } catch (err) {
    if (
      err.response?.status === 401 &&
      !isAuthRoute &&
      refreshToken &&
      typeof window !== "undefined"
    ) {
      try {
        const refreshResponse = await axios.post(
          `${api}/auth/token/refresh/`,
          { refresh: refreshToken }
        );

        const newAccessToken = refreshResponse.data.access;

        if (newAccessToken) {
          localStorage.setItem(tokenKey, newAccessToken);

          headers["Authorization"] = `Bearer ${newAccessToken}`;
          reqConfig.headers = headers;

          return await axios(reqConfig);
        }
      } catch (refreshErr) {
        console.error("Token refresh failed:", refreshErr);

        localStorage.removeItem(tokenKey);
        localStorage.removeItem(refreshKey);

        window.location.href = window.location.pathname.startsWith("/admin")
          ? "/admin/login"
          : "/login";

        throw refreshErr;
      }
    }

    throw err;
  }
};
