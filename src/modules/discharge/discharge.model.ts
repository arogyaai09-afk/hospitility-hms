export {};

const mongoose = require('mongoose');

const dischargeSchema = new mongoose.Schema({
  admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission', required: true },
  summary: { type: String, required: true },
  recommendations: { type: String },
  dischargeDate: { type: Date, default: Date.now },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Discharge', dischargeSchema);
