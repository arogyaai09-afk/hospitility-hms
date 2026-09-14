'use strict';

const { ROLES } = require('../../src/constants/roles');

module.exports = {
  roles: [ROLES.ADMIN, ROLES.TENANT, ROLES.DOCTOR, ROLES.STAFF, ROLES.PATIENT],
  ROLES
};
