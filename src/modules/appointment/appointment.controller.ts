export {};

const { createAppointment, listAppointments } = require('./appointment.service');
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

module.exports = { create, index };
