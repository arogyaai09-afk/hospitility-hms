export {};

const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  patientCode: { type: String, required: true, trim: true },
  name: { type: String, required: true },
  profileImage: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },
  phone: { type: String },
  email: { type: String, lowercase: true },
  address: { type: String },
  emergencyContact: { type: String },
  medicalHistory: { type: String },
  bloodGroup: { type: String, trim: true },
  allergies: { type: [String], default: [] },
  currentMedications: { type: [String], default: [] },
  idProofType: { type: String, trim: true },
  idProofNumber: { type: String, trim: true },
  nationality: { type: String, trim: true },
  insuranceProvider: { type: String, trim: true },
  insurancePolicyNumber: { type: String, trim: true },
  status: { type: String, enum: ['active', 'inactive', 'deceased'], default: 'active' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
}, { timestamps: true });

patientSchema.index({ tenantId: 1, patientCode: 1 }, { unique: true });
patientSchema.index({ tenantId: 1, phone: 1 });
patientSchema.index({ tenantId: 1, email: 1 });
patientSchema.index({ tenantId: 1, idProofType: 1, idProofNumber: 1 }, { sparse: true });

module.exports = mongoose.model('Patient', patientSchema);
