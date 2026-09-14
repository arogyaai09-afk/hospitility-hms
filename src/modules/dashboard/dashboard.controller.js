"use strict";
const dashboardService = require('./dashboard.service');

async function index(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};

  // Determine dashboard by role - service enforces tenant isolation
  try {
    let data = {};
    // route-level shortcuts - main endpoint returns role-appropriate summary
    data.summary = await dashboardService.summary(user, query);
    data.role = user.role;
    data.period = dashboardService.parsePeriod(query);

    ctx.body = { success: true, data };
  } catch (err) {
    ctx.throw(500, err.message || 'Dashboard error');
  }
}

async function summary(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  const data = await dashboardService.summary(user, query);
  ctx.body = { success: true, data };
}

async function patients(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  const data = await dashboardService.patients(user, query);
  ctx.body = { success: true, data };
}

module.exports = {
  index,
  summary,
  patients
};
