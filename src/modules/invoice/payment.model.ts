export {};

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  invoiceId: { type: mongoose.Schema.Types.ObjectId, ref: 'Invoice', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  amount: { type: Number, required: true, min: 1 },
  paymentMode: { type: String, enum: ['cash', 'online'], required: true },
  paymentReference: { type: String },
  paymentTerminalId: { type: String },
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  receivedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

paymentSchema.index({ tenantId: 1, invoiceId: 1, createdAt: -1 });

module.exports = mongoose.model('Payment', paymentSchema);
