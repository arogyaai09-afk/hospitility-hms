export {};

const Admission = require('./admission.model');
const { getAppointmentById, updateAppointment } = require('../appointment/appointment.service');
const { assignBedByNumber, releaseBedByNumber } = require('../bed/bed.service');
const { calculateSkip } = require('../../utils/pagination');

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
  return admission.toObject();
}

async function admitIPD(payload) {
  const admission = await Admission.create(payload);
  if (payload.bedNumber) {
    await assignBedByNumber(payload.bedNumber, admission._id, payload.tenantId);
  }
  return admission.toObject();
}

async function listAdmissions(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [admissions, total] = await Promise.all([
    Admission.find({ tenantId })
      .select('-__v')
      .populate('doctorId', 'name specialization')
      .lean()
      .sort({ admittedAt: -1 })
      .skip(skip)
      .limit(limit),
    Admission.countDocuments({ tenantId })
  ]);
  
  return {
    data: admissions,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function dischargeAdmission(id, tenantId) {
  const admission = await Admission.findOneAndUpdate(
    { _id: id, tenantId },
    { status: 'discharged', dischargedAt: new Date(), updatedAt: new Date() },
    { new: true }
  ).lean();
  if (admission && admission.bedNumber) {
    await releaseBedByNumber(admission.bedNumber, tenantId);
  }
  return admission;
}

module.exports = { admitFromOPD, admitIPD, listAdmissions, dischargeAdmission };
