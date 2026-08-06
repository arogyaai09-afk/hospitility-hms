"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Router = require('koa-router');
var _a = require('../../middlewares/auth.middleware'), authenticate = _a.authenticate, authorize = _a.authorize;
var ACCESS_GROUPS = require('../../constants/roles').ACCESS_GROUPS;
var create = require('./discharge.controller').create;
var router = new Router({ prefix: '/discharge' });
router.post('/', authenticate(), authorize(ACCESS_GROUPS.CLINICAL_OPERATIONS), create);
module.exports = router;
