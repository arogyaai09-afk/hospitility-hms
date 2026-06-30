const Doctor = require('./doctor.model');
const User = require('../auth/auth.model');

async function createDoctor(data) {
  if (data.userId) {
    const user = await User.findById(data.userId);
    if (!user) {
      const err = new Error('Doctor user not found');
      err.status = 404;
      throw err;
    }
    if (user.role !== 'doctor') {
      const err = new Error('userId must belong to a doctor user');
      err.status = 400;
      throw err;
    }
    if (String(user.tenantId) !== String(data.tenantId)) {
      const err = new Error('Doctor user must belong to the same tenant');
      err.status = 400;
      throw err;
    }
  }

  return Doctor.create(data);
}

async function listDoctors(tenantId) {
  return Doctor.find({ tenantId }).populate('userId', 'name email role tenantId').sort({ createdAt: -1 });
}

module.exports = { createDoctor, listDoctors };
