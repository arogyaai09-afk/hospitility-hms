export {};

const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, trim: true, maxlength: 5000 },
  createdAt: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  subject: { type: String, required: true, trim: true, maxlength: 200 },
  description: { type: String, required: true, trim: true, maxlength: 5000 },
  category: { type: String, trim: true, maxlength: 80 },
  priority: { type: String, enum: ['low', 'normal', 'high', 'urgent'], default: 'normal' },
  status: { type: String, enum: ['open', 'in_progress', 'waiting_on_tenant', 'resolved', 'closed'], default: 'open' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  messages: { type: [ticketMessageSchema], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  resolvedAt: { type: Date }
});

ticketSchema.index({ tenantId: 1, status: 1, updatedAt: -1 });

module.exports = mongoose.model('Ticket', ticketSchema);
