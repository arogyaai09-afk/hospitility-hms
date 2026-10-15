export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update, addMessage } = require('./ticket.controller');

const router = new Router({ prefix: '/tickets' });
router.post('/', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.PLATFORM_ADMINS), update);
router.post('/:id/messages', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), addMessage);

module.exports = router;
