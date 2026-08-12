export {};

const { createPatient, listPatients, getPatientById } = require('./patient.service');
const { success } = require('../../utils/response');
const { getPaginationParams } = require('../../utils/pagination');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const patient = await createPatient(payload);
  ctx.status = 201;
  ctx.body = success(patient, 'Patient created');
}

async function index(ctx) {
  const { page, limit } = getPaginationParams(ctx);
  const result = await listPatients(ctx.state.user.tenantId, page, limit);
  ctx.body = success(result.data, 'Patients retrieved', result.pagination);
}

async function show(ctx) {
  const patient = await getPatientById(ctx.params.id, ctx.state.user.tenantId);
  if (!patient) {
    ctx.throw(404, 'Patient not found');
  }
  ctx.body = success(patient);
}

module.exports = { create, index, show };
