import axiosInstance from './axiosInstance';

export const getDepartments = async () => {
  try {
    const response = await axiosInstance.get('/departments');
    return response;
  } catch (error) {
    throw error?.response?.data || { message: 'Failed to fetch departments' };
  }
};
