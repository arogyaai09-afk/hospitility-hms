"use strict";

function parsePeriod(query = {}) {
  const period = (query.period || 'weekly').toString().toLowerCase();
  const normalized = [
    'today',
    'weekly',
    'monthly',
    'quarterly',
    'yearly',
    'custom'
  ].includes(period) ? period : 'weekly';

  return normalized;
}

function buildFilters(period) {
  return [
    {
      key: 'period',
      label: 'Period',
      value: period,
      options: ['Weekly', 'Monthly', 'Quarterly', 'Yearly', 'Custom']
    },
    {
      key: 'department',
      label: 'Department',
      value: 'All',
      options: ['All', 'Cardiology', 'Radiology', 'Dental Surgery', 'Orthopaedics', 'General Medicine']
    },
    {
      key: 'doctor',
      label: 'Doctor',
      value: 'All',
      options: ['All', 'Dr. Alex Morgan', 'Dr. Emily Carter', 'Dr. David Lee', 'Dr. Sarah Johnson']
    },
    {
      key: 'status',
      label: 'Status',
      value: 'All',
      options: ['All', 'Scheduled', 'Completed', 'Checked In', 'Cancelled']
    }
  ];
}

async function overview(user, query = {}) {
  const period = parsePeriod(query);

  return {
    title: 'Business Intelligence Overview',
    period,
    filters: buildFilters(period),
    kpis: [
      { label: 'Total Patients', value: '638', delta: '+12.4%', type: 'primary' },
      { label: 'Appointments', value: '2,184', delta: '+8.7%', type: 'info' },
      { label: 'Admissions', value: '321', delta: '+5.1%', type: 'success' },
      { label: 'Revenue', value: '$98,740', delta: '+14.2%', type: 'warning' }
    ],
    popularDoctors: [
      { initials: 'AM', name: 'Dr. Alex Morgan', specialty: 'Cardiologist', bookings: 258 },
      { initials: 'EC', name: 'Dr. Emily Carter', specialty: 'Pediatrician', bookings: 125 },
      { initials: 'DL', name: 'Dr. David Lee', specialty: 'Gynecologist', bookings: 115 }
    ],
    topDepartments: [
      { name: 'Cardiology', count: 214, color: '#1f7ae0' },
      { name: 'Neurology', count: 150, color: '#24c789' },
      { name: 'Orthopaedics', count: 138, color: '#7b5eea' },
      { name: 'General Medicine', count: 136, color: '#ef9d38' }
    ],
    donutChart: {
      total: 638,
      segments: [
        { label: 'Cardiology', value: 214, color: '#1f7ae0' },
        { label: 'Neurology', value: 150, color: '#24c789' },
        { label: 'Orthopaedics', value: 138, color: '#7b5eea' },
        { label: 'General Medicine', value: 136, color: '#ef9d38' }
      ]
    },
    doctorsSchedule: [
      { initials: 'SJ', name: 'Dr. Sarah Johnson', specialty: 'Orthopedic Surgeon', available: 48, unavailable: 28, leave: 12, status: 'available' },
      { initials: 'EC', name: 'Dr. Emily Carter', specialty: 'Pediatrician', available: 22, unavailable: 10, leave: 4, status: 'available' },
      { initials: 'DL', name: 'Dr. David Lee', specialty: 'Gynecologist', available: 18, unavailable: 9, leave: 3, status: 'available' },
      { initials: 'MS', name: 'Dr. Michael Smith', specialty: 'Cardiologist', available: 20, unavailable: 12, leave: 5, status: 'available' }
    ],
    incomeByTreatment: [
      { treatment: 'Cardiology', appointments: 4, value: 5985 },
      { treatment: 'Radiology', appointments: 4, value: 5194 },
      { treatment: 'Dental Surgery', appointments: 1, value: 2716 },
      { treatment: 'Orthopaedics', appointments: 3, value: 4682 },
      { treatment: 'General Medicine', appointments: 9, value: 9450 }
    ],
    appointmentsTable: [
      { doctor: 'Dr. Sarah Johnson', patient: 'Alice Turner', date: '2026-09-17', time: '09:00 AM', mode: 'In Person', status: 'Confirmed' },
      { doctor: 'Dr. Emily Carter', patient: 'Lucas Reed', date: '2026-09-17', time: '10:30 AM', mode: 'Video', status: 'Checked In' },
      { doctor: 'Dr. David Lee', patient: 'Ava Martinez', date: '2026-09-17', time: '11:15 AM', mode: 'In Person', status: 'Completed' },
      { doctor: 'Dr. Michael Smith', patient: 'Noah Patel', date: '2026-09-17', time: '01:00 PM', mode: 'In Person', status: 'Scheduled' }
    ],
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

module.exports = {
  overview,
  parsePeriod,
  buildFilters
};
