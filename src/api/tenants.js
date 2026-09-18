import api from "./axiosInstance";

export const createTenant = async (tenantData) => {
  const response = await api.post("/tenants", tenantData);
  return response.data;
};

export const getTenants = async () => {
  const response = await api.get("/tenants");
  return response.data;
};

export const createTenantUser = async (userData) => {
  const response = await api.post("/auth/register", userData);
  return response.data;
};