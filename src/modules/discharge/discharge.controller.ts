export {};

const { createDischarge } = require('./discharge.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const discharge = await createDischarge(payload);
  ctx.status = 201;
  ctx.body = success(discharge, 'Discharge summary created');
}

module.exports = { create };
