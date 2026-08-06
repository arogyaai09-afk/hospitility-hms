export {};

const Emergency = require('./emergency.model');
const { admitIPD } = require('../admission/admission.service');

async function createEmergency(data) {
  return Emergency.create(data);
}

async function listEmergencies(tenantId) {
  return Emergency.find({ tenantId }).sort({ createdAt: -1 });
}

async function admitEmergency(id, tenantId, bedNumber, doctorId) {
  const emergency = await Emergency.findOne({ _id: id, tenantId });
  if (!emergency) {
    const err = new Error('Emergency case not found');
    err.status = 404;
    throw err;
  }
  emergency.status = 'admitted';
  await emergency.save();
  return admitIPD({
    patientName: emergency.patientName,
    admissionType: 'Emergency',
    bedNumber,
    doctorId,
    tenantId: emergency.tenantId,
    status: 'admitted'
  });
}

module.exports = { createEmergency, listEmergencies, admitEmergency };
