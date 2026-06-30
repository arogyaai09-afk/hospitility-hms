const { createPatient, listPatients, getPatientById } = require('./patient.service');
const { success } = require('../../utils/response');

async function create(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId };
  const patient = await createPatient(payload);
  ctx.status = 201;
  ctx.body = success(patient, 'Patient created');
}

async function index(ctx) {
  const patients = await listPatients(ctx.state.user.tenantId);
  ctx.body = success(patients);
}

async function show(ctx) {
  const patient = await getPatientById(ctx.params.id, ctx.state.user.tenantId);
  if (!patient) {
    ctx.throw(404, 'Patient not found');
  }
  ctx.body = success(patient);
}

module.exports = { create, index, show };
