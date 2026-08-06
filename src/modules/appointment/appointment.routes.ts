export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index } = require('./appointment.controller');

const router = new Router({ prefix: '/appointments' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), index);

module.exports = router;
