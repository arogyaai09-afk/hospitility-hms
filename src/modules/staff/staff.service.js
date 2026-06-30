const Staff = require('./staff.model');

async function createStaff(data) {
  return Staff.create(data);
}

async function listStaff(tenantId) {
  return Staff.find({ tenantId }).sort({ createdAt: -1 });
}

module.exports = { createStaff, listStaff };
