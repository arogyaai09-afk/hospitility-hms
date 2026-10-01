export {};

const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  profileImage: { type: String, required: true },
  phone: { type: String },
  email: { type: String, lowercase: true },
  medicalLicenseNumber: { type: String, trim: true },
  dateOfBirth: { type: Date },
  bloodGroup: { type: String, trim: true },
  experience: { type: Number, min: 0 },
  address: { type: String, trim: true },
  location: { type: String, trim: true },
  departmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Department' },
  fees: { type: Number, min: 0 },
  status: { type: String, enum: ['active', 'inactive'] },
  availabilityDate: { type: Date },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', unique: true, sparse: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doctor', doctorSchema);
