import axiosInstance from './axiosInstance';

// Create discharge summary
export const createDischargeSummary = async (admissionId, summary, followUpInstructions = "") => {
  try {
    const response = await axiosInstance.post('/discharge', {
      admissionId,
      summary,
      followUpInstructions,
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create discharge summary" };
  }
};

// Get discharge summary
export const getDischargeSummary = async (id) => {
  try {
    const response = await axiosInstance.get(`/discharge/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch discharge summary" };
  }
};
