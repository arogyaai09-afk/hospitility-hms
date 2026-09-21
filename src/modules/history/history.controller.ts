export {};

const { getPatientSummary, getVisitHistory } = require('./history.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function patientSummary(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const data = await getPatientSummary(ctx.params.patientId, ctx.state.user.tenantId, page, limit);
  const pagination = data.pagination;
  delete data.pagination;
  ctx.body = success(data, 'Patient summary retrieved', pagination);
}

async function visitHistory(ctx) {
  const data = await getVisitHistory(ctx.params.visitId, ctx.state.user.tenantId);
  ctx.body = success(data, 'Visit history retrieved');
}

module.exports = { patientSummary, visitHistory };
