import axiosInstance from './axiosInstance';

// Get all patients
export const getPatients = async () => {
  try {
    return await axiosInstance.get("/patients");
  } catch (error) {
    throw error || { message: "Failed to fetch patient" };
  }
};

// Get patient by ID
export const getPatientById = async (id) => {
  try {
    const response = await axiosInstance.get(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch patient" };
  }
};

// Create a new patient
export const createPatient = async (patientData) => {
  try {
    return await axiosInstance.post("/patients", patientData);
  } catch (error) {
    throw error || { message: "Failed to fetch patient" };
  }
};

// Update patient
export const updatePatient = async (id, patientData) => {
  try {
    const response = await axiosInstance.patch(`/patients/${id}`, patientData);
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch patient" };
  }
};

// Delete patient
export const deletePatient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch patient" };
  }
};
