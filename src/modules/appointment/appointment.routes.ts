export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update, remove, checkIn } = require('./appointment.controller');

const router = new Router({ prefix: '/appointments' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), update);
router.delete('/:id', authenticate(), authorize(ACCESS_GROUPS.APPOINTMENT_MANAGERS), remove);
router.post('/:id/check-in', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), checkIn);

module.exports = router;
