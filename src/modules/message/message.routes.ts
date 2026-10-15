export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, messages, send, markRead } = require('./message.controller');

const router = new Router({ prefix: '/messages' });
router.post('/conversations', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), create);
router.get('/conversations', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), index);
router.get('/conversations/:id/messages', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), messages);
router.post('/conversations/:id/messages', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), send);
router.patch('/:messageId/read', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), markRead);

module.exports = router;
