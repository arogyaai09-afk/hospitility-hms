import axiosInstance from './axiosInstance';

export const getStaff = async () => {
  try {
    const response = await axiosInstance.get('/staff');
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch staff" };
  }
};

export const createStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post('/staff', staffData);
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch staff" };
  }
};

export const getStaffById = async (id) => {
  try {
    const response = await axiosInstance.get(`/staff/${id}`);
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch staff member" };
  }
};

export const updateStaff = async (id, staffData) => {
  try {
    const response = await axiosInstance.patch(`/staff/${id}`, staffData);
    return response;
  } catch (error) {
    throw error || { message: "Failed to update staff member" };
  }
};

export const deleteStaff = async (id) => {
  try {
    const response = await axiosInstance.delete(`/staff/${id}`);
    return response;
  } catch (error) {
    throw error || { message: "Failed to delete staff member" };
  }
};