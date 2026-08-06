export {};

const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
  bedNumber: { type: String, required: true, unique: true },
  ward: { type: String, required: true },
  type: { type: String, enum: ['general', 'semi-private', 'private', 'icu'], default: 'general' },
  status: { type: String, enum: ['available', 'occupied', 'maintenance'], default: 'available' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  assignedAdmissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Bed', bedSchema);
