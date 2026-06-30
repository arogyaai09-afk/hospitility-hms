const mongoose = require('mongoose');
const { ROLES } = require('../../constants/roles');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  role: { type: String, required: true, enum: Object.values(ROLES), default: ROLES.TENANT },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  refreshToken: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
