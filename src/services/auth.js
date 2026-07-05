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