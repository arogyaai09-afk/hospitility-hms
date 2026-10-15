export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update, changeStatus, remove } = require('./tenant.controller');

const router = new Router({ prefix: '/tenants' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), update);
router.patch('/:id/status', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), changeStatus);
router.delete('/:id', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), remove);

module.exports = router;
