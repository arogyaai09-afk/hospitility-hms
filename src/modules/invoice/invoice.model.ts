export {};

const mongoose = require('mongoose');

const lineItemSchema = new mongoose.Schema({
  description: { type: String, required: true },
  quantity: { type: Number, required: true, min: 1, default: 1 },
  unitPrice: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true, min: 0 }
}, { _id: false });

const taxSnapshotSchema = new mongoose.Schema({
  taxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax' },
  name: { type: String },
  code: { type: String },
  rate: { type: Number, default: 0 },
  type: { type: String, enum: ['percentage'], default: 'percentage' },
  components: [{
    name: { type: String },
    code: { type: String },
    rate: { type: Number, default: 0 },
    type: { type: String, enum: ['percentage'], default: 'percentage' },
    amount: { type: Number, default: 0 }
  }]
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  orderNumber: { type: String },
  orderStatus: { type: String, enum: ['draft', 'finalized', 'closed', 'cancelled'], default: 'finalized' },
  invoiceNumber: { type: String },
  patientId: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient' },
  patientName: { type: String, required: true },
  admissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Admission' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  lineItems: { type: [lineItemSchema], default: [] },
  taxId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tax' },
  taxSnapshot: { type: taxSnapshotSchema },
  subtotalAmount: { type: Number, required: true, min: 0 },
  discountAmount: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0 },
  taxAmount: { type: Number, default: 0, min: 0 },
  taxBreakdown: [{
    name: { type: String },
    code: { type: String },
    rate: { type: Number, default: 0 },
    amount: { type: Number, default: 0 }
  }],
  totalAmount: { type: Number, required: true, min: 0 },
  paidAmount: { type: Number, default: 0, min: 0 },
  balanceAmount: { type: Number, required: true, min: 0 },
  amount: { type: Number, required: true },
  paymentType: { type: String, enum: ['one_time', 'split'], default: 'one_time' },
  paymentMode: { type: String, enum: ['cash', 'online'] },
  paymentTerminalId: { type: String },
  paymentReference: { type: String },
  status: { type: String, enum: ['pending', 'partially_paid', 'paid', 'failed', 'cancelled'], default: 'pending' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  paidAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

invoiceSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true, sparse: true });
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('Invoice', invoiceSchema);
