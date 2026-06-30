const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, available } = require('./bed.controller');

const router = new Router({ prefix: '/beds' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.OPERATIONS_MANAGERS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), index);
router.get('/available', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), available);

module.exports = router;
