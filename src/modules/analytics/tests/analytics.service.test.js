const assert = require('assert');
const analyticsService = require('../analytics.service');

(async () => {
  const overview = await analyticsService.overview({ role: 'admin' }, {});

  assert.ok(overview, 'overview data should exist');
  assert.ok(Array.isArray(overview.popularDoctors), 'popularDoctors should be an array');
  assert.ok(Array.isArray(overview.topDepartments), 'topDepartments should be an array');
  assert.ok(Array.isArray(overview.doctorsSchedule), 'doctorsSchedule should be an array');
  assert.ok(Array.isArray(overview.incomeByTreatment), 'incomeByTreatment should be an array');
  assert.ok(Array.isArray(overview.appointmentsTable), 'appointmentsTable should be an array');
  assert.ok(overview.filters && Array.isArray(overview.filters), 'filters should be defined');

  console.log('analytics service smoke test passed');
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
