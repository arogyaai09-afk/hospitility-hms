const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { admitFromOpd, admitIpd, index, discharge } = require('./admission.controller');

const router = new Router({ prefix: '/admissions' });

router.post('/from-opd', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), admitFromOpd);
router.post('/ipd', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), admitIpd);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), index);
router.patch('/:id/discharge', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), discharge);

module.exports = router;
