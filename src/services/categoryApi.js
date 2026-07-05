import api from "./serverUrl";
import { commonAPI } from "./commonAPI";

export const addCategoryApi = async (reqBody, reqHeader) => {
    return await commonAPI("POST", `${api}/categories/`, reqBody, reqHeader);
};

export const getCategoriesApi = async (reqHeader) => {
    return await commonAPI("GET", `${api}/categories/`, "", reqHeader);
};

export const updateCategoryApi = async (id, reqBody, reqHeader) => {
    return await commonAPI("PUT", `${api}/categories/${id}/`, reqBody, reqHeader);
};

export const deleteCategoryApi = async (id, reqHeader) => {
    return await commonAPI("DELETE", `${api}/categories/${id}/`, "", reqHeader);
};