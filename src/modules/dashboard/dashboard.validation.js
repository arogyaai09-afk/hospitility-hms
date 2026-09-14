"use strict";
const allowedPeriods = ['today','yesterday','this_week','this_month','last_month','this_year','custom'];

function validateDateRange(ctx, next) {
  const q = ctx.request.query || {};
  if (q.period && !allowedPeriods.includes(q.period.toLowerCase())) {
    ctx.throw(400, 'Invalid period value');
  }
  if (q.period === 'custom') {
    if (!q.dateFrom || !q.dateTo) ctx.throw(400, 'dateFrom and dateTo required for custom period');
    const from = new Date(q.dateFrom);
    const to = new Date(q.dateTo);
    if (isNaN(from.getTime()) || isNaN(to.getTime())) ctx.throw(400, 'Invalid dateFrom or dateTo');
    if (from > to) ctx.throw(400, 'dateFrom must be before dateTo');
  }
  return next();
}

module.exports = { validateDateRange };
