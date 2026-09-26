export {};

const { createAppointment, listAppointments, getAppointmentById, updateAppointment, deleteAppointment, checkInAppointment } = require('./appointment.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = {
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId,
    createdBy: ctx.state.user.id
  };
  const appointment = await createAppointment(payload);
  ctx.status = 201;
  ctx.body = success(appointment, 'Appointment created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listAppointments(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Appointments retrieved', result.pagination);
}

async function show(ctx) {
  const appointment = await getAppointmentById(ctx.params.id, ctx.state.user.tenantId);
  if (!appointment) {
    ctx.throw(404, 'Appointment not found');
  }
  ctx.body = success(appointment, 'Appointment retrieved');
}

async function update(ctx) {
  const appointment = await updateAppointment(ctx.params.id, ctx.state.user.tenantId, ctx.request.body);
  if (!appointment) {
    ctx.throw(404, 'Appointment not found');
  }
  ctx.body = success(appointment, 'Appointment updated');
}

async function remove(ctx) {
  const appointment = await deleteAppointment(ctx.params.id, ctx.state.user.tenantId);
  if (!appointment) {
    ctx.throw(404, 'Appointment not found');
  }
  ctx.body = success(appointment, 'Appointment deleted');
}

async function checkIn(ctx) {
  const visit = await checkInAppointment(ctx.params.id, ctx.state.user.tenantId, ctx.state.user.id);
  ctx.body = success(visit, 'Appointment checked in');
}

module.exports = { create, index, show, update, remove, checkIn };
