export {};

const { createStaff, listStaff } = require('./staff.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const staff = await createStaff(payload);
  ctx.status = 201;
  ctx.body = success(staff, 'Staff member created');
}

async function index(ctx) {
  const staff = await listStaff(ctx.state.user.tenantId);
  ctx.body = success(staff);
}

module.exports = { create, index };
