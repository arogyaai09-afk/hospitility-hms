export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show } = require('./tenant.controller');

const router = new Router({ prefix: '/tenants' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), show);

module.exports = router;
