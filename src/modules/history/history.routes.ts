export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { patientSummary, visitHistory } = require('./history.controller');

const router = new Router();
const clinicalAccess = [authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS)];

router.get('/patients/:patientId/summary', ...clinicalAccess, patientSummary);
router.get('/visits/:visitId/history', ...clinicalAccess, visitHistory);

module.exports = router;
