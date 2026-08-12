export {};

const Bed = require('./bed.model');
const { calculateSkip } = require('../../utils/pagination');

async function createBed(data) {
  return Bed.create(data);
}

async function listBeds(tenantId, page = 1, limit = 50) {
  const skip = calculateSkip(page, limit);
  const [beds, total] = await Promise.all([
    Bed.find({ tenantId })
      .select('bedNumber ward type status assignedAdmissionId createdAt')
      .lean()
      .sort({ bedNumber: 1 })
      .skip(skip)
      .limit(limit),
    Bed.countDocuments({ tenantId })
  ]);
  
  return {
    data: beds,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
}

async function getAvailableBeds(tenantId) {
  return Bed.find({ tenantId, status: 'available' })
    .select('bedNumber ward type status')
    .lean()
    .sort({ bedNumber: 1 });
}

async function assignBedByNumber(bedNumber, admissionId, tenantId) {
  const bed = await Bed.findOneAndUpdate(
    { bedNumber, tenantId, status: 'available' },
    { status: 'occupied', assignedAdmissionId: admissionId, updatedAt: new Date() },
    { new: true }
  ).lean();
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
    { status: 'available', assignedAdmissionId: null, updatedAt: new Date() },
    { new: true }
  ).lean();
}

async function assignBed(bedId, admissionId, tenantId) {
  const bed = await Bed.findOneAndUpdate(
    { _id: bedId, tenantId, status: 'available' },
    { status: 'occupied', assignedAdmissionId: admissionId, updatedAt: new Date() },
    { new: true }
  ).lean();
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
    { status: 'available', assignedAdmissionId: null, updatedAt: new Date() },
    { new: true }
  ).lean();
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
