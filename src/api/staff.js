import axiosInstance from './axiosInstance';

export const getStaff = async () => {
  try {
    const response = await axiosInstance.get('/staff');
    return response;
  } catch (error) {
    throw error?.response?.data || { message: 'Failed to fetch staff' };
  }
};

export const createStaff = async (staffData) => {
  try {
    const response = await axiosInstance.post('/staff', staffData);
    return response;
  } catch (error) {
    throw error?.response?.data || { message: 'Failed to create staff member' };
  }
};
