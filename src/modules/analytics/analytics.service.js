"use strict";

const mongoose = require('mongoose');
const Patient = require('../patient/patient.model');
const Appointment = require('../appointment/appointment.model');
const Admission = require('../admission/admission.model');
const Doctor = require('../doctor/doctor.model');
const Department = require('../department/department.model');
const Invoice = require('../invoice/invoice.model');
const Payment = require('../invoice/payment.model');

function parsePeriod(query = {}) {
  const value = (query.period || 'weekly').toString().toLowerCase();
  return ['today', 'weekly', 'monthly', 'quarterly', 'yearly', 'custom'].includes(value) ? value : 'weekly';
}

function dateRange(query, period) {
  const to = query.dateTo ? new Date(query.dateTo) : new Date();
  let from;
  if (period === 'custom') {
    from = query.dateFrom ? new Date(query.dateFrom) : new Date(to.getTime() - 6 * 86400000);
    if (query.dateFrom && /^\d{4}-\d{2}-\d{2}$/.test(query.dateFrom)) from.setHours(0, 0, 0, 0);
    if (query.dateTo && /^\d{4}-\d{2}-\d{2}$/.test(query.dateTo)) to.setHours(23, 59, 59, 999);
  } else {
    from = new Date(to);
    if (period === 'today') from.setHours(0, 0, 0, 0);
    else if (period === 'monthly') from.setMonth(from.getMonth() - 1);
    else if (period === 'quarterly') from.setMonth(from.getMonth() - 3);
    else if (period === 'yearly') from.setFullYear(from.getFullYear() - 1);
    else from.setDate(from.getDate() - 6);
  }
  if (!Number.isFinite(from.getTime()) || !Number.isFinite(to.getTime()) || from > to) {
    const err = new Error('Invalid analytics date range');
    err.status = 400;
    throw err;
  }
  return { from, to };
}

function scopeFor(user, query) {
  const scope = {};
  if (user.role !== 'admin') {
    if (!user.tenantId) {
      const err = new Error('Tenant context is required');
      err.status = 403;
      throw err;
    }
    scope.tenantId = new mongoose.Types.ObjectId(user.tenantId);
  } else if (query.tenantId) {
    if (!mongoose.isValidObjectId(query.tenantId)) {
      const err = new Error('tenantId must be a valid ID');
      err.status = 400;
      throw err;
    }
    scope.tenantId = new mongoose.Types.ObjectId(query.tenantId);
  }
  return scope;
}

function buildFilters(period, departments, doctors, query) {
  return [
    {
      key: 'period',
      label: 'Period',
      value: period,
      options: ['Today', 'Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom']
    },
    {
      key: 'department',
      label: 'Department',
      value: query.department || 'All',
      options: ['All', ...departments]
    },
    {
      key: 'doctor',
      label: 'Doctor',
      value: query.doctor || 'All',
      options: ['All', ...doctors]
    },
    {
      key: 'status',
      label: 'Status',
      value: query.status || 'All',
      options: ['All', 'scheduled', 'checked_in', 'completed', 'cancelled']
    }
  ];
}

function percentChange(current, previous) {
  if (!previous) return current ? '+100%' : '0%';
  const delta = ((current - previous) / previous) * 100;
  return `${delta >= 0 ? '+' : ''}${delta.toFixed(1)}%`;
}

