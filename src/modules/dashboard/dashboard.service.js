"use strict";
const mongoose = require('mongoose');
const Patient = require('../patient/patient.model');
const Appointment = require('../appointment/appointment.model');
const Admission = require('../admission/admission.model');
const Bed = require('../bed/bed.model');
const Payment = require('../invoice/payment.model') || require('../invoice/payment.model');

function parsePeriod(query) {
  const { period, dateFrom, dateTo } = query || {};
  const now = new Date();
  let from, to;

  switch ((period || '').toLowerCase()) {
    case 'today':
      from = new Date(now.setHours(0, 0, 0, 0));
      to = new Date(now.setHours(23, 59, 59, 999));
      break;
    case 'yesterday': {
      const d = new Date();
      d.setDate(d.getDate() - 1);
      from = new Date(d.setHours(0, 0, 0, 0));
      to = new Date(d.setHours(23, 59, 59, 999));
      break;
    }
    case 'this_week': {
      const d = new Date();
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1);
      from = new Date(d.setDate(diff));
      from.setHours(0, 0, 0, 0);
      to = new Date();
      to.setHours(23, 59, 59, 999);
      break;
    }
    case 'this_month':
      from = new Date(now.getFullYear(), now.getMonth(), 1);
      to = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      break;
    case 'last_month': {
      const year = now.getMonth() === 0 ? now.getFullYear() - 1 : now.getFullYear();
      const month = now.getMonth() === 0 ? 11 : now.getMonth() - 1;
      from = new Date(year, month, 1);
      to = new Date(year, month + 1, 0, 23, 59, 59, 999);
      break;
    }
    case 'this_year':
      from = new Date(now.getFullYear(), 0, 1);
      to = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    case 'custom':
      if (dateFrom) from = new Date(dateFrom);
      if (dateTo) to = new Date(dateTo);
      break;
    default:
      // default to 30 days window
      from = new Date();
      from.setDate(from.getDate() - 30);
      to = new Date();
  }

  return { from, to };
}

function baseMatchForUser(user, extra = {}) {
  const match = Object.assign({}, extra);
  if (user && user.role !== 'admin') {
    // tenant-aware
    if (user.tenantId) match.tenantId = mongoose.Types.ObjectId(user.tenantId);
    // doctors/staff/patients are filtered in controller/service as needed
  }
  return match;
}

async function summary(user, query) {
  const { from, to } = parsePeriod(query);
  const tenantMatch = baseMatchForUser(user);

  const patientMatch = Object.assign({}, tenantMatch);
  const appointmentMatch = Object.assign({}, tenantMatch);
  const admissionMatch = Object.assign({}, tenantMatch);

  if (from && to) {
    patientMatch.createdAt = { $gte: from, $lte: to };
    appointmentMatch.createdAt = { $gte: from, $lte: to };
    admissionMatch.createdAt = { $gte: from, $lte: to };
  }

  // Parallel counts for performance
  const [totalPatients, newPatients, todayAppointments, completedAppointments, pendingAppointments] = await Promise.all([
    Patient.countDocuments(baseMatchForUser(user)),
    Patient.countDocuments(patientMatch),
    Appointment.countDocuments(appointmentMatch),
    Appointment.countDocuments(Object.assign({}, appointmentMatch, { status: 'completed' })),
    Appointment.countDocuments(Object.assign({}, appointmentMatch, { status: 'scheduled' }))
  ]);

  // Beds/Admissions may not exist in all tenants - safe defaults
  let activeAdmissions = 0;
  try {
    activeAdmissions = await Admission.countDocuments(Object.assign({}, tenantMatch, { status: 'active' }));
  } catch (e) { }

  let occupiedBeds = 0;
  let availableBeds = 0;
  try {
    occupiedBeds = await Bed.countDocuments(Object.assign({}, tenantMatch, { status: 'occupied' }));
    availableBeds = await Bed.countDocuments(Object.assign({}, tenantMatch, { status: 'available' }));
  } catch (e) { }

  // Revenue using Payment model (successful payments only)
  let todayRevenue = 0;
  let monthlyRevenue = 0;
  try {
    const payments = Payment && Payment.aggregate ? Payment.aggregate([
      { $match: Object.assign({}, tenantMatch, { status: 'successful', paidAt: { $gte: from, $lte: to } }) },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]) : [];
    const res = (await payments) || [];
    todayRevenue = res[0] ? res[0].total : 0;
    monthlyRevenue = todayRevenue;
  } catch (e) { }

  return {
    totalPatients,
    newPatients,
    todayAppointments,
    completedAppointments,
    pendingAppointments,
    activeAdmissions,
    occupiedBeds,
    availableBeds,
    todayRevenue,
    monthlyRevenue,
  };
}

