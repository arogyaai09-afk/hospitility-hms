import axiosInstance from "./axiosInstance";

// Create a new visit for a patient
export const createVisit = async (patientId, visitData) => {
  try {
    return await axiosInstance.post(
      `/patients/${patientId}/visits`,
      visitData
    );
  } catch (error) {
    throw error || { message: "Failed to create visit" };
  }
};

// Get all visits for a patient
export const getPatientVisits = async (patientId) => {
  try {
    return await axiosInstance.get(`/patients/${patientId}/visits`);
  } catch (error) {
    throw error || { message: "Failed to fetch patient visits" };
  }
};

// Get a single visit by ID
export const getVisitById = async (visitId) => {
  try {
    return await axiosInstance.get(`/visits/${visitId}`);
  } catch (error) {
    throw error || { message: "Failed to fetch visit" };
  }
};

// Update visit status
export const updateVisitStatus = async (visitId, status) => {
  try {
    return await axiosInstance.patch(
      `/visits/${visitId}/status`,
      { status }
    );
  } catch (error) {
    throw error || { message: "Failed to update visit status" };
  }
};

// Get complete history for a visit
export const getVisitHistory = async (visitId) => {
  try {
    return await axiosInstance.get(`/visits/${visitId}/history`);
  } catch (error) {
    throw error || { message: "Failed to fetch visit history" };
  }
};