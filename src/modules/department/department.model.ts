export {};

const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  isActive: { type: Boolean, default: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

departmentSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Department', departmentSchema);