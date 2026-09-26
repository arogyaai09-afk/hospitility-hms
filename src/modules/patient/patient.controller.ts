export {};

const { createPatient, listPatients, getPatientById, searchPatients, updatePatient, deletePatient } = require('./patient.service');
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

async function search(ctx) {
  const tenantId = ctx.state.user.role === 'admin' ? ctx.query.tenantId : ctx.state.user.tenantId;
  if (!tenantId) {
    ctx.throw(400, 'tenantId is required for patient search');
  }
  const patients = await searchPatients(tenantId, ctx.query.q);
  ctx.body = success(patients, 'Patients searched');
}

async function update(ctx) {
  const patient = await updatePatient(ctx.params.id, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(patient, 'Patient updated');
}

async function remove(ctx) {
  const patient = await deletePatient(ctx.params.id, ctx.state.user.tenantId);
  ctx.body = success(patient, 'Patient deleted');
}

module.exports = { create, index, show, search, update, remove };
