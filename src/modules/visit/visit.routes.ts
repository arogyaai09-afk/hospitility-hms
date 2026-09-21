export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, listByPatient, show, updateStatus } = require('./visit.controller');

const router = new Router();
const clinicalAccess = [authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS)];

router.post('/patients/:patientId/visits', ...clinicalAccess, create);
router.get('/patients/:patientId/visits', ...clinicalAccess, listByPatient);
router.get('/visits/:visitId', ...clinicalAccess, show);
router.patch('/visits/:visitId/status', ...clinicalAccess, updateStatus);

module.exports = router;
