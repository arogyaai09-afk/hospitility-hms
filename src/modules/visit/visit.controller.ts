export {};

const { createVisit, listPatientVisits, getVisitById, updateVisitStatus } = require('./visit.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const visit = await createVisit({
    ...ctx.request.body,
    patientId: ctx.params.patientId,
    tenantId: ctx.state.user.tenantId,
    createdBy: ctx.state.user.id
  });
  ctx.status = 201;
  ctx.body = success(visit, 'Visit created');
}

async function listByPatient(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listPatientVisits(ctx.params.patientId, ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Patient visits retrieved', result.pagination);
}

async function show(ctx) {
  const visit = await getVisitById(ctx.params.visitId, ctx.state.user.tenantId);
  if (!visit) {
    ctx.throw(404, 'Visit not found');
  }
  ctx.body = success(visit);
}

async function updateStatus(ctx) {
  const visit = await updateVisitStatus(ctx.params.visitId, ctx.state.user.tenantId, ctx.request.body.status);
  ctx.body = success(visit, 'Visit status updated');
}

module.exports = { create, listByPatient, show, updateStatus };
