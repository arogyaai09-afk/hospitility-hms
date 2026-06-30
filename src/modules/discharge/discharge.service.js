const Discharge = require('./discharge.model');

async function createDischarge(payload) {
  return Discharge.create(payload);
}

module.exports = { createDischarge };
