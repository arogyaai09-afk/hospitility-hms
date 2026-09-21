export {};

const service = require('./clinical.service');
const { success } = require('../../utils/response');

async function saveConsultation(ctx) {
  const data = await service.saveConsultation(ctx.params.visitId, ctx.state.user.tenantId, ctx.request.body, ctx.state.user.id);
  ctx.body = success(data, 'Consultation saved');
}

async function getConsultation(ctx) {
  const data = await service.getConsultation(ctx.params.visitId, ctx.state.user.tenantId);
  ctx.body = success(data);
}

async function updateConsultation(ctx) {
  const data = await service.updateConsultation(ctx.params.consultationId, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(data, 'Consultation updated');
}

async function createPrescription(ctx) {
  const data = await service.createPrescription(ctx.params.visitId, ctx.state.user.tenantId, ctx.request.body, ctx.state.user.id);
  ctx.status = 201;
  ctx.body = success(data, 'Prescription created');
}

async function patientPrescriptions(ctx) {
  ctx.body = success(await service.listPrescriptionsByPatient(ctx.params.patientId, ctx.state.user.tenantId));
}

async function visitPrescriptions(ctx) {
  ctx.body = success(await service.listPrescriptionsByVisit(ctx.params.visitId, ctx.state.user.tenantId));
}

async function updatePrescription(ctx) {
  const data = await service.updatePrescription(ctx.params.prescriptionId, ctx.state.user.tenantId, ctx.request.body);
  ctx.body = success(data, 'Prescription updated');
}

async function currentMedications(ctx) {
  ctx.body = success(await service.listCurrentMedications(ctx.params.patientId, ctx.state.user.tenantId));
}

async function createLabOrder(ctx) {
  const data = await service.createLabOrder(ctx.params.visitId, ctx.state.user.tenantId, ctx.request.body, ctx.state.user.id);
  ctx.status = 201;
  ctx.body = success(data, 'Lab order created');
}

async function patientLabOrders(ctx) {
  ctx.body = success(await service.listLabOrdersByPatient(ctx.params.patientId, ctx.state.user.tenantId));
}

async function createLabReport(ctx) {
  const data = await service.createLabReport(ctx.params.labOrderId, ctx.state.user.tenantId, ctx.request.body, ctx.state.user.id);
  ctx.status = 201;
  ctx.body = success(data, 'Lab report created');
}

async function visitReports(ctx) {
  ctx.body = success(await service.listReportsByVisit(ctx.params.visitId, ctx.state.user.tenantId));
}

async function createProcedure(ctx) {
  const data = await service.createProcedure(ctx.params.visitId, ctx.state.user.tenantId, ctx.request.body, ctx.state.user.id);
  ctx.status = 201;
  ctx.body = success(data, 'Procedure created');
}

async function visitProcedures(ctx) {
  ctx.body = success(await service.listProceduresByVisit(ctx.params.visitId, ctx.state.user.tenantId));
}

async function patientProcedures(ctx) {
  ctx.body = success(await service.listProceduresByPatient(ctx.params.patientId, ctx.state.user.tenantId));
}

module.exports = {
  saveConsultation,
  getConsultation,
  updateConsultation,
  createPrescription,
  patientPrescriptions,
  visitPrescriptions,
  updatePrescription,
  currentMedications,
  createLabOrder,
  patientLabOrders,
  createLabReport,
  visitReports,
  createProcedure,
  visitProcedures,
  patientProcedures
};
