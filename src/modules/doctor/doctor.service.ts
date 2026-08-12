export {};

const Doctor = require('./doctor.model');
const User = require('../auth/auth.model');
const { calculateSkip } = require('../../utils/pagination');

async function createDoctor(data) {
  if (data.userId) {
    const user = await User.findById(data.userId);
    if (!user) {
      const err = new Error('Doctor user not found');
      err.status = 404;
      throw err;
    }
    if (user.role !== 'doctor') {
      const err = new Error('userId must belong to a doctor user');
      err.status = 400;
      throw err;
    }
    if (String(user.tenantId) !== String(data.tenantId)) {
      const err = new Error('Doctor user must belong to the same tenant');
      err.status = 400;
      throw err;
    }
  }

  return Doctor.create(data);
}

async function listDoctors(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [doctors, total] = await Promise.all([
    Doctor.find({ tenantId })
      .select('name specialization phone email userId createdAt')
      .populate('userId', 'email')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Doctor.countDocuments({ tenantId })
  ]);
  
  return {
    data: doctors,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

module.exports = { createDoctor, listDoctors };
