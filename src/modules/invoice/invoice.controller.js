const {
  createInvoice,
  createAppointmentInvoice,
  listInvoices,
  getInvoicePayments,
  collectPayment
} = require('./invoice.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId, createdBy: ctx.state.user.id };
  const invoice = await createInvoice(payload);
  ctx.status = 201;
  ctx.body = success(invoice, 'Invoice generated');
}

async function createFromAppointment(ctx) {
  const payload = { ...ctx.request.body, createdBy: ctx.state.user.id };
  const invoice = await createAppointmentInvoice(ctx.params.appointmentId, ctx.state.user.tenantId, payload);
  ctx.status = 201;
  ctx.body = success(invoice, 'Appointment invoice generated');
}

async function index(ctx) {
  const invoices = await listInvoices(ctx.state.user.tenantId);
  ctx.body = success(invoices);
}

async function pay(ctx) {
  const invoice = await collectPayment(ctx.params.id, ctx.state.user.tenantId, {
    amount: ctx.request.body.amount,
    paymentMode: ctx.request.body.paymentMode,
    paymentReference: ctx.request.body.paymentReference,
    paymentTerminalId: ctx.request.body.paymentTerminalId,
    status: ctx.request.body.status || 'success',
    receivedBy: ctx.state.user.id
  });
  ctx.body = success(invoice, 'Payment updated');
}

async function payments(ctx) {
  const data = await getInvoicePayments(ctx.params.id, ctx.state.user.tenantId);
  ctx.body = success(data);
}

module.exports = { create, createFromAppointment, index, pay, payments };
