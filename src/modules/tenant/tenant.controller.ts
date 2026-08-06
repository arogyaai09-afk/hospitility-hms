export {};

const { createTenant, listTenants, getTenantById } = require('./tenant.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const tenant = await createTenant(ctx.request.body);
  ctx.status = 201;
  ctx.body = success(tenant, 'Tenant created');
}

async function index(ctx) {
  const tenants = await listTenants();
  ctx.body = success(tenants);
}

async function show(ctx) {
  const tenant = await getTenantById(ctx.params.id);
  if (ctx.state.user.role === 'tenant' && String(ctx.state.user.tenantId) !== String(tenant._id)) {
    ctx.throw(403, 'Tenant users can only access their own tenant record');
  }
  ctx.body = success(tenant);
}

module.exports = { create, index, show };
