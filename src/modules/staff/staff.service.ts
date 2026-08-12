export {};

const Staff = require('./staff.model');
const { calculateSkip } = require('../../utils/pagination');

async function createStaff(data) {
  return Staff.create(data);
}

async function listStaff(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [staff, total] = await Promise.all([
    Staff.find({ tenantId })
      .select('name role phone email createdAt')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Staff.countDocuments({ tenantId })
  ]);
  
  return {
    data: staff,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

module.exports = { createStaff, listStaff };
