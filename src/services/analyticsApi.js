import { api } from "./serverUrl";
import { commonAPI } from "./commonAPI";

// Admin Analytics APIs

export const getRevenueTrendAnalyticsApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/analytics/revenue-trend/${queryString}`, "", reqHeader);
};

export const getCategoryPerformanceAnalyticsApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/analytics/category-performance/${queryString}`, "", reqHeader);
};

export const getCustomerGrowthAnalyticsApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/analytics/customer-growth/${queryString}`, "", reqHeader);
};

export const getAverageOrderValueAnalyticsApi = async (reqHeader, queryString = "") => {
  return await commonAPI("GET", `${api}/admin/analytics/average-order-value/${queryString}`, "", reqHeader);
};
