import axiosInstance from "./axiosInstance";

// Get all emergencies
export const getEmergencies = async () => {
  try {
    return await axiosInstance.get("/emergencies");
  } catch (error) {
    throw error || { message: "Failed to fetch emergencies" };
  }
};

// // Get emergency by ID
// export const getEmergencyById = async (id) => {
//   try {
//     return await axiosInstance.get(`/emergencies/${id}`);
//   } catch (error) {
//     throw error || { message: "Failed to fetch emergency" };
//   }
// };

// Create emergency case
export const createEmergency = async (emergencyData) => {
  try {
    return await axiosInstance.post("/emergencies", emergencyData);
  } catch (error) {
    throw error || { message: "Failed to create emergency case" };
  }
};

// Admit emergency to IPD
export const admitEmergency = async (emergencyId, bedNumber, doctorId) => {
  try {
    return await axiosInstance.post(
      `/emergencies/${emergencyId}/admit`,
      {
        bedNumber,
        doctorId,
      }
    );
  } catch (error) {
    throw error || { message: "Failed to admit emergency" };
  }
};

// Update emergency
export const updateEmergency = async (id, emergencyData) => {
  try {
    return await axiosInstance.patch(
      `/emergencies/${id}`,
      emergencyData
    );
  } catch (error) {
    throw error || { message: "Failed to update emergency" };
  }
};