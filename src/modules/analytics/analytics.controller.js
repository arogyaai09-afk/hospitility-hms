"use strict";
const analyticsService = require('./analytics.service');
const dashboardService = require('../dashboard/dashboard.service');

async function index(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};

  try {
    await dashboardService.ensureAnalyticsAccess(user);
    const data = await analyticsService.overview(user, query);
    ctx.body = { success: true, data };
  } catch (err) {
    ctx.throw(err.status || 500, err.message || 'Analytics error');
  }
}

async function overview(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  await dashboardService.ensureAnalyticsAccess(user);
  const data = await analyticsService.overview(user, query);
  ctx.body = { success: true, data };
}

module.exports = {
  index,
  overview
};
