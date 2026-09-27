import axiosInstance from './axiosInstance';

// Get all appointments
export const getAppointments = async () => {
  try {
    return await axiosInstance.get("/appointments");
  } catch (error) {
    throw error || { message: "Failed to fetch appointments" };
  }
};

// Create a new appointment
export const createAppointment = async (appointmentData) => {
  try {
    return await axiosInstance.post("/appointments", appointmentData);
  } catch (error) {
    throw error || { message: "Failed to create appointment" };
  }
};

// Check in an appointment
export const checkInAppointment = async (appointmentId) => {
  try {
    return await axiosInstance.post(
      `/appointments/${appointmentId}/check-in`
    );
  } catch (error) {
    throw error || { message: "Failed to check in appointment" };
  }
};

// Get appointment by ID
export const getAppointmentById = async (appointmentId) => {
  try {
    return await axiosInstance.get(`/appointments/${appointmentId}`);
  } catch (error) {
    throw error || { message: "Failed to fetch appointment" };
  }
};


// Update appointment
export const updateAppointment = async (id, appointmentData) => {
  try {
    return await axiosInstance.patch(
      `/appointments/${id}`,
      appointmentData
    );
  } catch (error) {
    throw error?.response?.data || {
      message: "Failed to update appointment",
    };
  }
};

// Delete appointment
export const deleteAppointment = async (id) => {
  try {
    return await axiosInstance.delete(`/appointments/${id}`);
  } catch (error) {
    throw error?.response?.data || {
      message: "Failed to delete appointment",
    };
  }
};