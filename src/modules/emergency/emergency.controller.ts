export {};

const { createEmergency, listEmergencies, admitEmergency } = require('./emergency.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const emergency = await createEmergency(payload);
  ctx.status = 201;
  ctx.body = success(emergency, 'Emergency case created');
}

async function index(ctx) {
  const emergencies = await listEmergencies(ctx.state.user.tenantId);
  ctx.body = success(emergencies);
}

async function admit(ctx) {
  const emergency = await admitEmergency(ctx.params.id, ctx.state.user.tenantId, ctx.request.body.bedNumber, ctx.request.body.doctorId);
  ctx.body = success(emergency, 'Emergency admitted to IPD');
}

module.exports = { create, index, admit };
