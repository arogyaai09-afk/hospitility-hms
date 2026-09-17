"use strict";
const analyticsService = require('./analytics.service');

async function index(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};

  try {
    const data = await analyticsService.overview(user, query);
    ctx.body = { success: true, data };
  } catch (err) {
    ctx.throw(500, err.message || 'Analytics error');
  }
}

async function overview(ctx) {
  const user = ctx.state.user;
  const query = ctx.request.query || {};
  const data = await analyticsService.overview(user, query);
  ctx.body = { success: true, data };
}

module.exports = {
  index,
  overview
};