async function overview(user, query = {}) {
  const period = parsePeriod(query);
  const { from, to } = dateRange(query, period);
  const scope = scopeFor(user, query);
  const previousTo = new Date(from.getTime() - 1);
  const previousFrom = new Date(previousTo.getTime() - (to.getTime() - from.getTime()));
  const appointmentFilter = { ...scope, createdAt: { $gte: from, $lte: to } };
  if (query.status) appointmentFilter.status = query.status;

  if (query.doctor) {
    if (!mongoose.isValidObjectId(query.doctor)) {
      const doctor = await Doctor.findOne({ ...scope, name: query.doctor }).select('_id').lean();
      if (!doctor) {
        const err = new Error('Doctor filter does not match a doctor in this tenant');
        err.status = 400;
        throw err;
      }
      appointmentFilter.doctorId = doctor._id;
    } else {
      appointmentFilter.doctorId = new mongoose.Types.ObjectId(query.doctor);
    }
  }

  if (query.department) {
    const department = await Department.findOne({ ...scope, name: query.department }).select('_id').lean();
    if (!department) {
      const err = new Error('Department filter does not match a department in this tenant');
      err.status = 400;
      throw err;
    }
    const departmentDoctors = await Doctor.find({ ...scope, departmentId: department._id }).distinct('_id');
    appointmentFilter.doctorId = { $in: departmentDoctors };
  }

  const paymentFilter = { ...scope, status: 'success', paidAt: { $gte: from, $lte: to } };
  const admissionFilter = { ...scope, admittedAt: { $gte: from, $lte: to } };
  const previousAppointmentFilter = {
    ...appointmentFilter,
    createdAt: { $gte: previousFrom, $lte: previousTo }
  };
  const [patients, appointments, admissions, revenueRows, previousPatients, previousAppointments, previousAdmissions, previousRevenueRows, departments, doctorRecords] = await Promise.all([
    Patient.countDocuments({ ...scope, createdAt: { $gte: from, $lte: to } }),
    Appointment.countDocuments(appointmentFilter),
    Admission.countDocuments(admissionFilter),
    Payment.aggregate([{ $match: paymentFilter }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Patient.countDocuments({ ...scope, createdAt: { $gte: previousFrom, $lte: previousTo } }),
    Appointment.countDocuments(previousAppointmentFilter),
    Admission.countDocuments({ ...scope, admittedAt: { $gte: previousFrom, $lte: previousTo } }),
    Payment.aggregate([{ $match: { ...scope, status: 'success', paidAt: { $gte: previousFrom, $lte: previousTo } } }, { $group: { _id: null, total: { $sum: '$amount' } } }]),
    Department.find({ ...scope, isActive: true }).select('name').sort({ name: 1 }).lean(),
    Doctor.find(scope).select('name specialization status departmentId').populate('departmentId', 'name').lean()
  ]);

  const appointmentRows = await Appointment.find(appointmentFilter).sort({ scheduledAt: -1, createdAt: -1 }).limit(10)
    .populate('doctorId', 'name specialization').populate('patientId', 'name').lean();
  const topDoctors = await Appointment.aggregate([
    { $match: appointmentFilter },
    { $group: { _id: '$doctorId', bookings: { $sum: 1 } } },
    { $sort: { bookings: -1 } },
    { $limit: 5 }
  ]);
  const doctorIds = topDoctors.map(item => item._id).filter(Boolean);
  const topDoctorRecords = await Doctor.find({ _id: { $in: doctorIds } }).select('name specialization').lean();
  const topDoctorMap = new Map(topDoctorRecords.map(doctor => [String(doctor._id), doctor]));
  const popularDoctors = topDoctors.map(item => {
    const doctor = topDoctorMap.get(String(item._id));
    return doctor ? {
      initials: doctor.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      name: doctor.name,
      specialty: doctor.specialization,
      bookings: item.bookings
    } : null;
  }).filter(Boolean);

  const topDepartments = await Appointment.aggregate([
    { $match: appointmentFilter },
    { $lookup: { from: Doctor.collection.name, localField: 'doctorId', foreignField: '_id', as: 'doctor' } },
    { $unwind: '$doctor' },
    { $lookup: { from: Department.collection.name, localField: 'doctor.departmentId', foreignField: '_id', as: 'department' } },
    { $unwind: '$department' },
    { $group: { _id: '$department.name', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 5 },
    { $project: { _id: 0, name: '$_id', count: 1 } }
  ]);

  const scheduleCounts = new Map();
  for (const row of await Appointment.aggregate([
    { $match: { ...scope, createdAt: { $gte: from, $lte: to } } },
    { $group: { _id: { doctorId: '$doctorId', status: '$status' }, count: { $sum: 1 } } }
  ])) {
    const key = String(row._id.doctorId);
    const entry = scheduleCounts.get(key) || { appointments: 0, completed: 0 };
    entry.appointments += row.count;
    if (row._id.status === 'completed') entry.completed += row.count;
    scheduleCounts.set(key, entry);
  }
  const doctorsSchedule = doctorRecords.slice(0, 8).map(doctor => {
    const counts = scheduleCounts.get(String(doctor._id)) || { appointments: 0, completed: 0 };
    return {
      initials: doctor.name.split(/\s+/).map(part => part[0]).join('').slice(0, 2).toUpperCase(),
      name: doctor.name,
      specialty: doctor.specialization,
      appointments: counts.appointments,
      completedAppointments: counts.completed,
      status: doctor.status || 'active'
    };
  });

  const paidInvoices = await Invoice.find({
    ...scope,
    status: 'paid',
    paidAt: { $gte: from, $lte: to }
  }).select('lineItems').lean();
  const treatmentTotals = new Map();
  for (const invoice of paidInvoices) {
    for (const item of invoice.lineItems || []) {
      const entry = treatmentTotals.get(item.description) || { treatment: item.description, appointments: 0, value: 0 };
      entry.appointments += 1;
      entry.value += item.amount;
      treatmentTotals.set(item.description, entry);
    }
  }
  const incomeByTreatment = [...treatmentTotals.values()].sort((a, b) => b.value - a.value).slice(0, 5);
  const previousRevenue = previousRevenueRows[0] ? previousRevenueRows[0].total : 0;
  const revenue = revenueRows[0] ? revenueRows[0].total : 0;
  const appointmentTable = appointmentRows.map(appointment => ({
    doctor: appointment.doctorId ? appointment.doctorId.name : null,
    patient: appointment.patientId ? appointment.patientId.name : appointment.patientName,
    date: appointment.scheduledAt || appointment.createdAt,
    mode: appointment.appointmentType,
    status: appointment.status
  }));
  const segments = topDepartments.map((department, index) => ({
    label: department.name,
    value: department.count,
    color: ['#1f7ae0', '#24c789', '#7b5eea', '#ef9d38', '#e45b5b'][index]
  }));

  return {
    title: 'Business Intelligence Overview',
    period,
    filters: buildFilters(
      period,
      departments.map(department => department.name),
      doctorRecords.map(doctor => doctor.name),
      query
    ),
    kpis: [
      { label: 'New Patients', value: patients, delta: percentChange(patients, previousPatients), type: 'primary' },
      { label: 'Appointments', value: appointments, delta: percentChange(appointments, previousAppointments), type: 'info' },
      { label: 'Admissions', value: admissions, delta: percentChange(admissions, previousAdmissions), type: 'success' },
      { label: 'Revenue', value: revenue, delta: percentChange(revenue, previousRevenue), type: 'warning' }
    ],
    popularDoctors,
    topDepartments,
    donutChart: { total: topDepartments.reduce((sum, item) => sum + item.count, 0), segments },
    doctorsSchedule,
    incomeByTreatment,
    appointmentsTable: appointmentTable,
    reports: [
      { key: 'dashboard-overview', label: 'Dashboard Overview', type: 'summary' },
      { key: 'doctor-performance', label: 'Doctor Performance', type: 'trend' },
      { key: 'department-volume', label: 'Department Volume', type: 'chart' },
      { key: 'revenue-analysis', label: 'Revenue Analysis', type: 'financial' },
      { key: 'appointments-trend', label: 'Appointments Trend', type: 'timeline' },
      { key: 'patient-demographics', label: 'Patient Demographics', type: 'segmentation' }
    ],
    tabs: ['Overview', 'Doctors', 'Departments', 'Revenue', 'Appointments']
  };
}

module.exports = { overview, parsePeriod, buildFilters };
