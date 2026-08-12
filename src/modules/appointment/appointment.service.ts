export {};

const Appointment = require('./appointment.model');
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
  return Appointment.findOneAndUpdate(
    { _id: id, tenantId },
    { ...updates, updatedAt: new Date() },
    { new: true }
  ).lean();
}


module.exports = { createAppointment, listAppointments, getAppointmentById, updateAppointment };
