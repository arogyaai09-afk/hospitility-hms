import axiosInstance from "./axiosInstance";

// Get prescriptions for a visit
export const getPrescriptionsByVisit = async (visitId) => {
  return axiosInstance.get(`/visits/${visitId}/prescriptions`);
};

// Create prescription for a visit
export const createPrescription = async (visitId, prescriptionData) => {
  return axiosInstance.post(
    `/visits/${visitId}/prescriptions`,
    prescriptionData
  );
};

// Update prescription
export const updatePrescription = async (prescriptionId, prescriptionData) => {
  return axiosInstance.patch(
    `/prescriptions/${prescriptionId}`,
    prescriptionData
  );
};