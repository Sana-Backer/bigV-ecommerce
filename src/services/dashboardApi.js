import { api } from "./serverUrl";
import { commonAPI } from "./commonAPI";

export const getDashboardOverviewApi = async (range = "30d") => {
  return await commonAPI("GET", `${api}/admin/dashboard/overview/?range=${range}`, "");
};

export const getSalesAnalyticsApi = async (period = "weekly") => {
  return await commonAPI("GET", `${api}/admin/dashboard/sales-analytics/?period=${period}`, "");
};

export const getTopSellingProductsApi = async (limit = 5) => {
  return await commonAPI("GET", `${api}/admin/dashboard/top-selling/?limit=${limit}`, "");
};

export const getTopCategoriesApi = async () => {
  return await commonAPI("GET", `${api}/admin/dashboard/top-categories/`, "");
};

export const getRevenueOverviewApi = async (months = 7) => {
  return await commonAPI("GET", `${api}/admin/dashboard/revenue-overview/?months=${months}`, "");
};

export const getRecentOrdersApi = async (limit = 10) => {
  return await commonAPI("GET", `${api}/admin/dashboard/recent-orders/?limit=${limit}`, "");
};
