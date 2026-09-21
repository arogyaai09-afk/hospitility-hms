export {};

const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  chiefComplaint: { type: String, trim: true },
  symptoms: { type: String },
  examination: { type: String },
  vitals: { type: mongoose.Schema.Types.Mixed },
  assessment: { type: String },
  diagnosis: { type: String },
  treatmentPlan: { type: String },
  followUpDate: { type: Date },
  clinicalNotes: { type: String },
  status: { type: String, enum: ['draft', 'completed'], default: 'draft' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
consultationSchema.index({ tenantId: 1, visitId: 1 }, { unique: true });

const prescriptionItemSchema = new mongoose.Schema({
  medicineName: { type: String, required: true, trim: true },
  genericName: { type: String, trim: true },
  dosage: { type: String, trim: true },
  frequency: { type: String, trim: true },
  route: { type: String, trim: true },
  duration: { type: String, trim: true },
  quantity: { type: Number, min: 0 },
  instructions: { type: String },
  startDate: { type: Date },
  endDate: { type: Date },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' }
}, { _id: true });

const prescriptionSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true },
  items: { type: [prescriptionItemSchema], required: true, validate: value => value.length > 0 },
  notes: { type: String },
  status: { type: String, enum: ['active', 'completed', 'cancelled'], default: 'active' },
  prescribedAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
prescriptionSchema.index({ tenantId: 1, patientId: 1, prescribedAt: -1 });
prescriptionSchema.index({ tenantId: 1, visitId: 1 });

const labOrderSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  testName: { type: String, required: true, trim: true },
  instructions: { type: String },
  status: { type: String, enum: ['ordered', 'in_progress', 'completed', 'cancelled'], default: 'ordered' },
  orderedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  orderedAt: { type: Date, default: Date.now }
}, { timestamps: true });
labOrderSchema.index({ tenantId: 1, patientId: 1, orderedAt: -1 });

const labReportSchema = new mongoose.Schema({
  labOrderId: { type: mongoose.Schema.Types.ObjectId, ref: 'LabOrder', required: true },
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  resultText: { type: String, required: true },
  attachmentUrl: { type: String },
  reportedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reportedAt: { type: Date, default: Date.now }
}, { timestamps: true });
labReportSchema.index({ tenantId: 1, visitId: 1, reportedAt: -1 });

const procedureSchema = new mongoose.Schema({
  visitId: { type: mongoose.Schema.Types.ObjectId, ref: 'Visit', required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  procedureName: { type: String, required: true, trim: true },
  indication: { type: String },
  performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  notes: { type: String },
  outcome: { type: String },
  performedAt: { type: Date, default: Date.now },
  status: { type: String, enum: ['planned', 'completed', 'cancelled'], default: 'planned' }
}, { timestamps: true });
procedureSchema.index({ tenantId: 1, patientId: 1, performedAt: -1 });

module.exports = {
  Consultation: mongoose.model('Consultation', consultationSchema),
  Prescription: mongoose.model('Prescription', prescriptionSchema),
  LabOrder: mongoose.model('LabOrder', labOrderSchema),
  LabReport: mongoose.model('LabReport', labReportSchema),
  Procedure: mongoose.model('Procedure', procedureSchema)
};
