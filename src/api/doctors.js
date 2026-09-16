import axiosInstance from './axiosInstance';

// Get all doctors
export const getDoctors = async (tenantId = "") => {
  try {
    const response = await axiosInstance.get('/doctors', {
      params: tenantId ? { tenantId } : {},
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch doctors" };
  }
};

// Get doctor by ID
export const getDoctorById = async (id) => {
  try {
    const response = await axiosInstance.get(`/doctors/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch doctor" };
  }
};

// Create a new doctor
export const createDoctor = async (doctorData) => {
  try {
    const response = await axiosInstance.post('/doctors', doctorData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create doctor" };
  }
};

// Update doctor
export const updateDoctor = async (id, doctorData) => {
  try {
    const response = await axiosInstance.patch(`/doctors/${id}`, doctorData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update doctor" };
  }
};

// Delete doctor
export const deleteDoctor = async (id) => {
  try {
    const response = await axiosInstance.delete(`/doctors/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete doctor" };
  }
};
