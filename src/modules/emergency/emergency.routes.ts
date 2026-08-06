export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, admit } = require('./emergency.controller');

const router = new Router({ prefix: '/emergencies' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), index);
router.post('/:id/admit', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), admit);

module.exports = router;
