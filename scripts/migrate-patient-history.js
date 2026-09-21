'use strict';

const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Patient = require('../src/modules/patient/patient.model');
const Appointment = require('../src/modules/appointment/appointment.model');
const Admission = require('../src/modules/admission/admission.model');
const Emergency = require('../src/modules/emergency/emergency.model');
const Invoice = require('../src/modules/invoice/invoice.model');
const Visit = require('../src/modules/visit/visit.model');

const applyChanges = process.argv.includes('--apply');

function visitTypeForAppointment(appointmentType) {
  return appointmentType === 'Emergency' ? 'emergency' : appointmentType;
}

function visitStatusForAppointment(status) {
  if (status === 'completed') return 'completed';
  if (status === 'cancelled') return 'cancelled';
  return 'registered';
}

async function createVisit(data) {
  if (!data.patientId) return null;
  const existing = await Visit.findOne(data.lookup).select('_id').lean();
  if (existing) return existing;
  if (!applyChanges) return { dryRun: true };
  return Visit.create(data.visit);
}

async function migratePatients(summary) {
  const patients = await Patient.find({}).sort({ _id: 1 }).lean();
  const codes = new Set();
  for (const patient of patients) {
    const key = `${patient.tenantId}:${patient.patientCode || ''}`;
    const duplicate = !patient.patientCode || codes.has(key);
    if (duplicate) {
      summary.patientCodes += 1;
      if (applyChanges) {
        await Patient.updateOne({ _id: patient._id }, { $set: { patientCode: `PAT-${patient._id.toString().slice(-10).toUpperCase()}` } });
      }
    }
    codes.add(key);
  }
  if (applyChanges) {
    const indexes = await Patient.collection.indexes();
    const legacyIndex = indexes.find(index => index.name === 'patientCode_1');
    if (legacyIndex) await Patient.collection.dropIndex(legacyIndex.name);
  }
}

async function migrateAppointments(summary) {
  const appointments = await Appointment.find({ patientId: { $exists: true, $ne: null }, visitId: { $exists: false } }).lean();
  for (const appointment of appointments) {
    const result = await createVisit({
      lookup: { tenantId: appointment.tenantId, appointmentId: appointment._id },
      visit: {
        patientId: appointment.patientId,
        tenantId: appointment.tenantId,
        visitType: visitTypeForAppointment(appointment.appointmentType),
        status: visitStatusForAppointment(appointment.status),
        appointmentId: appointment._id,
        doctorId: appointment.doctorId,
        visitReason: appointment.visitReason,
        createdBy: appointment.createdBy
      },
      patientId: appointment.patientId
    });
    if (!result) { summary.skipped += 1; continue; }
    summary.appointments += 1;
    if (applyChanges) await Appointment.updateOne({ _id: appointment._id }, { $set: { visitId: result._id } });
  }
}

async function migrateAdmissions(summary) {
  const admissions = await Admission.find({ visitId: { $exists: false } }).lean();
  for (const admission of admissions) {
    let patientId = admission.patientId;
    if (!patientId && admission.appointmentId) {
      const appointment = await Appointment.findOne({ _id: admission.appointmentId, tenantId: admission.tenantId }).select('patientId').lean();
      patientId = appointment?.patientId;
      if (patientId && applyChanges) await Admission.updateOne({ _id: admission._id }, { $set: { patientId } });
    }
    const result = await createVisit({
      lookup: { tenantId: admission.tenantId, admissionId: admission._id },
      visit: {
        patientId,
        tenantId: admission.tenantId,
        visitType: admission.admissionType === 'Emergency' ? 'emergency' : admission.admissionType,
        status: admission.status === 'discharged' ? 'completed' : 'registered',
        admissionId: admission._id,
        appointmentId: admission.appointmentId,
        doctorId: admission.doctorId,
        createdBy: admission.createdBy
      },
      patientId
    });
    if (!result) { summary.skipped += 1; continue; }
    summary.admissions += 1;
    if (applyChanges) await Admission.updateOne({ _id: admission._id }, { $set: { visitId: result._id } });
  }
}

async function linkInvoices(summary) {
  const invoices = await Invoice.find({ visitId: { $exists: false } }).select('_id tenantId appointmentId admissionId').lean();
  for (const invoice of invoices) {
    let visit = null;
    if (invoice.appointmentId) visit = await Visit.findOne({ tenantId: invoice.tenantId, appointmentId: invoice.appointmentId }).select('_id').lean();
    if (!visit && invoice.admissionId) visit = await Visit.findOne({ tenantId: invoice.tenantId, admissionId: invoice.admissionId }).select('_id').lean();
    if (!visit) { summary.unresolvedInvoices += 1; continue; }
    summary.invoices += 1;
    if (applyChanges) await Invoice.updateOne({ _id: invoice._id }, { $set: { visitId: visit._id } });
  }
}

async function main() {
  const summary = { mode: applyChanges ? 'apply' : 'dry-run', patientCodes: 0, appointments: 0, admissions: 0, invoices: 0, skipped: 0, unresolvedInvoices: 0 };
  await connectDB();
  await migratePatients(summary);
  await migrateAppointments(summary);
  await migrateAdmissions(summary);
  await linkInvoices(summary);
  console.log(JSON.stringify(summary, null, 2));
  await mongoose.disconnect();
}

main().catch(async error => {
  console.error(error);
  await mongoose.disconnect();
  process.exitCode = 1;
});
