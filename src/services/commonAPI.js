import axios from "axios";
import { api } from "./serverUrl";

export const commonAPI = async (httpMethod, url, reqBody, reqHeader) => {
  let token = null;
  let refreshToken = null;
  let tokenKey = "customerToken";
  let refreshKey = "customerRefreshToken";

  if (typeof window !== "undefined") {
    // If adminToken exists, prioritize admin auth
    if (localStorage.getItem("adminToken")) {
      token = localStorage.getItem("adminToken");
      refreshToken = localStorage.getItem("adminRefreshToken");
      tokenKey = "adminToken";
      refreshKey = "adminRefreshToken";
    } else {
      token = localStorage.getItem("customerToken");
      refreshToken = localStorage.getItem("customerRefreshToken");
      tokenKey = "customerToken";
      refreshKey = "customerRefreshToken";
    }
  }

  const headers = reqHeader ? { ...reqHeader } : { "Content-Type": "application/json" };
  const isAuthRoute = url.includes("/auth/login/") || url.includes("/auth/register/") || url.includes("/auth/token/refresh/");

  if (token && !headers["Authorization"] && !isAuthRoute) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const reqConfig = {
    method: httpMethod,
    url,
    data: reqBody,
    headers: headers
  };

  try {
    const result = await axios(reqConfig);
    return result;
  } catch (err) {
    // If 401 Unauthorized and we have a refresh token, try to refresh
    if (err.response && err.response.status === 401 && !isAuthRoute && refreshToken) {
      try {
        const refreshResponse = await axios.post(`${api}/auth/token/refresh/`, {
          refresh: refreshToken
        });
        if (refreshResponse && refreshResponse.status === 200) {
          const newAccessToken = refreshResponse.data.access;
          if (newAccessToken) {
            localStorage.setItem(tokenKey, newAccessToken);
            headers["Authorization"] = `Bearer ${newAccessToken}`;
            reqConfig.headers = headers;
            // Retry the original request
            const retryResult = await axios(reqConfig);
            return retryResult;
          }
        }
      } catch (refreshErr) {
        console.error("Token refresh failed, redirecting to login:", refreshErr);
        if (typeof window !== "undefined") {
          localStorage.removeItem(tokenKey);
          localStorage.removeItem(refreshKey);
          if (window.location.pathname.startsWith("/admin")) {
            window.location.href = "/admin/login";
          } else {
            window.location.href = "/login";
          }
        }
      }
    }
    return err;
  }
};
