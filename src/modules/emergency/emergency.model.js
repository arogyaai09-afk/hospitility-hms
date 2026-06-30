const mongoose = require('mongoose');

const emergencySchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  emergencyType: { type: String, required: true, enum: ['accident', 'cardiac', 'stroke', 'trauma', 'other'] },
  severity: { type: String, required: true, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  assignedDoctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  status: { type: String, enum: ['pending', 'under-treatment', 'stabilized', 'admitted', 'discharged'], default: 'pending' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Emergency', emergencySchema);
