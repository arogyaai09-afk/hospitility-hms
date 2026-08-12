export {};

const { createStaff, listStaff } = require('./staff.service');
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

module.exports = { create, index };
