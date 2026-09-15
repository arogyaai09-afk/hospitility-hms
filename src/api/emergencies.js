import axiosInstance from './axiosInstance';

// Get all emergencies
export const getEmergencies = async () => {
  try {
    const response = await axiosInstance.get('/emergencies');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch emergencies" };
  }
};

// Get emergency by ID
export const getEmergencyById = async (id) => {
  try {
    const response = await axiosInstance.get(`/emergencies/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch emergency" };
  }
};

// Create emergency case
export const createEmergency = async (emergencyData) => {
  try {
    const response = await axiosInstance.post('/emergencies', emergencyData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create emergency case" };
  }
};

// Admit emergency to IPD
export const admitEmergency = async (emergencyId, bedNumber, doctorId) => {
  try {
    const response = await axiosInstance.post(`/emergencies/${emergencyId}/admit`, {
      bedNumber,
      doctorId,
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to admit emergency" };
  }
};

// Update emergency
export const updateEmergency = async (id, emergencyData) => {
  try {
    const response = await axiosInstance.patch(`/emergencies/${id}`, emergencyData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update emergency" };
  }
};
