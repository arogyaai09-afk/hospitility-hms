export {};

const { admitFromOPD, admitIPD, listAdmissions, updateAdmission, dischargeAdmission } = require('./admission.service');
const { success } = require('../../utils/response');

async function admitFromOpd(ctx) {
  const { appointmentId, bedNumber, doctorId } = ctx.request.body;
  const admission = await admitFromOPD(appointmentId, ctx.state.user.tenantId, bedNumber, doctorId);
  ctx.status = 201;
  ctx.body = success(admission, 'OPD converted to admission');
}

async function admitIpd(ctx) {
  const payload = { ...ctx.request.body, tenantId: ctx.state.user.tenantId, status: 'admitted' };
  const admission = await admitIPD(payload);
  ctx.status = 201;
  ctx.body = success(admission, 'IPD admission created');
}

async function index(ctx) {
  const admissions = await listAdmissions(ctx.state.user.tenantId);
  ctx.body = success(admissions);
}

async function update(ctx) {
  const admission = await updateAdmission(ctx.params.id, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(admission, 'Admission updated');
}

async function discharge(ctx) {
  const admission = await dischargeAdmission(ctx.params.id, ctx.state.user.tenantId);
  if (!admission) {
    ctx.throw(404, 'Admission not found');
  }
  ctx.body = success(admission, 'Patient discharged');
}

module.exports = { admitFromOpd, admitIpd, index, update, discharge };
