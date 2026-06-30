const Appointment = require('./appointment.model');

async function createAppointment(data) {
  return Appointment.create(data);
}

async function listAppointments(tenantId) {
  return Appointment.find({ tenantId }).sort({ createdAt: -1 });
}

async function getAppointmentById(id, tenantId) {
  return Appointment.findOne({ _id: id, tenantId });
}

async function updateAppointment(id, tenantId, updates) {
  return Appointment.findOneAndUpdate({ _id: id, tenantId }, updates, { new: true });
}

module.exports = { createAppointment, listAppointments, getAppointmentById, updateAppointment };
