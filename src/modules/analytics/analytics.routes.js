"use strict";
const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const analyticsController = require('./analytics.controller');

const router = new Router({ prefix: '/analytics' });

router.get('/', authenticate(), authorize(), analyticsController.index);
router.get('/overview', authenticate(), authorize(), analyticsController.overview);

module.exports = router;
