export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update, remove } = require('./staff.controller');

const router = new Router({ prefix: '/staff' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), update);
router.delete('/:id', authenticate(), authorize(ACCESS_GROUPS.TENANT_ADMINS), remove);

module.exports = router;
