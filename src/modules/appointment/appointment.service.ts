export {};

const Appointment = require('./appointment.model');
const Visit = require('../visit/visit.model');
const { calculateSkip } = require('../../utils/pagination');

async function createAppointment(data) {
  return Appointment.create(data);
}

async function listAppointments(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [appointments, total] = await Promise.all([
    Appointment.find({ tenantId })
      .select('-__v')
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments({ tenantId })
  ]);
  
  return {
    data: appointments,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getAppointmentById(id, tenantId) {
  return Appointment.findOne({ _id: id, tenantId })
    .select('-__v')
    .populate('patientId')
    .populate('doctorId')
    .lean();
}

async function updateAppointment(id, tenantId, updates) {
  updates = updates || {};
  const allowedFields = ['patientId', 'patientName', 'patientType', 'appointmentType', 'visitReason', 'doctorId', 'scheduledAt'];
  const update = {};

  for (const field of allowedFields) {
    if (updates[field] !== undefined) {
      update[field] = updates[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return getAppointmentById(id, tenantId);
  }

  return Appointment.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: { ...update, updatedAt: new Date() } },
    { new: true, runValidators: true }
  )
    .populate('patientId')
    .populate('doctorId')
    .lean();
}

async function deleteAppointment(id, tenantId) {
  return Appointment.findOneAndDelete({ _id: id, tenantId }).lean();
}

async function checkInAppointment(id, tenantId, userId) {
  const appointment = await Appointment.findOne({ _id: id, tenantId }).lean();
  if (!appointment) {
    const error = new Error('Appointment not found');
    error.status = 404;
    throw error;
  }
  if (!appointment.patientId) {
    const error = new Error('Appointment must have a patientId before check-in');
    error.status = 400;
    throw error;
  }
  if (appointment.visitId) {
    return Visit.findOne({ _id: appointment.visitId, tenantId }).lean();
  }

  const visit = await Visit.create({
    patientId: appointment.patientId,
    tenantId,
    visitType: appointment.appointmentType === 'Emergency' ? 'emergency' : appointment.appointmentType,
    status: 'checked_in',
    appointmentId: appointment._id,
    doctorId: appointment.doctorId,
    visitReason: appointment.visitReason,
    checkedInAt: new Date(),
    createdBy: userId
  });
  await Appointment.updateOne({ _id: id, tenantId }, { $set: { status: 'checked_in', visitId: visit._id } });
  return visit.toObject();
}


module.exports = { createAppointment, listAppointments, getAppointmentById, updateAppointment, deleteAppointment, checkInAppointment };
