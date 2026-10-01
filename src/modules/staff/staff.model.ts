export {};

const mongoose = require('mongoose');

const staffSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  profileImage: { type: String },
  phone: { type: String },
  email: { type: String, lowercase: true },
  isDeleted: { type: Boolean, default: false },
  deletedAt: { type: Date },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Staff', staffSchema);
