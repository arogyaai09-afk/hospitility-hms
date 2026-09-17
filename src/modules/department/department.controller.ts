export {};

const { listDepartments } = require('./department.service');
const { success } = require('../../utils/response');

async function index(ctx) {
  const departments = await listDepartments(ctx.state.user.tenantId);
  ctx.body = success(departments, 'Departments retrieved');
}

module.exports = { index };