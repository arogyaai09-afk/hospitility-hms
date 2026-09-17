import { createStaff } from './api/staff';

test('staff API exposes createStaff helper for the staff add flow', async () => {
  expect(typeof createStaff).toBe('function');
});
