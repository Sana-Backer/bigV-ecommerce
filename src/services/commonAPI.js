import axios from "axios";

export const commonAPI = async (httpMethod, url, reqBody, reqHeader) => {
  let token = null;
  if (typeof window !== "undefined") {
    token = localStorage.getItem("adminToken");
  }

  const headers = reqHeader ? { ...reqHeader } : { "Content-Type": "application/json" };
  const isAuthRoute = url.includes("/auth/login/") || url.includes("/auth/register/");
  if (token && !headers["Authorization"] && !isAuthRoute) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const reqConfig = {
    method: httpMethod,
    url,
    data: reqBody,
    headers: headers
  };

  return await axios(reqConfig)
    .then((result) => {
      return result;
    })
    .catch((err) => {
      return err;
    });
};
