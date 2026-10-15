export {};

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant' },
  type: { type: String, required: true },
  title: { type: String, required: true, trim: true },
  body: { type: String, required: true, trim: true },
  entityType: { type: String },
  entityId: { type: mongoose.Schema.Types.ObjectId },
  readAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

notificationSchema.index({ recipientId: 1, readAt: 1, createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
