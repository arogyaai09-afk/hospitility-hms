import axiosInstance from './axiosInstance';

// Login user
export const loginUser = async (email, password) => {
  try {
    const response = await axiosInstance.post('/auth/login', {
      email,
      password,
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Login failed" };
  }
};

// Register a new user
export const registerUser = async (name, email, password, role = "staff", tenantId = "") => {
  try {
    const response = await axiosInstance.post('/auth/register', {
      name,
      email,
      password,
      role,
      tenantId,
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Registration failed" };
  }
};

// Get user profile
export const getUserProfile = async () => {
  try {
    const response = await axiosInstance.get('/auth/profile');
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
  try {
    const response = await axiosInstance.post('/auth/refresh', {
      refreshToken,
    });
    return response;
  } catch (error) {
    throw error.response?.data || { message: "Token refresh failed" };
  }
};
