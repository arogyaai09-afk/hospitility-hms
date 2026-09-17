import axiosInstance from "./axiosInstance";

// Fetch dashboard summary. If the backend endpoint is unavailable,
// Dashboard.jsx falls back to its existing mock data.
export const getDashboardSummary = async (params = {}) => {
  try {
    return await axiosInstance.get("/dashboard/summary", {
      params,
    });
  } catch (error) {
    throw error?.response?.data || error || { message: "Failed to fetch dashboard summary" };
  }
};
