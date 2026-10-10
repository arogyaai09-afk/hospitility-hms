import axiosInstance from "./axiosInstance";

export const createProcedure = async (visitId, procedureData) => {
  try {
    return await axiosInstance.post(
      `/visits/${visitId}/procedures`,
      procedureData
    );
  } catch (error) {
    throw error || { message: "Failed to create procedure" };
  }
};

export const getProceduresByVisit = async (visitId) => {
  try {
    return await axiosInstance.get(
      `/visits/${visitId}/procedures`
    );
  } catch (error) {
    throw error || { message: "Failed to fetch procedures" };
  }
};

export const getProceduresByPatient = async (patientId) => {
  try {
    return await axiosInstance.get(
      `/patients/${patientId}/procedures`
    );
  } catch (error) {
    throw error || { message: "Failed to fetch patient procedures" };
  }
};