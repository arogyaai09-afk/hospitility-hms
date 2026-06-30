const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const { ACCESS_GROUPS } = require('../../constants/roles');
const { create } = require('./discharge.controller');

const router = new Router({ prefix: '/discharge' });

router.post('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), create);

module.exports = router;
