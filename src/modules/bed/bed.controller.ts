export {};

const { createBed, listBeds, getAvailableBeds } = require('./bed.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const bed = await createBed(payload);
  ctx.status = 201;
  ctx.body = success(bed, 'Bed created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx, 50);
  const result = await listBeds(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Beds retrieved', result.pagination);
}

async function available(ctx) {
  const beds = await getAvailableBeds(ctx.state.user.tenantId);
  ctx.body = success(beds, 'Available beds retrieved');
}

module.exports = { create, index, available };
