export {};

const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create, index, show, update, remove } = require('./patient.controller');

const router = new Router({ prefix: '/patients' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), create);
router.get('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), index);
router.get('/:id', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), show);
router.patch('/:id', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), update);
router.delete('/:id', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), remove);

module.exports = router;
