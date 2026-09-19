export {};

const {
  createInvoice,
  createAppointmentInvoice,
  listInvoices,
  getInvoicePayments,
  collectPayment
} = require('./invoice.service');
const { success } = require('../../utils/response');

function getTenantId(ctx) {
  return ctx.state.user.role === 'admin'
    ? ctx.request.body?.tenantId || ctx.query.tenantId
    : ctx.state.user.tenantId;
}

async function create(ctx) {
  const tenantId = getTenantId(ctx);
  const payload = { ...ctx.request.body, tenantId, createdBy: ctx.state.user.id };
  const invoice = await createInvoice(payload);
  ctx.status = 201;
  ctx.body = success(invoice, 'Invoice generated');
}

async function createFromAppointment(ctx) {
  const tenantId = getTenantId(ctx);
  const payload = { ...ctx.request.body, createdBy: ctx.state.user.id };
  const invoice = await createAppointmentInvoice(ctx.params.appointmentId, tenantId, payload);
  ctx.status = 201;
  ctx.body = success(invoice, 'Appointment invoice generated');
}

async function index(ctx) {
  const invoices = await listInvoices(getTenantId(ctx));
  ctx.body = success(invoices);
}

async function pay(ctx) {
  const invoice = await collectPayment(ctx.params.id, getTenantId(ctx), {
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
  const data = await getInvoicePayments(ctx.params.id, getTenantId(ctx));
  ctx.body = success(data);
}

module.exports = { create, createFromAppointment, index, pay, payments };
