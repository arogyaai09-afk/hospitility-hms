import axiosInstance from './axiosInstance';

// Get all beds
export const getBeds = async () => {
  try {
    const response = await axiosInstance.get('/beds');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch beds" };
  }
};

// Get available beds
export const getAvailableBeds = async () => {
  try {
    const response = await axiosInstance.get('/beds/available');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch available beds" };
  }
};

// Create a new bed
export const createBed = async (bedData) => {
  try {
    const response = await axiosInstance.post('/beds', bedData);
    return response;
  } catch (error) {
    throw error || { message: "Failed to create bed" };
  }
};

// Update bed
export const updateBed = async (id, bedData) => {
  try {
    const response = await axiosInstance.patch(`/beds/${id}`, bedData);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update bed" };
  }
};

// Delete bed
export const deleteBed = async (id) => {
  try {
    const response = await axiosInstance.delete(`/beds/${id}`);
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete bed" };
  }
};
