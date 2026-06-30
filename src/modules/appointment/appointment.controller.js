const { createAppointment, listAppointments } = require('./appointment.service');
const { success } = require('../../utils/response');

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
  const appointments = await listAppointments(ctx.state.user.tenantId);
  ctx.body = success(appointments);
}

module.exports = { create, index };
