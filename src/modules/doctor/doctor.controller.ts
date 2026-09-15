export {};

const { createDoctor, listDoctors, getDoctorById, updateDoctor, deleteDoctor } = require('./doctor.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

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
  const { page, limit } = getPaginationParams(ctx);
  const result = await listDoctors(tenantId, page, limit);
  ctx.body = success(result.data, 'Doctors retrieved', result.pagination);
}

async function show(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.query.tenantId : ctx.state.user.tenantId;
  const doctor = await getDoctorById(ctx.params.id, tenantId || ctx.state.user.tenantId);
  ctx.body = success(doctor, 'Doctor retrieved');
}

async function update(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.request.body.tenantId : ctx.state.user.tenantId;
  const doctor = await updateDoctor(ctx.params.id, tenantId || ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(doctor, 'Doctor updated');
}

async function remove(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.query.tenantId : ctx.state.user.tenantId;
  const doctor = await deleteDoctor(ctx.params.id, tenantId || ctx.state.user.tenantId);
  ctx.body = success(doctor, 'Doctor deleted');
}

module.exports = { create, index, show, update, remove };
