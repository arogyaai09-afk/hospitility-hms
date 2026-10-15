export {};

const { createTenant, listTenants, getTenantById, updateTenant, setTenantStatus, deleteTenant } = require('./tenant.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const tenant = await createTenant(ctx.request.body);
  ctx.status = 201;
  ctx.body = success(tenant, 'Tenant created');
}

async function index(ctx) {
  const tenants = await listTenants(ctx.query.includeDeleted === 'true');
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

async function changeStatus(ctx) {
  const status = ctx.request.body && ctx.request.body.status;
  if (!['active', 'inactive'].includes(status)) {
    ctx.throw(400, 'status must be active or inactive');
  }
  const tenant = await setTenantStatus(ctx.params.id, status);
  ctx.body = success(tenant, 'Tenant status updated');
}

async function remove(ctx) {
  const tenant = await deleteTenant(ctx.params.id);
  ctx.body = success(tenant, 'Tenant deactivated and archived');
}

module.exports = { create, index, show, update, changeStatus, remove };
