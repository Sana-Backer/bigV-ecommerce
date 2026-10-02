import { api } from "./serverUrl";
import { commonAPI } from "./commonAPI";

// Assuming these dashboard routes are mounted under '/dashboard/' in your Django urls.
// Update the '/dashboard/' prefix if it's different in your main urls.py

export const getDashboardOverviewApi = async (reqHeader, range="30d") => {
    return await commonAPI("GET", `${api}/admin/dashboard/overview/?range=${range}`, "", reqHeader);
};

export const getSalesAnalyticsApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/admin/dashboard/sales-analytics/`, "", reqHeader);
};

export const getTopSellingProductsApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/admin/dashboard/top-selling/`, "", reqHeader);
};

export const getTopCategoriesApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/admin/dashboard/top-categories/`, "", reqHeader);
};

export const getRevenueOverviewApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/admin/dashboard/revenue-overview/`, "", reqHeader);
};

export const getRecentOrdersApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/admin/dashboard/recent-orders/`, "", reqHeader);
};
