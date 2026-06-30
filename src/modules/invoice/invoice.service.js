const Invoice = require('./invoice.model');
const Payment = require('./payment.model');
const { getAppointmentById } = require('../appointment/appointment.service');
const { getActiveTaxById, getDefaultTax } = require('../tax/tax.service');

function buildLineItems(lineItems = []) {
  return lineItems.map((item) => {
    const quantity = Number(item.quantity || 1);
    const unitPrice = Number(item.unitPrice || 0);
    return {
      description: item.description,
      quantity,
      unitPrice,
      amount: quantity * unitPrice
    };
  });
}

function calculateAmount(payload) {
  if (payload.lineItems && payload.lineItems.length > 0) {
    return payload.lineItems.reduce((total, item) => total + item.amount, 0);
  }
  return Number(payload.amount || 0);
}

function calculateTotals(payload) {
  const subtotalAmount = calculateAmount(payload);
  const discountAmount = Number(payload.discountAmount || 0);
  const taxRate = Number(payload.taxRate || 0);
  const taxableAmount = Math.max(subtotalAmount - discountAmount, 0);
  const taxBreakdown = (payload.taxComponents || []).map((component) => ({
    name: component.name,
    code: component.code,
    rate: Number(component.rate || 0),
    amount: (taxableAmount * Number(component.rate || 0)) / 100
  }));
  const taxAmount = taxBreakdown.length > 0
    ? taxBreakdown.reduce((total, component) => total + component.amount, 0)
    : Number(payload.taxAmount ?? ((taxableAmount * taxRate) / 100));
  const totalAmount = taxableAmount + taxAmount;

  return {
    subtotalAmount,
    discountAmount,
    taxRate,
    taxAmount,
    taxBreakdown,
    totalAmount,
    balanceAmount: totalAmount
  };
}

function createDocumentNumber(prefix) {
  return `${prefix}-${Date.now()}`;
}

async function resolveTax(payload) {
  if (payload.taxId) {
    return getActiveTaxById(payload.taxId, payload.tenantId);
  }

  if (payload.useDefaultTax) {
    return getDefaultTax(payload.tenantId);
  }

  return null;
}

async function createInvoice(payload) {
  const lineItems = buildLineItems(payload.lineItems);
  const tax = await resolveTax(payload);
  const taxRate = tax ? tax.rate : payload.taxRate;
  const taxComponents = tax && tax.components.length > 0 ? tax.components : [];
  const totals = calculateTotals({ ...payload, lineItems, taxRate, taxComponents });
  const snapshotComponents = taxComponents.map((component) => {
    const breakdown = totals.taxBreakdown.find((item) => item.code === component.code);
    return {
      name: component.name,
      code: component.code,
      rate: component.rate,
      type: component.type,
      amount: breakdown ? breakdown.amount : 0
    };
  });
  const taxSnapshot = tax ? {
    taxId: tax._id,
    name: tax.name,
    code: tax.code,
    rate: tax.rate,
    type: tax.type,
    components: snapshotComponents
  } : payload.taxSnapshot;

  if (totals.totalAmount <= 0) {
    const err = new Error('Invoice amount must be greater than zero');
    err.status = 400;
    throw err;
  }

  return Invoice.create({
    ...payload,
    orderNumber: payload.orderNumber || createDocumentNumber('ORD'),
    invoiceNumber: payload.invoiceNumber || createDocumentNumber('INV'),
    lineItems,
    taxId: tax ? tax._id : payload.taxId,
    taxSnapshot,
    ...totals,
    amount: totals.totalAmount,
    paidAmount: 0,
    status: 'pending',
    orderStatus: payload.orderStatus || 'finalized'
  });
}

async function createAppointmentInvoice(appointmentId, tenantId, payload) {
  const appointment = await getAppointmentById(appointmentId, tenantId);
  if (!appointment) {
    const err = new Error('Appointment not found');
    err.status = 404;
    throw err;
  }

  return createInvoice({
    ...payload,
    appointmentId: appointment._id,
    patientId: appointment.patientId,
    patientName: appointment.patientName,
    tenantId
  });
}

async function listInvoices(tenantId) {
  return Invoice.find({ tenantId }).sort({ createdAt: -1 });
}

async function getInvoicePayments(invoiceId, tenantId) {
  return Payment.find({ invoiceId, tenantId }).sort({ paidAt: -1 });
}

async function collectPayment(id, tenantId, payload) {
  const invoice = await Invoice.findOne({ _id: id, tenantId });
  if (!invoice) {
    const err = new Error('Invoice not found');
    err.status = 404;
    throw err;
  }

  if (invoice.status === 'paid' || invoice.orderStatus === 'closed') {
    const err = new Error('Invoice is already fully paid');
    err.status = 400;
    throw err;
  }

  const amount = Number(payload.amount || invoice.balanceAmount);
  const paymentStatus = payload.status || 'success';

  if (!payload.paymentMode) {
    const err = new Error('paymentMode is required');
    err.status = 400;
    throw err;
  }

  if (amount <= 0) {
    const err = new Error('Payment amount must be greater than zero');
    err.status = 400;
    throw err;
  }

  if (amount > invoice.balanceAmount) {
    const err = new Error('Payment amount cannot exceed invoice balance');
    err.status = 400;
    throw err;
  }

  if (invoice.paymentType === 'one_time' && amount !== invoice.balanceAmount) {
    const err = new Error('One-time payment must clear the full invoice balance');
    err.status = 400;
    throw err;
  }

  await Payment.create({
    invoiceId: invoice._id,
    tenantId,
    amount,
    paymentMode: payload.paymentMode,
    paymentReference: payload.paymentReference,
    paymentTerminalId: payload.paymentTerminalId,
    status: paymentStatus,
    receivedBy: payload.receivedBy
  });

  if (paymentStatus === 'failed') {
    invoice.status = invoice.paidAmount > 0 ? 'partially_paid' : 'failed';
    await invoice.save();
    return invoice;
  }

  const paidAmount = invoice.paidAmount + amount;
  const balanceAmount = Math.max(invoice.totalAmount - paidAmount, 0);
  const isPaid = balanceAmount === 0;

  invoice.paidAmount = paidAmount;
  invoice.balanceAmount = balanceAmount;
  invoice.paymentMode = payload.paymentMode;
  invoice.paymentReference = payload.paymentReference || invoice.paymentReference;
  invoice.paymentTerminalId = payload.paymentTerminalId || invoice.paymentTerminalId;
  invoice.status = isPaid ? 'paid' : 'partially_paid';
  invoice.orderStatus = isPaid ? 'closed' : invoice.orderStatus;
  invoice.paidAt = isPaid ? new Date() : invoice.paidAt;

  await invoice.save();
  return invoice;
}

module.exports = {
  createInvoice,
  createAppointmentInvoice,
  listInvoices,
  getInvoicePayments,
  collectPayment
};
