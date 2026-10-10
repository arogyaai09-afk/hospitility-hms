import axiosInstance from "./axiosInstance";

export const createLabOrder = async (visitId, labOrderData) => {
  return axiosInstance.post(`/visits/${visitId}/lab-orders`, labOrderData);
};

export const getPatientLabOrders = async (patientId) => {
  return axiosInstance.get(`/patients/${patientId}/lab-orders`);
};
