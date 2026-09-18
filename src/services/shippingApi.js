import { commonAPI } from "./commonAPI";
import { api } from "./serverUrl";

// Check if a pincode is serviceable
export const checkServiceabilityApi = async (pincode, isCOD) => {
  const codQuery = isCOD ? "&cod=true" : "&cod=false";
  return await commonAPI("GET", `${api}/shipping/serviceability/?delivery_postcode=${pincode}${codQuery}`, "");
};
