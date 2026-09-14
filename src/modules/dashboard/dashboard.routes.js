"use strict";
const Router = require('koa-router');
const { authenticate, authorize } = require('../../middlewares/auth.middleware');
const dashboardController = require('./dashboard.controller');

const router = new Router({ prefix: '/dashboard' });

// Main unified endpoint - returns role-appropriate dashboard
router.get('/', authenticate(), authorize(), dashboardController.index);

// Specialized endpoints
router.get('/summary', authenticate(), authorize(), dashboardController.summary);
router.get('/patients', authenticate(), authorize(), dashboardController.patients);

module.exports = router;
