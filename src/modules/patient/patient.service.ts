export {};

const Patient = require('./patient.model');
const { calculateSkip } = require('../../utils/pagination');

async function createPatient(data) {
  const patient = await Patient.create(data);
  return patient.toObject();
}

async function listPatients(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [patients, total] = await Promise.all([
    Patient.find({ tenantId })
      .select('-medicalHistory') // Exclude large text fields
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Patient.countDocuments({ tenantId })
  ]);
  
  return {
    data: patients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getPatientById(id, tenantId) {
  return Patient.findOne({ _id: id, tenantId })
    .select('-medicalHistory')
    .lean();
}

module.exports = { createPatient, listPatients, getPatientById };
