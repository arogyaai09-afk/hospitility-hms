export {};

const Patient = require('./patient.model');
const User = require('../auth/auth.model');
const { calculateSkip } = require('../../utils/pagination');

async function validatePatientUser(userId, tenantId) {
  if (!userId) {
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    const err = new Error('Patient user not found');
    err.status = 404;
    throw err;
  }

  if (user.role !== 'patient') {
    const err = new Error('userId must belong to a patient user');
    err.status = 400;
    throw err;
  }

  if (String(user.tenantId) !== String(tenantId)) {
    const err = new Error('Patient user must belong to the same tenant');
    err.status = 400;
    throw err;
  }
}

async function createPatient(data) {
  await validatePatientUser(data.userId, data.tenantId);
  const patient = await Patient.create(data);
  return patient.toObject();
}

async function listPatients(tenantId, page = 1, limit = 20) {
  const skip = calculateSkip(page, limit);
  const [patients, total] = await Promise.all([
    Patient.find({ tenantId })
      .select('-medicalHistory')
      .lean()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    Patient.countDocuments({ tenantId })
  ]);

  return {
    data: patients,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getPatientById(id, tenantId) {
  return Patient.findOne({ _id: id, tenantId })
    .select('-medicalHistory')
    .lean();
}

async function updatePatient(id, tenantId, data) {
  const patient = await Patient.findOne({ _id: id, tenantId });
  if (!patient) {
    const err = new Error('Patient not found');
    err.status = 404;
    throw err;
  }

  const allowedFields = ['userId', 'patientCode', 'name', 'dateOfBirth', 'gender', 'phone', 'email', 'address', 'emergencyContact', 'medicalHistory'];
  const update: any = {};

  for (const field of allowedFields) {
    if (data[field] !== undefined) {
      update[field] = data[field];
    }
  }

  if (Object.keys(update).length === 0) {
    return getPatientById(id, tenantId);
  }

  if (update.userId !== undefined) {
    await validatePatientUser(update.userId, tenantId);
  }

  const updated = await Patient.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: update },
    { new: true, runValidators: true }
  );

  if (!updated) {
    const err = new Error('Patient not found');
    err.status = 404;
    throw err;
  }

  return updated.toObject();
}

async function deletePatient(id, tenantId) {
  const patient = await Patient.findOneAndDelete({ _id: id, tenantId });
  if (!patient) {
    const err = new Error('Patient not found');
    err.status = 404;
    throw err;
  }
  return patient.toObject();
}

module.exports = { createPatient, listPatients, getPatientById, updatePatient, deletePatient };
