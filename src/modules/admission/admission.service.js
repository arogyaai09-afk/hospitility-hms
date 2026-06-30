const Admission = require('./admission.model');
const { getAppointmentById, updateAppointment } = require('../appointment/appointment.service');
const { assignBedByNumber, releaseBedByNumber } = require('../bed/bed.service');

async function admitFromOPD(appointmentId, tenantId, bedNumber, doctorId) {
  const appointment = await getAppointmentById(appointmentId, tenantId);
  if (!appointment) {
    const err = new Error('Appointment not found or invalid tenant');
    err.status = 404;
    throw err;
  }
  await updateAppointment(appointmentId, tenantId, { status: 'completed' });

  const admission = await Admission.create({
    patientName: appointment.patientName,
    admissionType: 'OPD',
    appointmentId,
    bedNumber,
    doctorId,
    tenantId,
    status: 'admitted'
  });

  await assignBedByNumber(bedNumber, admission._id, tenantId);
  return admission;
}

async function admitIPD(payload) {
  const admission = await Admission.create(payload);
  if (payload.bedNumber) {
    await assignBedByNumber(payload.bedNumber, admission._id, payload.tenantId);
  }
  return admission;
}

async function listAdmissions(tenantId) {
  return Admission.find({ tenantId }).sort({ admittedAt: -1 });
}

async function dischargeAdmission(id, tenantId) {
  const admission = await Admission.findOneAndUpdate(
    { _id: id, tenantId },
    { status: 'discharged', dischargedAt: new Date() },
    { new: true }
  );
  if (admission && admission.bedNumber) {
    await releaseBedByNumber(admission.bedNumber, tenantId);
  }
  return admission;
}

module.exports = { admitFromOPD, admitIPD, listAdmissions, dischargeAdmission };
