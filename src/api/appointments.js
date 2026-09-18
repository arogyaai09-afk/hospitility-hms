import axiosInstance from './axiosInstance';

// Get all appointments
export const getAppointments = async () => {
  try {
    const response = await axiosInstance.get('/appointments');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch appointments" };
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    const response = await axiosInstance.post('/appointments', appointmentData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create appointment" };
  }
};

// // Get appointment by ID
// export const getAppointmentById = async (id) => {
//   try {
//     const response = await axiosInstance.get(`/appointments/${id}`);
//     return response;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to fetch appointment" };
//   }
// };

// // Update appointment
// export const updateAppointment = async (id, appointmentData) => {
//   try {
//     const response = await axiosInstance.patch(`/appointments/${id}`, appointmentData);
//     return response;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to update appointment" };
//   }
// };

// // Delete appointment
// export const deleteAppointment = async (id) => {
//   try {
//     const response = await axiosInstance.delete(`/appointments/${id}`);
//     return response;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to delete appointment" };
//   }
// };
