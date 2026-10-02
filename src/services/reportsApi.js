import { api } from "./serverUrl";
import { commonAPI } from "./commonAPI";

// Admin Reports APIs

export const getSalesReportApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/reports/sales/${queryString}`, "", reqHeader);
};

export const getProductsReportApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/reports/products/${queryString}`, "", reqHeader);
};

export const getCustomersReportApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/reports/customers/${queryString}`, "", reqHeader);
};

export const getInventoryReportApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/reports/inventory/${queryString}`, "", reqHeader);
};

export const getOrderStatusReportApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/reports/order-status/${queryString}`, "", reqHeader);
};
