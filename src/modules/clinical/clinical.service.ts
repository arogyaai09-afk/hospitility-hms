export {};

const Visit = require('../visit/visit.model');
const Patient = require('../patient/patient.model');
const { Consultation, Prescription, LabOrder, LabReport, Procedure } = require('./clinical.model');

function validationError(message) {
  const error = new Error(message);
  error.status = 400;
  return error;
}

async function getVisit(visitId, tenantId) {
  const visit = await Visit.findOne({ _id: visitId, tenantId }).select('_id patientId doctorId status').lean();
  if (!visit) {
    const error = new Error('Visit not found');
    error.status = 404;
    throw error;
  }
  if (visit.status === 'cancelled') {
    throw validationError('Cancelled visits cannot receive clinical records');
  }
  return visit;
}

async function getPatient(patientId, tenantId) {
  const patient = await Patient.findOne({ _id: patientId, tenantId }).select('_id').lean();
  if (!patient) {
    const error = new Error('Patient not found');
    error.status = 404;
    throw error;
  }
  return patient;
}

async function validateVisitPatient(visitId, patientId, tenantId) {
  const visit = await getVisit(visitId, tenantId);
  if (String(visit.patientId) !== String(patientId)) {
    throw validationError('Patient does not belong to the visit');
  }
  return visit;
}

async function saveConsultation(visitId, tenantId, data, userId) {
  const visit = await getVisit(visitId, tenantId);
  const doctorId = data.doctorId || visit.doctorId;
  if (!doctorId) {
    throw validationError('doctorId is required for a consultation');
  }
  const consultation = await Consultation.findOneAndUpdate(
    { visitId, tenantId },
    { ...data, visitId, patientId: visit.patientId, doctorId, tenantId, createdBy: userId },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean();
  return consultation;
}

async function getConsultation(visitId, tenantId) {
  return Consultation.findOne({ visitId, tenantId }).populate('doctorId', 'name specialization').lean();
}

async function updateConsultation(id, tenantId, data) {
  const consultation = await Consultation.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: data },
    { new: true, runValidators: true }
  ).lean();
  if (!consultation) {
    const error = new Error('Consultation not found');
    error.status = 404;
    throw error;
  }
  return consultation;
}

async function createPrescription(visitId, tenantId, data, userId) {
  const visit = await getVisit(visitId, tenantId);
  if (!data.doctorId && !visit.doctorId) {
    throw validationError('doctorId is required for a prescription');
  }
  return Prescription.create({
    ...data,
    visitId,
    patientId: visit.patientId,
    tenantId,
    doctorId: data.doctorId || visit.doctorId,
    createdBy: userId
  });
}

async function listPrescriptionsByPatient(patientId, tenantId) {
  await getPatient(patientId, tenantId);
  return Prescription.find({ patientId, tenantId }).sort({ prescribedAt: -1 }).lean();
}

async function listPrescriptionsByVisit(visitId, tenantId) {
  await getVisit(visitId, tenantId);
  return Prescription.find({ visitId, tenantId }).sort({ prescribedAt: -1 }).lean();
}

async function updatePrescription(id, tenantId, data) {
  const allowedFields = ['items', 'notes', 'status'];
  const update = {};
  for (const field of allowedFields) {
    if (data[field] !== undefined) update[field] = data[field];
  }
  const prescription = await Prescription.findOneAndUpdate(
    { _id: id, tenantId },
    { $set: update },
    { new: true, runValidators: true }
  ).lean();
  if (!prescription) {
    const error = new Error('Prescription not found');
    error.status = 404;
    throw error;
  }
  return prescription;
}

async function listCurrentMedications(patientId, tenantId) {
  await getPatient(patientId, tenantId);
  const now = new Date();
  const prescriptions = await Prescription.find({
    patientId,
    tenantId,
    status: 'active',
    $or: [{ 'items.startDate': { $exists: false } }, { 'items.startDate': { $lte: now } }]
  }).sort({ prescribedAt: -1 }).lean();

  return prescriptions.map(prescription => ({
    prescriptionId: prescription._id,
    prescribedAt: prescription.prescribedAt,
    doctorId: prescription.doctorId,
    items: prescription.items.filter(item => item.status === 'active' && (!item.endDate || item.endDate >= now))
  })).filter(prescription => prescription.items.length > 0);
}

async function createLabOrder(visitId, tenantId, data, userId) {
  const visit = await getVisit(visitId, tenantId);
  return LabOrder.create({ ...data, visitId, patientId: visit.patientId, tenantId, orderedBy: userId });
}

async function listLabOrdersByPatient(patientId, tenantId) {
  await getPatient(patientId, tenantId);
  return LabOrder.find({ patientId, tenantId }).sort({ orderedAt: -1 }).lean();
}

async function createLabReport(labOrderId, tenantId, data, userId) {
  const order = await LabOrder.findOne({ _id: labOrderId, tenantId }).lean();
  if (!order) {
    const error = new Error('Lab order not found');
    error.status = 404;
    throw error;
  }
  const report = await LabReport.create({ ...data, labOrderId, visitId: order.visitId, patientId: order.patientId, tenantId, reportedBy: userId });
  await LabOrder.updateOne({ _id: labOrderId, tenantId }, { $set: { status: 'completed' } });
  return report.toObject();
}

async function listReportsByVisit(visitId, tenantId) {
  await getVisit(visitId, tenantId);
  return LabReport.find({ visitId, tenantId }).sort({ reportedAt: -1 }).lean();
}

async function createProcedure(visitId, tenantId, data, userId) {
  const visit = await getVisit(visitId, tenantId);
  return Procedure.create({ ...data, visitId, patientId: visit.patientId, tenantId, performedBy: data.performedBy || userId });
}

async function listProceduresByVisit(visitId, tenantId) {
  await getVisit(visitId, tenantId);
  return Procedure.find({ visitId, tenantId }).sort({ performedAt: -1 }).lean();
}

async function listProceduresByPatient(patientId, tenantId) {
  await getPatient(patientId, tenantId);
  return Procedure.find({ patientId, tenantId }).sort({ performedAt: -1 }).lean();
}

module.exports = {
  saveConsultation,
  getConsultation,
  updateConsultation,
  createPrescription,
  listPrescriptionsByPatient,
  listPrescriptionsByVisit,
  updatePrescription,
  listCurrentMedications,
  createLabOrder,
  listLabOrdersByPatient,
  createLabReport,
  listReportsByVisit,
  createProcedure,
  listProceduresByVisit,
  listProceduresByPatient
};
