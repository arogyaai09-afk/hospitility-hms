// dashboard.js
import axiosInstance from "./axiosInstance";

export const getDashboardSummary = async (params = {}) => {
  try {
    return await axiosInstance.get("/analytics/overview", {
      params,
    });
  } catch (error) {
    throw error || {
      message: "Failed to fetch dashboard analytics",
    };
  }
};