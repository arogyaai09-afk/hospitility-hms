export {};

const { ROLES, ACCESS_GROUPS } = require('./roles');

const SIDE_MENU = Object.freeze([
  { key: 'dashboard', label: 'Dashboard', path: '/dashboard', roles: Object.values(ROLES) },
  { key: 'tenants', label: 'Tenants', path: '/tenants', roles: ACCESS_GROUPS.TENANT_ADMINS },
  { key: 'users', label: 'Users', path: '/staff', roles: ACCESS_GROUPS.USER_MANAGERS },
  { key: 'doctors', label: 'Doctors', path: '/doctors', roles: ACCESS_GROUPS.CLINICAL_OPERATIONS },
  { key: 'patients', label: 'Patients', path: '/patients', roles: ACCESS_GROUPS.CLINICAL_OPERATIONS },
  { key: 'appointments', label: 'Appointments', path: '/appointments', roles: ACCESS_GROUPS.APPOINTMENT_MANAGERS },
  { key: 'admissions', label: 'Admissions', path: '/admissions', roles: ACCESS_GROUPS.CLINICAL_OPERATIONS },
  { key: 'discharges', label: 'Discharges', path: '/discharges', roles: ACCESS_GROUPS.CLINICAL_OPERATIONS },
  { key: 'beds', label: 'Beds', path: '/beds', roles: ACCESS_GROUPS.OPERATIONS_MANAGERS },
  { key: 'emergency', label: 'Emergency', path: '/emergency', roles: ACCESS_GROUPS.CLINICAL_OPERATIONS },
  { key: 'invoices', label: 'Invoices', path: '/invoices', roles: ACCESS_GROUPS.BILLING_MANAGERS },
  { key: 'taxes', label: 'Taxes', path: '/taxes', roles: ACCESS_GROUPS.TENANT_ADMINS }
]);

function getSideMenu(role) {
  return SIDE_MENU
    .filter((item) => item.roles.includes(role))
    .map(({ key, label, path }) => ({ key, label, path }));
}

module.exports = { SIDE_MENU, getSideMenu };