async function patients(user, query) {
  const { from, to } = parsePeriod(query);
  const tenantMatch = baseMatchForUser(user);

  const base = Object.assign({}, tenantMatch);
  if (from && to) base.createdAt = { $gte: from, $lte: to };

  const total = await Patient.countDocuments(base);
  const byGender = await Patient.aggregate([
    { $match: base },
    { $group: { _id: '$gender', count: { $sum: 1 } } }
  ]);

  // Age groups example - requires dateOfBirth
  const now = new Date();
  const ageBuckets = [
    { name: '0-12', min: 0, max: 12 },
    { name: '13-18', min: 13, max: 18 },
    { name: '19-30', min: 19, max: 30 },
    { name: '31-45', min: 31, max: 45 },
    { name: '46-60', min: 46, max: 60 },
    { name: '61+', min: 61, max: 200 }
  ];

  // Build age group aggregation
  const ageAgg = ageBuckets.map(b => ({
    label: b.name,
    minDOB: new Date(now.getFullYear() - b.max - 1, now.getMonth(), now.getDate() + 1),
    maxDOB: new Date(now.getFullYear() - b.min, now.getMonth(), now.getDate())
  }));

  const agePromises = ageAgg.map(async (b) => {
    const q = Object.assign({}, base, { dateOfBirth: { $gte: b.minDOB, $lte: b.maxDOB } });
    const count = await Patient.countDocuments(q);
    return { label: b.label, count };
  });

  const ageGroups = await Promise.all(agePromises);

  return { total, byGender, ageGroups };
}

module.exports = {
  summary,
  patients,
  parsePeriod,
  appointments: async function appointments(user, query) {
    const { from, to } = parsePeriod(query);
    const tenantMatch = baseMatchForUser(user);
    const base = Object.assign({}, tenantMatch);
    if (from && to) base.createdAt = { $gte: from, $lte: to };

    // status counts
    const statuses = await Appointment.aggregate([
      { $match: base },
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // appointments by day (last N days depending on period)
    const byDay = await Appointment.aggregate([
      { $match: base },
      { $project: { day: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } } } },
      { $group: { _id: '$day', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // appointments by doctor
    const byDoctor = await Appointment.aggregate([
      { $match: base },
      { $group: { _id: '$doctorId', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 20 }
    ]);

    // peak hours
    const peak = await Appointment.aggregate([
      { $match: base },
      { $project: { hour: { $hour: '$createdAt' } } },
      { $group: { _id: '$hour', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 }
    ]);

    // completion/cancellation/no-show rates
    const total = await Appointment.countDocuments(base);
    const completed = await Appointment.countDocuments(Object.assign({}, base, { status: 'completed' }));
    const cancelled = await Appointment.countDocuments(Object.assign({}, base, { status: 'cancelled' }));
    const noShow = await Appointment.countDocuments(Object.assign({}, base, { status: 'no-show' }));

    const completionRate = total ? (completed / total) * 100 : 0;
    const cancellationRate = total ? (cancelled / total) * 100 : 0;
    const noShowRate = total ? (noShow / total) * 100 : 0;

    return { statuses, byDay, byDoctor, peak, total, completed, cancelled, noShow, completionRate, cancellationRate, noShowRate };
  },
  revenue: async function revenue(user, query) {
    const { from, to } = parsePeriod(query);
    const tenantMatch = baseMatchForUser(user);
    const base = Object.assign({}, tenantMatch);
    if (from && to) base.paidAt = { $gte: from, $lte: to };

    // sum successful payments
    let totalCollected = 0;
    let cashAmount = 0;
    let onlineAmount = 0;
    try {
      const agg = await Payment.aggregate([
        { $match: Object.assign({}, base, { status: 'successful' }) },
        { $group: { _id: '$method', total: { $sum: '$amount' } } }
      ]);
      totalCollected = agg.reduce((s, r) => s + (r.total || 0), 0);
      agg.forEach(r => {
        if ((r._id || '').toLowerCase() === 'cash') cashAmount += r.total || 0;
        else onlineAmount += r.total || 0;
      });
    } catch (e) {
      // swallow and return zeros
    }

    const failed = await Payment.countDocuments(Object.assign({}, base, { status: 'failed' }));
    const refundsAgg = await Payment.aggregate([
      { $match: Object.assign({}, base, { type: 'refund' }) },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    const refundAmount = (refundsAgg[0] && refundsAgg[0].total) || 0;

    return { totalCollected, cashAmount, onlineAmount, failed, refundAmount };
  }
};
