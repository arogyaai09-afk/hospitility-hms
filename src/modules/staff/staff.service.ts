export {};

const Staff = require('./staff.model');
const { calculateSkip } = require('../../utils/pagination');

async function createStaff(data) {
  return Staff.create(data);
}

async function listStaff(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [staff, total] = await Promise.all([
    Staff.find({ tenantId, isDeleted: { $ne: true } })
      .select('name role profileImage phone email createdAt')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Staff.countDocuments({ tenantId, isDeleted: { $ne: true } })
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

async function getStaffById(id, tenantId) {
  const staff = await Staff.findOne({ _id: id, tenantId, isDeleted: { $ne: true } }).lean();
  if (!staff) {
    const err = new Error('Staff member not found');
    err.status = 404;
    throw err;
  }
  return staff;
}

async function updateStaff(id, tenantId, data) {
  const staff = await Staff.findOne({ _id: id, tenantId, isDeleted: { $ne: true } });
  if (!staff) {
    const err = new Error('Staff member not found');
    err.status = 404;
    throw err;
  }

  const allowedFields = ['name', 'role', 'profileImage', 'phone', 'email'];
  const update: any = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return getStaffById(id, tenantId);
  }

  const updated = await Staff.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: { $ne: true } },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const err = new Error('Staff member not found');
    err.status = 404;
    throw err;
  }

  return updated.toObject();
}

async function deleteStaff(id, tenantId) {
  const staff = await Staff.findOneAndUpdate(
    { _id: id, tenantId, isDeleted: { $ne: true } },
    { $set: { isDeleted: true, deletedAt: new Date() } },
    { new: true }
  );
  if (!staff) {
    const err = new Error('Staff member not found');
    err.status = 404;
    throw err;
  }
  return staff.toObject();
}

module.exports = { createStaff, listStaff, getStaffById, updateStaff, deleteStaff };
