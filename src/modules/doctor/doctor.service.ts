export {};

const Doctor = require('./doctor.model');
const User = require('../auth/auth.model');
const { calculateSkip } = require('../../utils/pagination');

async function validateDoctorUser(userId, tenantId) {
  if (!userId) {
    return;
  }

  const user = await User.findById(userId);
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

  if (String(user.tenantId) !== String(tenantId)) {
    const err = new Error('Doctor user must belong to the same tenant');
    err.status = 400;
    throw err;
  }
}

async function createDoctor(data) {
  await validateDoctorUser(data.userId, data.tenantId);
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

async function getDoctorById(id, tenantId) {
  const doctor = await Doctor.findOne({ _id: id, tenantId })
    .populate('userId', 'email')
    .lean();

  if (!doctor) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }

  return doctor;
}

async function updateDoctor(id, tenantId, data) {
  const doctor = await Doctor.findOne({ _id: id, tenantId });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }

  const allowedFields = ['name', 'specialization', 'phone', 'email', 'userId'];
  const update: any = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return getDoctorById(id, tenantId);
  }

  if (update.userId !== undefined) {
    await validateDoctorUser(update.userId, tenantId);
  }

  const updated = await Doctor.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: update },
    { new: true, runValidators: true }
  ).populate('userId', 'email');

  if (!updated) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }

  return updated.toObject();
}

async function deleteDoctor(id, tenantId) {
  const doctor = await Doctor.findOneAndDelete({ _id: id, tenantId });
  if (!doctor) {
    const err = new Error('Doctor not found');
    err.status = 404;
    throw err;
  }

  return doctor.toObject();
}

module.exports = { createDoctor, listDoctors, getDoctorById, updateDoctor, deleteDoctor };
