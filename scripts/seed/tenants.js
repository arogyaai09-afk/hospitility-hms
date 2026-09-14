'use strict';

const Tenant = require('../../src/modules/tenant/tenant.model');

const TENANT_FIXTURES = [
  {
    name: 'HMS Demo Hospital North',
    state: 'Delhi',
    country: 'India',
    metadata: { seedKey: 'hms-demo-north', city: 'New Delhi', tier: 'premium', isDefault: true }
  },
  {
    name: 'HMS Demo Hospital West',
    state: 'Maharashtra',
    country: 'India',
    metadata: { seedKey: 'hms-demo-west', city: 'Pune', tier: 'standard', isDefault: false }
  },
  {
    name: 'HMS Demo Clinic South',
    state: 'Karnataka',
    country: 'India',
    metadata: { seedKey: 'hms-demo-south', city: 'Bengaluru', tier: 'standard', isDefault: false }
  }
];

async function upsertTenants() {
  const tenants = [];
  for (const fixture of TENANT_FIXTURES) {
    const tenant = await Tenant.findOneAndUpdate(
      { name: fixture.name },
      { $set: fixture },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    tenants.push(tenant);
  }
  return tenants;
}

module.exports = { TENANT_FIXTURES, upsertTenants };
