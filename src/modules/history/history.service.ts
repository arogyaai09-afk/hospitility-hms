export {};

const Patient = require('../patient/patient.model');
const Visit = require('../visit/visit.model');
const Appointment = require('../appointment/appointment.model');
const Admission = require('../admission/admission.model');
const Discharge = require('../discharge/discharge.model');
const Invoice = require('../invoice/invoice.model');
const Payment = require('../invoice/payment.model');
const { Consultation, Prescription, LabOrder, LabReport, Procedure } = require('../clinical/clinical.model');
const { listCurrentMedications } = require('../clinical/clinical.service');
const { calculateSkip } = require('../../utils/pagination');

async function requirePatient(patientId, tenantId) {
  const patient = await Patient.findOne({ _id: patientId, tenantId }).select('-medicalHistory').lean();
  if (!patient) {
    const error = new Error('Patient not found');
    error.status = 404;
    throw error;
  }
  return patient;
}

async function getVisitDetails(visit, tenantId) {
  const visitId = visit._id;
  const [consultation, prescriptions, labOrders, reports, procedures, invoices] = await Promise.all([
    Consultation.findOne({ visitId, tenantId }).populate('doctorId', 'name specialization').lean(),
    Prescription.find({ visitId, tenantId }).sort({ prescribedAt: -1 }).lean(),
    LabOrder.find({ visitId, tenantId }).sort({ orderedAt: -1 }).lean(),
    LabReport.find({ visitId, tenantId }).sort({ reportedAt: -1 }).lean(),
    Procedure.find({ visitId, tenantId }).sort({ performedAt: -1 }).lean(),
    Invoice.find({ visitId, tenantId }).sort({ createdAt: -1 }).lean()
  ]);
  const payments = invoices.length
    ? await Payment.find({ invoiceId: { $in: invoices.map(invoice => invoice._id) }, tenantId }).sort({ paidAt: -1 }).lean()
    : [];

  return { visit, consultation, prescriptions, reports, labOrders, procedures, invoices, payments, notes: consultation?.clinicalNotes ? [consultation.clinicalNotes] : [] };
}

async function getPatientSummary(patientId, tenantId, page = 1, limit = 20) {
  const patient = await requirePatient(patientId, tenantId);
  const skip = calculateSkip(page, limit);
  const visitFilter = { patientId, tenantId };
  const [visits, total, appointments, admissions, invoices, currentMedications] = await Promise.all([
    Visit.find(visitFilter).populate('doctorId', 'name specialization').populate('departmentId', 'name code').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    Visit.countDocuments(visitFilter),
    Appointment.find({ patientId, tenantId }).sort({ createdAt: -1 }).limit(100).lean(),
    Admission.find({ patientId, tenantId }).sort({ admittedAt: -1 }).limit(100).lean(),
    Invoice.find({ patientId, tenantId }).sort({ createdAt: -1 }).limit(100).lean(),
    listCurrentMedications(patientId, tenantId)
  ]);
  const admissionIds = admissions.map(admission => admission._id);
  const invoiceIds = invoices.map(invoice => invoice._id);
  const [discharges, payments] = await Promise.all([
    admissionIds.length ? Discharge.find({ admissionId: { $in: admissionIds }, tenantId }).sort({ dischargeDate: -1 }).lean() : [],
    invoiceIds.length ? Payment.find({ invoiceId: { $in: invoiceIds }, tenantId }).sort({ paidAt: -1 }).lean() : []
  ]);
  const visitDetails = await Promise.all(visits.map(visit => getVisitDetails(visit, tenantId)));

  return {
    patient,
    currentMedications,
    latestVisit: visits[0] || null,
    visits: visitDetails,
    appointments,
    admissions,
    discharges,
    invoices,
    payments,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) }
  };
}

async function getVisitHistory(visitId, tenantId) {
  const visit = await Visit.findOne({ _id: visitId, tenantId }).populate('patientId', 'patientCode name phone email').populate('doctorId', 'name specialization').populate('departmentId', 'name code').lean();
  if (!visit) {
    const error = new Error('Visit not found');
    error.status = 404;
    throw error;
  }
  return getVisitDetails(visit, tenantId);
}

module.exports = { getPatientSummary, getVisitHistory };
