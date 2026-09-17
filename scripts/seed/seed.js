'use strict';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
if (process.env.NODE_ENV === 'production') {
  throw new Error('Development seed refused: NODE_ENV=production');
}

require('dotenv').config();
const mongoose = require('mongoose');
const { MONGO_URI } = require('../../config');
const Tenant = require('../../src/modules/tenant/tenant.model');
const User = require('../../src/modules/auth/auth.model');
const Doctor = require('../../src/modules/doctor/doctor.model');
const Staff = require('../../src/modules/staff/staff.model');
const Patient = require('../../src/modules/patient/patient.model');
const Appointment = require('../../src/modules/appointment/appointment.model');
const Admission = require('../../src/modules/admission/admission.model');
const Bed = require('../../src/modules/bed/bed.model');
const Emergency = require('../../src/modules/emergency/emergency.model');
const Discharge = require('../../src/modules/discharge/discharge.model');
const Invoice = require('../../src/modules/invoice/invoice.model');
const Payment = require('../../src/modules/invoice/payment.model');
const Tax = require('../../src/modules/tax/tax.model');
const Department = require('../../src/modules/department/department.model');
const { TENANT_FIXTURES, upsertTenants } = require('./tenants');
const { DEFAULT_PASSWORD, createUsers, createProfiles } = require('./users');
const { createBusinessData } = require('./business');
const { createDepartments } = require('./departments');

const SEED_EMAILS = [
  'admin@hms-demo.example.test',
  ...TENANT_FIXTURES.flatMap((tenant) => {
    const slug = tenant.metadata.seedKey.replace('hms-demo-', '');
    return [
      `tenant.${slug}@example.test`,
      `doctor.${slug}.1@example.test`, `doctor.${slug}.2@example.test`,
      `staff.${slug}.1@example.test`, `staff.${slug}.2@example.test`,
      `patient.${slug}@example.test`
    ];
  })
];

async function clearSeedData(tenants) {
  const tenantIds = tenants.map((tenant) => tenant._id);
  const tenantFilter = { tenantId: { $in: tenantIds } };
  await Promise.all([
    Payment.deleteMany(tenantFilter),
    Invoice.deleteMany(tenantFilter),
    Discharge.deleteMany(tenantFilter),
    Emergency.deleteMany(tenantFilter),
    Admission.deleteMany(tenantFilter),
    Appointment.deleteMany(tenantFilter),
    Bed.deleteMany(tenantFilter),
    Tax.deleteMany(tenantFilter),
    Department.deleteMany(tenantFilter),
    Doctor.deleteMany(tenantFilter),
    Staff.deleteMany(tenantFilter),
    Patient.deleteMany(tenantFilter),
    User.deleteMany({ $or: [{ tenantId: { $in: tenantIds } }, { email: { $in: SEED_EMAILS } }] })
  ]);
}

function printCredentials(credentials) {
  const groups = new Map();
  for (const credential of credentials) {
    if (!groups.has(credential.tenantName)) groups.set(credential.tenantName, []);
    groups.get(credential.tenantName).push(credential);
  }
  console.log('\nSeed completed successfully\n');
  console.log(`Development password: ${DEFAULT_PASSWORD}`);
  for (const [tenantName, tenantCredentials] of groups) {
    console.log(`\nTenant: ${tenantName}`);
    console.log('--------------------------------');
    for (const credential of tenantCredentials) {
      console.log(`${credential.role.toUpperCase()}\nUsername: ${credential.email}\nPassword: ${credential.password}\n`);
    }
  }
}

async function seed() {
  await mongoose.connect(MONGO_URI);
  const tenants = await upsertTenants();
  await clearSeedData(tenants);
  const { credentials, usersByTenant } = await createUsers(tenants);
  const departmentsByTenant = await createDepartments(tenants);
  const profiles = await createProfiles(tenants, usersByTenant, departmentsByTenant);
  const summary = await createBusinessData(tenants, profiles, usersByTenant);

  console.log(`Tenants: ${tenants.length}`);
  console.log(`Records: ${JSON.stringify(summary)}`);
  console.log(`Tenant IDs: ${tenants.map((tenant) => `${tenant.name}=${tenant._id}`).join(', ')}`);
  printCredentials(credentials);
}

seed()
  .catch((error) => {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
