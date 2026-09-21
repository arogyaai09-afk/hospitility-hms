export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const controller = require('./clinical.controller');

const router = new Router();
const clinicalAccess = [authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS)];

router.post('/visits/:visitId/consultation', ...clinicalAccess, controller.saveConsultation);
router.get('/visits/:visitId/consultation', ...clinicalAccess, controller.getConsultation);
router.patch('/consultations/:consultationId', ...clinicalAccess, controller.updateConsultation);
router.post('/visits/:visitId/prescriptions', ...clinicalAccess, controller.createPrescription);
router.get('/patients/:patientId/prescriptions', ...clinicalAccess, controller.patientPrescriptions);
router.get('/patients/:patientId/medications/current', ...clinicalAccess, controller.currentMedications);
router.get('/visits/:visitId/prescriptions', ...clinicalAccess, controller.visitPrescriptions);
router.patch('/prescriptions/:prescriptionId', ...clinicalAccess, controller.updatePrescription);
router.post('/visits/:visitId/lab-orders', ...clinicalAccess, controller.createLabOrder);
router.get('/patients/:patientId/lab-orders', ...clinicalAccess, controller.patientLabOrders);
router.post('/lab-orders/:labOrderId/report', ...clinicalAccess, controller.createLabReport);
router.get('/visits/:visitId/reports', ...clinicalAccess, controller.visitReports);
router.post('/visits/:visitId/procedures', ...clinicalAccess, controller.createProcedure);
router.get('/visits/:visitId/procedures', ...clinicalAccess, controller.visitProcedures);
router.get('/patients/:patientId/procedures', ...clinicalAccess, controller.patientProcedures);

module.exports = router;
