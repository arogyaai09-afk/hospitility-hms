export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index } = require('./doctor.controller');

const router = new Router({ prefix: '/doctors' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), index);

module.exports = router;
