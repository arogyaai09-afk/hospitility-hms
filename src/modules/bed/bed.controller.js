const { createBed, listBeds, getAvailableBeds } = require('./bed.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const bed = await createBed(payload);
  ctx.status = 201;
  ctx.body = success(bed, 'Bed created');
}

async function index(ctx) {
  const beds = await listBeds(ctx.state.user.tenantId);
  ctx.body = success(beds);
}

async function available(ctx) {
  const beds = await getAvailableBeds(ctx.state.user.tenantId);
  ctx.body = success(beds);
}

module.exports = { create, index, available };
