export {};

const { createBed, listBeds, getAvailableBeds } = require('./bed.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

function getTenantId(ctx) {
  return ctx.state.user.role === 'admin'
    ? ctx.request.body?.tenantId || ctx.query.tenantId
    : ctx.state.user.tenantId;
}

async function create(ctx) {
  const tenantId = getTenantId(ctx);
  const payload = { ...ctx.request.body, tenantId };
  const bed = await createBed(payload);
  ctx.status = 201;
  ctx.body = success(bed, 'Bed created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx, 50);
  const result = await listBeds(getTenantId(ctx), page, limit);
  ctx.body = success(result.data, 'Beds retrieved', result.pagination);
}

async function available(ctx) {
  const beds = await getAvailableBeds(getTenantId(ctx));
  ctx.body = success(beds, 'Available beds retrieved');
}

module.exports = { create, index, available };
