"use strict";
const dashboardService = require('./dashboard.service');

async function index(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};

  // Determine dashboard by role - service enforces tenant isolation
  try {
    const data = await dashboardService.dashboard(user, query);
    data.period = dashboardService.parsePeriod(query);

    ctx.body = { success: true, data };
  } catch (err) {
    ctx.throw(500, err.message || 'Dashboard error');
  }
}

async function summary(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  await dashboardService.ensureAnalyticsAccess(user);
  const data = await dashboardService.summary(user, query);
  ctx.body = { success: true, data };
}

async function patients(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  await dashboardService.ensureAnalyticsAccess(user);
  const data = await dashboardService.patients(user, query);
  ctx.body = { success: true, data };
}

module.exports = {
  index,
  summary,
  patients
};
