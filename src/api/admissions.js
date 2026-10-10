import axiosInstance from './axiosInstance';

// Get all admissions
export const getAdmissions = async () => {
  try {
    const response = await axiosInstance.get('/admissions');
    return response;
  } catch (error) {
    throw error || { message: "Failed to fetch admissions" };
  }
};

// // Get admission by ID
// export const getAdmissionById = async (id) => {
//   try {
//     const response = await axiosInstance.get(`/admissions/${id}`);
//     return response;
//   } catch (error) {
//     throw error.response?.data || { message: "Failed to fetch admission" };
//   }
// };

// Create admission from OPD appointment
export const createAdmissionFromOPD = async (appointmentId, bedNumber, doctorId) => {
  try {
    const response = await axiosInstance.post('/admissions/from-opd', {
      appointmentId,
      bedNumber,
      doctorId,
    });
    return response;
  } catch (error) {
    throw error || { message: "Failed to create admission from OPD" };
  }
};

// Create IPD admission
export const createIPDAdmission = async (admissionData) => {
  try {
    const response = await axiosInstance.post('/admissions/ipd', admissionData);
    return response;
  } catch (error) {
    throw error || { message: "Failed to create IPD admission" };
  }
};

// Update existing admission
export const updateAdmission = async (admissionId, admissionData) => {
  try {
    const response = await axiosInstance.patch(
      `/admissions/${admissionId}`,
      admissionData
    );
    return response;
  } catch (error) {
    throw error || { message: "Failed to update admission" };
  }
};

// Discharge admission
export const dischargeAdmission = async (admissionId) => {
  try {
    const response = await axiosInstance.patch(`/admissions/${admissionId}/discharge`);
    return response;
  } catch (error) {
    throw error || { message: "Failed to discharge admission" };
  }
};
