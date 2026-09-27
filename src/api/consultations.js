import axiosInstance from "./axiosInstance";

export const createConsultation = async (visitId, consultationData) => {
  try {
    return await axiosInstance.post(
      `/visits/${visitId}/consultation`,
      consultationData
    );
  } catch (error) {
    throw error || { message: "Failed to create consultation" };
  }
};

export const getConsultationByVisit = async (visitId) => {
  try {
    return await axiosInstance.get(
      `/visits/${visitId}/consultation`
    );
  } catch (error) {
    throw error || { message: "Failed to fetch consultation" };
  }
};

export const updateConsultation = async (
  consultationId,
  consultationData
) => {
  try {
    return await axiosInstance.patch(
      `/consultations/${consultationId}`,
      consultationData
    );
  } catch (error) {
    throw error || { message: "Failed to update consultation" };
  }
};