const mongoose = require('mongoose');

const taxComponentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  rate: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['percentage'], default: 'percentage' }
}, { _id: false });

const taxSchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, uppercase: true, trim: true },
  rate: { type: Number, required: true, min: 0 },
  type: { type: String, enum: ['percentage'], default: 'percentage' },
  components: { type: [taxComponentSchema], default: [] },
  isDefault: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

taxSchema.index({ tenantId: 1, code: 1 }, { unique: true });

module.exports = mongoose.model('Tax', taxSchema);
