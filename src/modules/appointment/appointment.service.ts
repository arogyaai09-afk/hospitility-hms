export {};

const Appointment = require('./appointment.model');
const Visit = require('../visit/visit.model');
const mongoose = require('mongoose');
const { calculateSkip } = require('../../utils/pagination');

async function createAppointment(data) {
  return Appointment.create(data);
}

async function listAppointments(tenantId, page = 1, limit = 20, filters: any = {}) {
  const skip = calculateSkip(page, limit);
  const query: any = { tenantId };

  if (filters.doctorId !== undefined) {
    if (typeof filters.doctorId !== 'string' || !mongoose.Types.ObjectId.isValid(filters.doctorId)) {
      const error = new Error('doctorId must be a valid ID');
      error.status = 400;
      throw error;
    }
    query.doctorId = filters.doctorId;
  }

  if (filters.date !== undefined) {
    if (typeof filters.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(filters.date)) {
      const error = new Error('date must use YYYY-MM-DD format');
      error.status = 400;
      throw error;
    }

    const dayStart = new Date(`${filters.date}T00:00:00.000Z`);
    if (Number.isNaN(dayStart.getTime()) || dayStart.toISOString().slice(0, 10) !== filters.date) {
      const error = new Error('date must be a valid calendar date');
      error.status = 400;
      throw error;
    }
    const dayEnd = new Date(dayStart);
    dayEnd.setUTCDate(dayEnd.getUTCDate() + 1);
    query.scheduledAt = { $gte: dayStart, $lt: dayEnd };
  }

  const [appointments, total] = await Promise.all([
    Appointment.find(query)
      .select('-__v')
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialization')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Appointment.countDocuments(query)
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
