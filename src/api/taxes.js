import axiosInstance from "./axiosInstance";

export const getTaxes = async (isActive) => {
  try {
    const query =
      typeof isActive === "boolean"
        ? `?isActive=${isActive}`
        : "";

    return await axiosInstance.get(`/taxes${query}`);
  } catch (error) {
    throw error || { message: "Failed to fetch taxes" };
  }
};

export const getTaxById = async (id) => {
  try {
    return await axiosInstance.get(`/taxes/${id}`);
  } catch (error) {
    throw error || { message: "Failed to fetch tax" };
  }
};

export const createTax = async (payload) => {
  try {
    return await axiosInstance.post("/taxes", payload);
  } catch (error) {
    throw error || { message: "Failed to create tax" };
  }
};

export const updateTax = async (id, payload) => {
  try {
    return await axiosInstance.patch(`/taxes/${id}`, payload);
  } catch (error) {
    throw error || { message: "Failed to update tax" };
  }
};