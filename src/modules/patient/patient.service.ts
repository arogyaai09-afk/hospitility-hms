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
  data.patientCode = data.patientCode || `PAT-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  await validatePatientUser(data.userId, data.tenantId);

  const duplicate = await Patient.findOne({
    tenantId: data.tenantId,
    $or: [
      ...(data.phone ? [{ phone: data.phone }] : []),
      ...(data.email ? [{ email: data.email.toLowerCase() }] : []),
      ...(data.idProofType && data.idProofNumber ? [{ idProofType: data.idProofType, idProofNumber: data.idProofNumber }] : [])
    ]
  }).select('_id').lean();
  if (duplicate) {
    const err = new Error('A patient with the same phone, email, or identity document already exists');
    err.status = 409;
    throw err;
  }

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

async function searchPatients(tenantId, query) {
  const value = String(query || '').trim();
  if (!value) {
    return [];
  }

  const tenantFilter = tenantId ? { tenantId } : {};
  const exact = await Patient.findOne({
    ...tenantFilter,
    $or: [
      { patientCode: value },
      { phone: value },
      { email: value.toLowerCase() },
      { idProofNumber: value }
    ]
  }).select('-medicalHistory').lean();

  if (exact) {
    return [exact];
  }

  const escaped = value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matchingUsers = await User.find({
    ...(tenantId ? { tenantId } : {}),
    name: { $regex: escaped, $options: 'i' },
    role: 'patient'
  }).select('_id').lean();
  const matchingUserIds = matchingUsers.map((user) => user._id);

  const patients = await Patient.find({
    ...tenantFilter,
    $or: [
      { name: { $regex: escaped, $options: 'i' } },
      { phone: { $regex: escaped, $options: 'i' } },
      { email: { $regex: escaped, $options: 'i' } },
      ...(matchingUserIds.length ? [{ userId: { $in: matchingUserIds } }] : [])
    ]
  }).select('-medicalHistory').sort({ createdAt: -1 }).limit(20).lean();

  const uniquePatients = new Map();
  for (const patient of patients) {
    const key = patient.patientCode || String(patient._id);
    if (!uniquePatients.has(key)) {
      uniquePatients.set(key, patient);
    }
  }

  return Array.from(uniquePatients.values());
}

async function updatePatient(id, tenantId, data) {
  const patient = await Patient.findOne({ _id: id, tenantId });
  if (!patient) {
    const err = new Error('Patient not found');
    err.status = 404;
    throw err;
  }

  const allowedFields = ['userId', 'patientCode', 'name', 'profileImage', 'dateOfBirth', 'gender', 'phone', 'email', 'address', 'emergencyContact', 'medicalHistory', 'bloodGroup', 'allergies', 'currentMedications', 'idProofType', 'idProofNumber', 'nationality', 'insuranceProvider', 'insurancePolicyNumber', 'status'];
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

module.exports = { createPatient, listPatients, getPatientById, searchPatients, updatePatient, deletePatient };
