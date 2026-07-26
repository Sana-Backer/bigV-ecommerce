import api from "./serverUrl";
import { commonAPI } from "./commonAPI";

/**
 * Fetch users from the admin panel
 * @param {string} role - Filter by role (e.g. 'customer', 'staff', 'manager', 'admin')
 * @param {string} search - Search query term
 * @param {boolean} isActive - Filter by active state
 * @returns {Promise<any>} Response from backend
 */
export const getUsersApi = async (role = "", search = "", isActive = null) => {
  let url = `${api}/admin/users/?`;
  const params = [];
  if (role) params.push(`role=${encodeURIComponent(role)}`);
  if (search) params.push(`search=${encodeURIComponent(search)}`);
  if (isActive !== null) params.push(`is_active=${isActive}`);

  url += params.join("&");
  return await commonAPI("GET", url, {});
};

/**
 * Update user details
 * @param {string} id - User ID (UUID)
 * @param {object} reqBody - Request body with first_name, last_name, phone, is_active
 * @returns {Promise<any>} Response from backend
 */
export const updateUserApi = async (id, reqBody) => {
  return await commonAPI("PUT", `${api}/admin/users/${id}/`, reqBody);
};

/**
 * Deactivate a user
 * @param {string} id - User ID (UUID)
 * @returns {Promise<any>} Response from backend
 */
export const deactivateUserApi = async (id) => {
  return await commonAPI("DELETE", `${api}/admin/users/${id}/`, {});
};

/**
 * Change a user's role (Admin only)
 * @param {string} id - User ID (UUID)
 * @param {string} role - The new role ('customer', 'staff', 'manager', 'admin')
 * @returns {Promise<any>} Response from backend
 */
export const changeUserRoleApi = async (id, role) => {
  return await commonAPI("POST", `${api}/admin/users/${id}/role/`, { role });
};

export const getStaffListApi = async () => {
  return await commonAPI("GET", `${api}/admin/staff/`, "");
};

export const createStaffApi = async (reqBody) => {
  return await commonAPI("POST", `${api}/admin/staff/`, reqBody);
};
