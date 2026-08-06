export {};

const { createTax, listTaxes, getTaxById, updateTax } = require('./tax.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const tax = await createTax({
    ...ctx.request.body,
    tenantId: ctx.state.user.tenantId,
    createdBy: ctx.state.user.id
  });
  ctx.status = 201;
  ctx.body = success(tax, 'Tax created');
}

async function index(ctx) {
  const filters: { isActive?: boolean } = {};
  if (ctx.query.isActive !== undefined) {
    filters.isActive = ctx.query.isActive === 'true';
  }
  const taxes = await listTaxes(ctx.state.user.tenantId, filters);
  ctx.body = success(taxes);
}

async function show(ctx) {
  const tax = await getTaxById(ctx.params.id, ctx.state.user.tenantId);
  ctx.body = success(tax);
}

async function update(ctx) {
  const tax = await updateTax(ctx.params.id, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(tax, 'Tax updated');
}

module.exports = { create, index, show, update };
