import axiosInstance from './axiosInstance';

// Get all patients
export const getPatients = async () => {
  try {
    const response = await axiosInstance.get('/patients');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch patients" };
  }
};

// Get patient by ID
export const getPatientById = async (id) => {
  try {
    const response = await axiosInstance.get(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch patient" };
  }
};

// Create a new patient
export const createPatient = async (patientData) => {
  try {
    const response = await axiosInstance.post('/patients', patientData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create patient" };
  }
};

// Update patient
export const updatePatient = async (id, patientData) => {
  try {
    const response = await axiosInstance.patch(`/patients/${id}`, patientData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update patient" };
  }
};

// Delete patient
export const deletePatient = async (id) => {
  try {
    const response = await axiosInstance.delete(`/patients/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete patient" };
  }
};
