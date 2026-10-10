import axiosInstance from "./axiosInstance";

export const createLabReport = async (labOrderId, reportData) => {
  return axiosInstance.post(
    `/lab-orders/${labOrderId}/report`,
    reportData
  );
};

export const getVisitReports = async (visitId) => {
  return axiosInstance.get(`/visits/${visitId}/reports`);
};
