import axiosInstance from "./axiosInstance";

// Login
export const loginUser = async (email, password) => {
  try {
    return await axiosInstance.post("/auth/login", {
      email,
      password,
    });
  } catch (error) {
    throw error?.response?.data || error || {
      message: "Login failed",
    };
  }
};

// Register
export const registerUser = async (
  name,
  email,
  password,
  role = "staff",
  tenantId = ""
) => {
  try {
    return await axiosInstance.post("/auth/register", {
      name,
      email,
      password,
      role,
      tenantId,
    });
  } catch (error) {
    throw error?.response?.data || error || {
      message: "Registration failed",
    };
  }
};

// Get logged-in user's profile
export const getUserProfile = async () => {
  try {
    return await axiosInstance.get("/auth/profile");
  } catch (error) {
    throw error?.response?.data || error || {
      message: "Failed to fetch profile",
    };
  }
};

// Refresh access token
export const refreshAccessToken = async (refreshToken) => {
  try {
    return await axiosInstance.post("/auth/refresh", {
      refreshToken,
    });
  } catch (error) {
    throw error?.response?.data || error || {
      message: "Token refresh failed",
    };
  }
};

/*
 * PROFILE UPDATE
 *
 * Backend me abhi profile update API documented/available nahi hai.
 *
 * Future me backend update-profile endpoint milne par
 * isi file me function add kar denge.
 */