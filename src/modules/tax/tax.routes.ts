export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update } = require('./tax.controller');

const router = new Router({ prefix: '/taxes' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), update);

module.exports = router;
