export {};

const Router = require('koa-router');
const { register, login, refresh, profile } = require('./auth.controller');
const { authenticate } = require('../../middlewares/auth.middleware');

const router = new Router({ prefix: '/auth' });

router.post('/login', login);
router.post('/refresh', refresh);
router.post('/register', register);
router.get('/profile', authenticate(), profile);

module.exports = router; 
