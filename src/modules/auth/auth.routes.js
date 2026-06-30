const Router = require('koa-router');
const { register, login, refresh, profile } = require('./auth.controller');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');

const router = new Router({ prefix: '/auth' });

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/register', authenticate(), authorize(ACCESS_GROUPS.USER_MANAGERS), register);
router.get('/profile', authenticate(), profile);

module.exports = router;
