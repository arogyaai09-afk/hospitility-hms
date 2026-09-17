'use strict';

const Department = require('../../src/modules/department/department.model');

const DEPARTMENT_FIXTURES = [
  { name: 'Cardiology', code: 'CARD' },
  { name: 'Pediatrics', code: 'PED' },
  { name: 'General Medicine', code: 'GENMED' },
  { name: 'Emergency', code: 'ER' },
  { name: 'Orthopedics', code: 'ORTHO' },
  { name: 'Anesthesiology', code: 'ANES' },
  { name: 'Dermatology', code: 'DERM' },
  { name: 'Ear, Nose and Throat', code: 'ENT' },
  { name: 'Gastroenterology', code: 'GASTRO' },
  { name: 'General Surgery', code: 'GSURG' },
  { name: 'Gynecology and Obstetrics', code: 'OBGYN' },
  { name: 'Nephrology', code: 'NEPH' },
  { name: 'Neurology', code: 'NEURO' },
  { name: 'Neurosurgery', code: 'NSURG' },
  { name: 'Oncology', code: 'ONCO' },
  { name: 'Ophthalmology', code: 'OPHTH' },
  { name: 'Pathology', code: 'PATH' },
  { name: 'Psychiatry', code: 'PSYCH' },
  { name: 'Pulmonology', code: 'PULM' },
  { name: 'Radiology', code: 'RAD' },
  { name: 'Urology', code: 'URO' },
  { name: 'Dentistry', code: 'DENT' },
  { name: 'Physiotherapy and Rehabilitation', code: 'PHYSIO' },
  { name: 'Nutrition and Dietetics', code: 'DIET' },
  { name: 'Critical Care', code: 'ICU' }
];

async function createDepartments(tenants) {
  const departmentsByTenant = new Map();

  for (const tenant of tenants) {
    const departments = [];
    for (const fixture of DEPARTMENT_FIXTURES) {
      departments.push(await Department.findOneAndUpdate(
        { tenantId: tenant._id, code: fixture.code },
        { $set: { ...fixture, tenantId: tenant._id, isActive: true, updatedAt: new Date() } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ));
    }
    departmentsByTenant.set(String(tenant._id), departments);
  }

  return departmentsByTenant;
}

module.exports = { createDepartments };