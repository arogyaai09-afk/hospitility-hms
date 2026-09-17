export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { index } = require('./department.controller');

const router = new Router({ prefix: '/departments' });

router.get('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), index);

module.exports = router;