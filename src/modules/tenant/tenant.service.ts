export {};

const Tenant = require('./tenant.model');

async function createTenant(data) {
  const existing = await Tenant.findOne({ name: data.name });
  if (existing) {
    const err = new Error('Tenant name already exists');
    err.status = 409;
    throw err;
  }
  return Tenant.create(data);
}

async function listTenants() {
  return Tenant.find().sort({ createdAt: -1 });
}

async function getTenantById(id) {
  const tenant = await Tenant.findById(id);
  if (!tenant) {
    const err = new Error('Tenant not found');
    err.status = 404;
    throw err;
  }
  return tenant;
}

module.exports = { createTenant, listTenants, getTenantById };
