export {};

const { createTenant, listTenants, getTenantById, updateTenant } = require('./tenant.service');
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

async function update(ctx) {
  if (ctx.state.user.role === 'tenant' && String(ctx.state.user.tenantId) !== String(ctx.params.id)) {
    ctx.throw(403, 'Tenant users can only update their own tenant record');
  }
  const tenant = await updateTenant(ctx.params.id, ctx.request.body);
  ctx.body = success(tenant, 'Tenant settings updated');
}

module.exports = { create, index, show, update };
