"use strict";
const mongoose = require('mongoose');
const { ROLES } = require('../../constants/roles');
const Patient = require('../patient/patient.model');
const Appointment = require('../appointment/appointment.model');
const Admission = require('../admission/admission.model');
const Bed = require('../bed/bed.model');
const Doctor = require('../doctor/doctor.model');
const Staff = require('../staff/staff.model');
const Tenant = require('../tenant/tenant.model');
const Emergency = require('../emergency/emergency.model');
const Invoice = require('../invoice/invoice.model');
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
    if (user.tenantId) match.tenantId = new mongoose.Types.ObjectId(user.tenantId);
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
    activeAdmissions = await Admission.countDocuments(Object.assign({}, tenantMatch, { status: 'admitted' }));
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
      { $match: Object.assign({}, tenantMatch, { status: 'success', paidAt: { $gte: from, $lte: to } }) },
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

function resolveDashboardType(user, staffProfile) {
  if (user.role === ROLES.STAFF && staffProfile && staffProfile.role) {
    const staffRole = staffProfile.role.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
    return `staff_${staffRole}`;
  }
  return user.role;
}

async function getDoctorProfile(user) {
  if (!user || user.role !== ROLES.DOCTOR) return null;
  return Doctor.findOne({ userId: user.id || user._id, tenantId: user.tenantId }).lean();
}

async function getPatientProfile(user) {
  if (!user || user.role !== ROLES.PATIENT) return null;
  return Patient.findOne({ userId: user.id || user._id, tenantId: user.tenantId }).lean();
}

async function getStaffProfile(user) {
  if (!user || user.role !== ROLES.STAFF || !user.tenantId) return null;
  return Staff.findOne({ email: user.email, tenantId: user.tenantId, isDeleted: { $ne: true } }).lean();
}

async function roleMetrics(user, query, profile = {}) {
  const { from, to } = parsePeriod(query);
  const tenantMatch = baseMatchForUser(user);
  const createdAtRange = from && to ? { createdAt: { $gte: from, $lte: to } } : {};
  const scheduledRange = from && to ? { scheduledAt: { $gte: from, $lte: to } } : {};

  if (user.role === ROLES.ADMIN) {
    const [tenants, doctors, staff, emergencyCases, pendingInvoices] = await Promise.all([
      Tenant.countDocuments({}),
      Doctor.countDocuments({}),
      Staff.countDocuments({ isDeleted: { $ne: true } }),
      Emergency.countDocuments(Object.assign({}, createdAtRange, { status: { $in: ['pending', 'under-treatment'] } })),
      Invoice.countDocuments({ status: { $in: ['pending', 'partially_paid', 'failed'] } })
    ]);

    return { tenants, doctors, staff, emergencyCases, pendingInvoices };
  }

  if (user.role === ROLES.TENANT) {
    const [doctors, staff, emergencyCases, pendingInvoices] = await Promise.all([
      Doctor.countDocuments(tenantMatch),
      Staff.countDocuments(Object.assign({}, tenantMatch, { isDeleted: { $ne: true } })),
      Emergency.countDocuments(Object.assign({}, tenantMatch, createdAtRange, { status: { $in: ['pending', 'under-treatment'] } })),
      Invoice.countDocuments(Object.assign({}, tenantMatch, { status: { $in: ['pending', 'partially_paid', 'failed'] } }))
    ]);

    return { doctors, staff, emergencyCases, pendingInvoices };
  }

  if (user.role === ROLES.DOCTOR) {
    const doctorId = profile.doctor && profile.doctor._id;
    if (!doctorId) return { todayAssignedAppointments: 0, admittedPatients: 0, emergencyCases: 0 };

    const doctorMatch = Object.assign({}, tenantMatch, { doctorId });
    const [todayAssignedAppointments, completedAppointments, admittedPatients, emergencyCases] = await Promise.all([
      Appointment.countDocuments(Object.assign({}, doctorMatch, scheduledRange)),
      Appointment.countDocuments(Object.assign({}, doctorMatch, createdAtRange, { status: 'completed' })),
      Admission.countDocuments(Object.assign({}, doctorMatch, { status: 'admitted' })),
      Emergency.countDocuments(Object.assign({}, tenantMatch, createdAtRange, { assignedDoctor: doctorId, status: { $in: ['pending', 'under-treatment'] } }))
    ]);

    return { todayAssignedAppointments, completedAppointments, admittedPatients, emergencyCases };
  }

  if (user.role === ROLES.STAFF) {
    const [checkIns, pendingInvoices, openAdmissions, emergencyQueue] = await Promise.all([
      Appointment.countDocuments(Object.assign({}, tenantMatch, scheduledRange, { status: { $in: ['scheduled', 'checked_in'] } })),
      Invoice.countDocuments(Object.assign({}, tenantMatch, { status: { $in: ['pending', 'partially_paid', 'failed'] } })),
      Admission.countDocuments(Object.assign({}, tenantMatch, { status: 'admitted' })),
      Emergency.countDocuments(Object.assign({}, tenantMatch, createdAtRange, { status: { $in: ['pending', 'under-treatment'] } }))
    ]);

    return { checkIns, pendingInvoices, openAdmissions, emergencyQueue };
  }

  if (user.role === ROLES.PATIENT) {
    const patientId = profile.patient && profile.patient._id;
    if (!patientId) return { appointments: 0, activeAdmissions: 0, pendingInvoices: 0 };

    const patientMatch = Object.assign({}, tenantMatch, { patientId });
    const [appointments, activeAdmissions, pendingInvoices] = await Promise.all([
      Appointment.countDocuments(Object.assign({}, patientMatch, createdAtRange)),
      Admission.countDocuments(Object.assign({}, patientMatch, { status: 'admitted' })),
      Invoice.countDocuments(Object.assign({}, patientMatch, { status: { $in: ['pending', 'partially_paid', 'failed'] } }))
    ]);

    return { appointments, activeAdmissions, pendingInvoices };
  }

  return {};
}

