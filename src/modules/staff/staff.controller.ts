export {};

const { createStaff, listStaff, getStaffById, updateStaff, deleteStaff } = require('./staff.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const staff = await createStaff(payload);
  ctx.status = 201;
  ctx.body = success(staff, 'Staff member created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listStaff(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Staff retrieved', result.pagination);
}

async function show(ctx) {
  const staff = await getStaffById(ctx.params.id, ctx.state.user.tenantId);
  ctx.body = success(staff, 'Staff member retrieved');
}

async function update(ctx) {
  const staff = await updateStaff(ctx.params.id, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(staff, 'Staff member updated');
}

async function remove(ctx) {
  const staff = await deleteStaff(ctx.params.id, ctx.state.user.tenantId);
  ctx.body = success(staff, 'Staff member deleted');
}

module.exports = { create, index, show, update, remove };
