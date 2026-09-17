'use strict';

const bcrypt = require('bcryptjs');
const User = require('../../src/modules/auth/auth.model');
const Doctor = require('../../src/modules/doctor/doctor.model');
const Staff = require('../../src/modules/staff/staff.model');
const Patient = require('../../src/modules/patient/patient.model');
const { ROLES } = require('./roles');

const DEFAULT_PASSWORD = process.env.SEED_PASSWORD || 'DevHms@123';

function emailFor(slug, role, index) {
  return `${role}.${slug}${index ? `.${index}` : ''}@example.test`;
}

async function createUsers(tenants) {
  const password = await bcrypt.hash(DEFAULT_PASSWORD, 10);
  const credentials = [];
  const usersByTenant = new Map();

  let admin = await User.findOneAndUpdate(
    { email: 'admin@hms-demo.example.test' },
    {
      $set: { name: 'HMS Platform Admin', email: 'admin@hms-demo.example.test', role: ROLES.ADMIN, password, tenantId: null },
      $unset: { refreshToken: 1 }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
  credentials.push({ tenantName: 'Platform', role: ROLES.ADMIN, email: admin.email, password: DEFAULT_PASSWORD });

  for (const [tenantIndex, tenant] of tenants.entries()) {
    const slug = tenant.metadata.seedKey.replace('hms-demo-', '');
    const users = {};
    const definitions = [
      { role: ROLES.TENANT, name: `${tenant.name} Owner`, email: emailFor(slug, 'tenant') },
      { role: ROLES.DOCTOR, name: `Dr. Asha ${tenantIndex + 1}`, email: emailFor(slug, 'doctor', 1) },
      { role: ROLES.DOCTOR, name: `Dr. Vikram ${tenantIndex + 1}`, email: emailFor(slug, 'doctor', 2) },
      { role: ROLES.STAFF, name: `Riya Reception ${tenantIndex + 1}`, email: emailFor(slug, 'staff', 1) },
      { role: ROLES.STAFF, name: `Arun Billing ${tenantIndex + 1}`, email: emailFor(slug, 'staff', 2) },
      { role: ROLES.PATIENT, name: `Patient Portal ${tenantIndex + 1}`, email: emailFor(slug, 'patient') }
    ];

    for (const definition of definitions) {
      const user = await User.findOneAndUpdate(
        { email: definition.email },
        { $set: { ...definition, password, tenantId: tenant._id }, $unset: { refreshToken: 1 } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      users[`${definition.role}${definition.role === ROLES.DOCTOR || definition.role === ROLES.STAFF ? definition.email.endsWith('.2@example.test') ? '2' : '1' : ''}`] = user;
      credentials.push({ tenantName: tenant.name, role: definition.role, email: definition.email, password: DEFAULT_PASSWORD });
    }
    usersByTenant.set(String(tenant._id), users);
  }

  return { credentials, usersByTenant };
}

async function createProfiles(tenants, usersByTenant, departmentsByTenant) {
  const doctorsByTenant = new Map();
  const staffByTenant = new Map();
  const patientsByTenant = new Map();

  for (const [tenantIndex, tenant] of tenants.entries()) {
    const users = usersByTenant.get(String(tenant._id));
    const departments = departmentsByTenant.get(String(tenant._id));
    const slug = tenant.metadata.seedKey.replace('hms-demo-', '');
    const doctors = await Doctor.create([
      { name: `Dr. Asha ${tenantIndex + 1}`, specialization: 'Cardiology', departmentId: departments[0]._id, fees: 1500, status: 'active', availabilityDate: new Date(), phone: `+91980010${tenantIndex}01`, email: emailFor(slug, 'doctor', 1), userId: users.doctor1._id, tenantId: tenant._id },
      { name: `Dr. Vikram ${tenantIndex + 1}`, specialization: 'Pediatrics', departmentId: departments[1]._id, fees: 1200, status: 'active', availabilityDate: new Date(), phone: `+91980010${tenantIndex}02`, email: emailFor(slug, 'doctor', 2), userId: users.doctor2._id, tenantId: tenant._id }
    ]);
    const staff = await Staff.create([
      { name: `Riya Reception ${tenantIndex + 1}`, role: 'receptionist', phone: `+91980020${tenantIndex}01`, email: emailFor(slug, 'staff', 1), tenantId: tenant._id },
      { name: `Arun Billing ${tenantIndex + 1}`, role: 'billing', phone: `+91980020${tenantIndex}02`, email: emailFor(slug, 'staff', 2), tenantId: tenant._id }
    ]);
    const patients = await Patient.create(Array.from({ length: 8 }, (_, index) => ({
      userId: index === 0 ? users.patient._id : undefined,
      patientCode: `DEMO-${slug.toUpperCase()}-${String(index + 1).padStart(3, '0')}`,
      name: [`Neha Sharma`, `Rohan Mehta`, `Fatima Khan`, `Karan Patel`, `Meera Iyer`, `Sanjay Rao`, `Anita Das`, `Joseph Thomas`][index],
      dateOfBirth: new Date(1975 + index * 5, index % 12, 10 + index),
      gender: ['female', 'male', 'female', 'male', 'female', 'male', 'female', 'male'][index],
      phone: `+919700${tenantIndex}${String(index + 1).padStart(4, '0')}`,
      email: `patient.${slug}.${index + 1}@example.test`,
      address: `${100 + index} Demo Street, ${tenant.metadata.city}`,
      emergencyContact: `+919900${tenantIndex}${String(index + 1).padStart(4, '0')}`,
      medicalHistory: index % 3 === 0 ? 'Hypertension follow-up' : index % 3 === 1 ? 'Seasonal allergy' : 'No significant history',
      tenantId: tenant._id,
      createdAt: new Date(Date.now() - index * 86400000)
    })));
    doctorsByTenant.set(String(tenant._id), doctors);
    staffByTenant.set(String(tenant._id), staff);
    patientsByTenant.set(String(tenant._id), patients);
  }

  return { doctorsByTenant, staffByTenant, patientsByTenant };
}

module.exports = { DEFAULT_PASSWORD, createUsers, createProfiles };
