export {};

const Patient = require('./patient.model');

async function createPatient(data) {
  const patient = await Patient.create(data);
  return patient;
}

async function listPatients(tenantId) {
  return Patient.find({ tenantId }).sort({ createdAt: -1 });
}

async function getPatientById(id, tenantId) {
  return Patient.findOne({ _id: id, tenantId });
}

module.exports = { createPatient, listPatients, getPatientById };
