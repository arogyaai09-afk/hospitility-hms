const Bed = require('./bed.model');

async function createBed(data) {
  return Bed.create(data);
}

async function listBeds(tenantId) {
  return Bed.find({ tenantId }).sort({ bedNumber: 1 });
}

async function getAvailableBeds(tenantId) {
  return Bed.find({ tenantId, status: 'available' }).sort({ bedNumber: 1 });
}

async function assignBedByNumber(bedNumber, admissionId, tenantId) {
  const bed = await Bed.findOneAndUpdate(
    { bedNumber, tenantId, status: 'available' },
    { status: 'occupied', assignedAdmissionId: admissionId },
    { new: true }
  );
  if (!bed) {
    const err = new Error('Bed unavailable or not found');
    err.status = 404;
    throw err;
  }
  return bed;
}

async function releaseBedByNumber(bedNumber, tenantId) {
  return Bed.findOneAndUpdate(
    { bedNumber, tenantId, status: 'occupied' },
    { status: 'available', assignedAdmissionId: null },
    { new: true }
  );
}

async function assignBed(bedId, admissionId, tenantId) {
  const bed = await Bed.findOneAndUpdate(
    { _id: bedId, tenantId, status: 'available' },
    { status: 'occupied', assignedAdmissionId: admissionId },
    { new: true }
  );
  if (!bed) {
    const err = new Error('Bed unavailable or not found');
    err.status = 404;
    throw err;
  }
  return bed;
}

async function releaseBed(bedId, tenantId) {
  return Bed.findOneAndUpdate(
    { _id: bedId, tenantId, status: 'occupied' },
    { status: 'available', assignedAdmissionId: null },
    { new: true }
  );
}

module.exports = {
  createBed,
  listBeds,
  getAvailableBeds,
  assignBedByNumber,
  releaseBedByNumber,
  assignBed,
  releaseBed
};