function widgetsForRole(user, staffProfile) {
  if (user.role === ROLES.ADMIN) {
    return ['platform-overview', 'tenant-growth', 'patients', 'appointments', 'admissions', 'beds', 'revenue', 'emergency'];
  }
  if (user.role === ROLES.TENANT) {
    return ['hospital-overview', 'patients', 'doctors', 'staff', 'appointments', 'admissions', 'beds', 'revenue', 'emergency'];
  }
  if (user.role === ROLES.DOCTOR) {
    return ['doctor-schedule', 'assigned-patients', 'consultations', 'admitted-patients', 'emergency'];
  }
  if (user.role === ROLES.STAFF) {
    const staffRole = (staffProfile && staffProfile.role || '').toLowerCase();
    if (staffRole === 'billing') return ['billing-summary', 'pending-invoices', 'collections', 'failed-payments'];
    if (staffRole === 'nurse') return ['assigned-wards', 'admitted-patients', 'beds', 'discharge-assist'];
    if (staffRole === 'ward manager') return ['bed-occupancy', 'admissions', 'room-transfer', 'discharge-release'];
    return ['front-desk', 'patient-registration', 'appointments', 'check-ins', 'emergency-intake'];
  }
  if (user.role === ROLES.PATIENT) {
    return ['my-appointments', 'my-admissions', 'my-invoices', 'my-history'];
  }
  return ['summary'];
}

function quickActionsForRole(user, staffProfile) {
  if (user.role === ROLES.ADMIN) {
    return ['Create Tenant', 'Manage Users', 'View Reports'];
  }
  if (user.role === ROLES.TENANT) {
    return ['Add Doctor', 'Add Staff', 'View Reports', 'Manage Beds'];
  }
  if (user.role === ROLES.DOCTOR) {
    return ['Open Appointment Queue', 'View Patient History', 'Create Visit Note'];
  }
  if (user.role === ROLES.STAFF) {
    const staffRole = (staffProfile && staffProfile.role || '').toLowerCase();
    if (staffRole === 'billing') return ['Create Invoice', 'Collect Payment', 'View Pending Bills'];
    if (staffRole === 'nurse') return ['Open Ward List', 'Update Patient Status', 'Assist Discharge'];
    if (staffRole === 'ward manager') return ['Assign Bed', 'Transfer Room', 'Release Bed'];
    return ['Add Patient', 'Book Appointment', 'Check In Patient', 'Emergency Intake'];
  }
  if (user.role === ROLES.PATIENT) {
    return ['Book Appointment', 'View Invoices', 'View Visit History'];
  }
  return [];
}

async function dashboard(user, query) {
  const [baseSummary, doctor, patient, staff] = await Promise.all([
    summary(user, query),
    getDoctorProfile(user),
    getPatientProfile(user),
    getStaffProfile(user)
  ]);
  const profile = { doctor, patient, staff };
  const metrics = await roleMetrics(user, query, profile);

  return {
    role: user.role,
    dashboardType: resolveDashboardType(user, staff),
    staffRole: staff ? staff.role : undefined,
    summary: Object.assign({}, baseSummary, metrics),
    widgets: widgetsForRole(user, staff),
    quickActions: quickActionsForRole(user, staff)
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
  dashboard,
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
        { $match: Object.assign({}, base, { status: 'success' }) },
        { $group: { _id: '$paymentMode', total: { $sum: '$amount' } } }
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
