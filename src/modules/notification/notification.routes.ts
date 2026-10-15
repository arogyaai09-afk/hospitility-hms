export {};

const Router = require('koa-router');
const { authenticate } = require('../../middlewares/auth.middleware');
const { index, markRead, markAllRead } = require('./notification.controller');

const router = new Router({ prefix: '/notifications' });
router.get('/', authenticate(), index);
router.patch('/read-all', authenticate(), markAllRead);
router.patch('/:id/read', authenticate(), markRead);

module.exports = router;
