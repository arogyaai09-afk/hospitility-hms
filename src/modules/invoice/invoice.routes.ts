export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, createFromAppointment, index, pay, payments } = require('./invoice.controller');

const router = new Router({ prefix: '/invoices' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), create);
router.post('/appointments/:appointmentId', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), createFromAppointment);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), index);
router.patch('/:id/pay', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), pay);
router.get('/:id/payments', authenticate(), authorize(ACCESS_GROUPS.BILLING_MANAGERS), payments);

module.exports = router;
