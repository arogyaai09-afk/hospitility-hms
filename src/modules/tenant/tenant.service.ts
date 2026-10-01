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

async function updateTenant(id, data) {
  const update: any = {};
  for (const field of ['name', 'state', 'country']) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  const profileFields = ['legalName', 'displayName', 'logoUrl', 'email', 'phone', 'website', 'registrationNumber', 'taxNumber'];
  const addressFields = ['line1', 'line2', 'city', 'state', 'postalCode', 'country'];
  const brandingFields = ['headerColor', 'footerColor', 'fontFamily', 'buttonColor', 'buttonTextColor'];
  const settings = data.settings;

  if (settings && typeof settings === 'object' && !Array.isArray(settings)) {
    if (settings.profile && typeof settings.profile === 'object' && !Array.isArray(settings.profile)) {
      for (const field of profileFields) {
        if (settings.profile[field] !== undefined) {
          update[`settings.profile.${field}`] = settings.profile[field];
        }
      }
      if (settings.profile.address && typeof settings.profile.address === 'object' && !Array.isArray(settings.profile.address)) {
        for (const field of addressFields) {
          if (settings.profile.address[field] !== undefined) {
            update[`settings.profile.address.${field}`] = settings.profile.address[field];
          }
        }
      }
    }
    if (settings.branding && typeof settings.branding === 'object' && !Array.isArray(settings.branding)) {
      for (const field of brandingFields) {
        if (settings.branding[field] !== undefined) {
          update[`settings.branding.${field}`] = settings.branding[field];
        }
      }
    }
  }

  if (Object.keys(update).length === 0) {
    return getTenantById(id);
  }

  const tenant = await Tenant.findByIdAndUpdate(id, { $set: update }, { new: true, runValidators: true });
  if (!tenant) {
    const err = new Error('Tenant not found');
    err.status = 404;
    throw err;
  }
  return tenant;
}

module.exports = { createTenant, listTenants, getTenantById, updateTenant };
