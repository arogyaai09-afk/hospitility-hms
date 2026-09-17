export {};

const Department = require('./department.model');

async function listDepartments(tenantId, includeInactive = false) {
  const query: any = { tenantId };
  if (!includeInactive) query.isActive = true;
  return Department.find(query).select('name code isActive').sort({ name: 1 }).lean();
}

async function getDepartmentForTenant(id, tenantId) {
  const department = await Department.findOne({ _id: id, tenantId, isActive: true }).select('_id name code');
  if (!department) {
    const err = new Error('Department not found for this tenant');
    err.status = 400;
    throw err;
  }
  return department;
}

module.exports = { listDepartments, getDepartmentForTenant };