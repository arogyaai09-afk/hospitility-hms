export {};

const { createDoctor, listDoctors } = require('./doctor.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.request.body.tenantId : ctx.state.user.tenantId;
  if (!tenantId) {
    ctx.throw(400, 'tenantId is required');
  }
  const payload = { ...ctx.request.body, tenantId };
  const doctor = await createDoctor(payload);
  ctx.status = 201;
  ctx.body = success(doctor, 'Doctor created');
}

async function index(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.query.tenantId : ctx.state.user.tenantId;
  if (!tenantId) {
    ctx.throw(400, 'tenantId query parameter is required');
  }
  const doctors = await listDoctors(tenantId);
  ctx.body = success(doctors);
}

module.exports = { create, index };
