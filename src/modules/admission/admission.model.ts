export {};

const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
  patientName: { type: String, required: true },
  admissionType: { type: String, required: true, enum: ['IPD', 'OPD', 'Emergency'], default: 'IPD' },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  bedNumber: { type: String, required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor' },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  status: { type: String, enum: ['admitted', 'discharged'], default: 'admitted' },
  admittedAt: { type: Date, default: Date.now },
  dischargedAt: { type: Date }
});

module.exports = mongoose.model('Admission', admissionSchema);
