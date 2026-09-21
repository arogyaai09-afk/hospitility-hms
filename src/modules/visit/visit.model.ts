export {};

const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema({
  visitCode: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  visitType: { type: String, required: true, enum: ['OPD', 'IPD', 'emergency', 'follow_up', 'walk_in'] },
  status: { type: String, required: true, enum: ['registered', 'checked_in', 'in_consultation', 'completed', 'cancelled'], default: 'registered' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  visitReason: { type: String, trim: true },
  checkedInAt: { type: Date },
  completedAt: { type: Date },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

visitSchema.index({ tenantId: 1, visitCode: 1 }, { unique: true });
visitSchema.index({ tenantId: 1, patientId: 1, createdAt: -1 });
visitSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model('Visit', visitSchema);
