export {};

const Visit = require('./visit.model');
const Patient = require('../patient/patient.model');
const Appointment = require('../appointment/appointment.model');
const Admission = require('../admission/admission.model');
const Doctor = require('../doctor/doctor.model');
const Department = require('../department/department.model');
const { calculateSkip } = require('../../utils/pagination');

const allowedTransitions = {
  registered: ['checked_in', 'cancelled'],
  checked_in: ['in_consultation', 'cancelled'],
  in_consultation: ['completed'],
  completed: [],
  cancelled: []
};

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function requireTenantDocument(Model, id, tenantId, name) {
  if (!id) {
    return null;
  }

  const document = await Model.findOne({ _id: id, tenantId }).select('_id').lean();
  if (!document) {
    throw validationError(`${name} not found or does not belong to this tenant`);
  }
  return document;
}

function createVisitCode() {
  return `VIS-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
}

async function validateReferences(data) {
  await requireTenantDocument(Patient, data.patientId, data.tenantId, 'Patient');
  await requireTenantDocument(Appointment, data.appointmentId, data.tenantId, 'Appointment');
  await requireTenantDocument(Admission, data.admissionId, data.tenantId, 'Admission');
  await requireTenantDocument(Doctor, data.doctorId, data.tenantId, 'Doctor');
  await requireTenantDocument(Department, data.departmentId, data.tenantId, 'Department');
}

async function createVisit(data) {
  if (!data.patientId) {
    throw validationError('patientId is required');
  }
  if (!data.visitType) {
    throw validationError('visitType is required');
  }

  await validateReferences(data);

  const visit = await Visit.create({
    ...data,
    visitCode: data.visitCode || createVisitCode(),
    status: data.status || 'registered'
  });
  return visit.toObject();
}

async function listPatientVisits(patientId, tenantId, page = 1, limit = 20) {
  await requireTenantDocument(Patient, patientId, tenantId, 'Patient');
  const skip = calculateSkip(page, limit);
  const filter = { patientId, tenantId };
  const [visits, total] = await Promise.all([
    Visit.find(filter)
      .populate('doctorId', 'name specialization')
      .populate('departmentId', 'name code')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Visit.countDocuments(filter)
  ]);

  return {
    data: visits,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}

async function getVisitById(id, tenantId) {
  return Visit.findOne({ _id: id, tenantId })
    .populate('patientId', 'patientCode name phone email')
    .populate('doctorId', 'name specialization')
    .populate('departmentId', 'name code')
    .populate('appointmentId', 'patientId patientName status')
    .populate('admissionId', 'patientId patientName status')
    .lean();
}

async function updateVisitStatus(id, tenantId, status) {
  if (!status || !Object.prototype.hasOwnProperty.call(allowedTransitions, status)) {
    throw validationError('Invalid visit status');
  }

  const visit = await Visit.findOne({ _id: id, tenantId });
  if (!visit) {
    const error = new Error('Visit not found');
    error.status = 404;
    throw error;
  }

  if (!allowedTransitions[visit.status].includes(status)) {
    throw validationError(`Cannot transition visit from ${visit.status} to ${status}`);
  }

  visit.status = status;
  if (status === 'checked_in') {
    visit.checkedInAt = new Date();
  }
  if (status === 'completed') {
    visit.completedAt = new Date();
  }
  await visit.save();
  return visit.toObject();
}

module.exports = { createVisit, listPatientVisits, getVisitById, updateVisitStatus };
