'use strict';

const Appointment = require('../../src/modules/appointment/appointment.model');
const Admission = require('../../src/modules/admission/admission.model');
const Bed = require('../../src/modules/bed/bed.model');
const Emergency = require('../../src/modules/emergency/emergency.model');
const Discharge = require('../../src/modules/discharge/discharge.model');
const Invoice = require('../../src/modules/invoice/invoice.model');
const Payment = require('../../src/modules/invoice/payment.model');
const Tax = require('../../src/modules/tax/tax.model');

async function createBusinessData(tenants, profiles, usersByTenant) {
  const summary = { appointments: 0, admissions: 0, beds: 0, emergencies: 0, discharges: 0, invoices: 0, payments: 0, taxes: 0 };

  for (const [tenantIndex, tenant] of tenants.entries()) {
    const tenantKey = String(tenant._id);
    const doctors = profiles.doctorsByTenant.get(tenantKey);
    const patients = profiles.patientsByTenant.get(tenantKey);
    const users = usersByTenant.get(tenantKey);
    const slug = tenant.metadata.seedKey.replace('hms-demo-', '');
    const beds = await Bed.create([
      { bedNumber: `DEMO-${slug.toUpperCase()}-G01`, ward: 'General Ward', type: 'general', status: 'available', tenantId: tenant._id },
      { bedNumber: `DEMO-${slug.toUpperCase()}-G02`, ward: 'General Ward', type: 'general', status: 'occupied', tenantId: tenant._id },
      { bedNumber: `DEMO-${slug.toUpperCase()}-SP01`, ward: 'Sunrise Ward', type: 'semi-private', status: 'available', tenantId: tenant._id },
      { bedNumber: `DEMO-${slug.toUpperCase()}-PR01`, ward: 'Private Ward', type: 'private', status: 'maintenance', tenantId: tenant._id },
      { bedNumber: `DEMO-${slug.toUpperCase()}-ICU01`, ward: 'ICU', type: 'icu', status: 'available', tenantId: tenant._id }
    ]);
    summary.beds += beds.length;

    const appointments = await Appointment.create(patients.slice(0, 6).map((patient, index) => ({
      patientId: patient._id,
      patientName: patient.name,
      patientType: index % 4 === 0 ? 'NRI' : 'local',
      appointmentType: index === 4 ? 'Emergency' : index === 5 ? 'IPD' : 'OPD',
      visitReason: ['Routine check-up', 'Chest discomfort', 'Child wellness', 'Follow-up consultation', 'Urgent evaluation', 'Pre-admission review'][index],
      doctorId: doctors[index % doctors.length]._id,
      status: ['scheduled', 'completed', 'cancelled', 'completed', 'scheduled', 'scheduled'][index],
      tenantId: tenant._id,
      createdBy: users.staff1._id,
      createdAt: new Date(Date.now() - (index + 1) * 86400000)
    })));
    summary.appointments += appointments.length;

    const admissions = await Admission.create([
      { patientName: patients[1].name, admissionType: 'IPD', appointmentId: appointments[5]._id, bedNumber: beds[1].bedNumber, doctorId: doctors[0]._id, tenantId: tenant._id, status: 'admitted', admittedAt: new Date(Date.now() - 2 * 86400000) },
      { patientName: patients[2].name, admissionType: 'Emergency', appointmentId: appointments[4]._id, bedNumber: beds[2].bedNumber, doctorId: doctors[1]._id, tenantId: tenant._id, status: 'discharged', admittedAt: new Date(Date.now() - 8 * 86400000), dischargedAt: new Date(Date.now() - 3 * 86400000) }
    ]);
    await Bed.updateOne({ _id: beds[1]._id }, { $set: { assignedAdmissionId: admissions[0]._id } });
    summary.admissions += admissions.length;

    const emergencies = await Emergency.create([
      { patientName: patients[3].name, patientId: patients[3]._id, emergencyType: 'cardiac', severity: 'critical', assignedDoctor: doctors[0]._id, status: 'under-treatment', tenantId: tenant._id },
      { patientName: patients[4].name, patientId: patients[4]._id, emergencyType: 'accident', severity: 'medium', assignedDoctor: doctors[1]._id, status: 'stabilized', tenantId: tenant._id },
      { patientName: patients[5].name, patientId: patients[5]._id, emergencyType: 'other', severity: 'low', assignedDoctor: doctors[0]._id, status: 'pending', tenantId: tenant._id }
    ]);
    summary.emergencies += emergencies.length;

    const tax = await Tax.create([
      { name: 'Goods and Services Tax', code: `GST${tenantIndex + 1}`, rate: 18, type: 'percentage', components: [{ name: 'Central GST', code: `CGST${tenantIndex + 1}`, rate: 9 }], isDefault: true, tenantId: tenant._id, createdBy: users.tenant._id },
      { name: 'Reduced Medical Tax', code: `MED${tenantIndex + 1}`, rate: 5, type: 'percentage', isDefault: false, tenantId: tenant._id, createdBy: users.tenant._id }
    ]);
    summary.taxes += tax.length;

    await Discharge.create({
      admissionId: admissions[1]._id,
      summary: 'Patient stabilized after observation and treatment.',
      recommendations: 'Continue prescribed medication and return for follow-up in seven days.',
      dischargeDate: admissions[1].dischargedAt,
      tenantId: tenant._id
    });
    summary.discharges += 1;

    const invoices = await Invoice.create([
      {
        orderNumber: `DEMO-${slug.toUpperCase()}-ORDER-001`, invoiceNumber: `DEMO-${slug.toUpperCase()}-INV-001`, orderStatus: 'closed', patientId: patients[1]._id, patientName: patients[1].name, admissionId: admissions[0]._id,
        lineItems: [{ description: 'Consultation and ward care', quantity: 1, unitPrice: 2500, amount: 2500 }], taxId: tax[0]._id, taxSnapshot: { taxId: tax[0]._id, name: tax[0].name, code: tax[0].code, rate: tax[0].rate, type: 'percentage' }, subtotalAmount: 2500, taxRate: 18, taxAmount: 450, totalAmount: 2950, paidAmount: 2950, balanceAmount: 0, amount: 2950, paymentMode: 'online', paymentReference: `DEMO-PAY-${slug}-001`, status: 'paid', tenantId: tenant._id, createdBy: users.staff2._id, paidAt: new Date(Date.now() - 86400000)
      },
      {
        orderNumber: `DEMO-${slug.toUpperCase()}-ORDER-002`, invoiceNumber: `DEMO-${slug.toUpperCase()}-INV-002`, orderStatus: 'finalized', patientId: patients[2]._id, patientName: patients[2].name, appointmentId: appointments[4]._id,
        lineItems: [{ description: 'Emergency consultation', quantity: 1, unitPrice: 1200, amount: 1200 }], taxId: tax[1]._id, subtotalAmount: 1200, taxRate: 5, taxAmount: 60, totalAmount: 1260, paidAmount: 500, balanceAmount: 760, amount: 1260, paymentMode: 'cash', status: 'partially_paid', tenantId: tenant._id, createdBy: users.staff2._id
      },
      {
        orderNumber: `DEMO-${slug.toUpperCase()}-ORDER-003`, invoiceNumber: `DEMO-${slug.toUpperCase()}-INV-003`, orderStatus: 'draft', patientId: patients[6]._id, patientName: patients[6].name,
        lineItems: [{ description: 'Diagnostic screening', quantity: 2, unitPrice: 450, amount: 900 }], subtotalAmount: 900, totalAmount: 900, paidAmount: 0, balanceAmount: 900, amount: 900, status: 'pending', tenantId: tenant._id, createdBy: users.tenant._id
      }
    ]);
    summary.invoices += invoices.length;

    const payments = await Payment.create([
      { invoiceId: invoices[0]._id, tenantId: tenant._id, amount: 2950, paymentMode: 'online', paymentReference: invoices[0].paymentReference, status: 'success', receivedBy: users.staff2._id },
      { invoiceId: invoices[1]._id, tenantId: tenant._id, amount: 500, paymentMode: 'cash', paymentReference: `DEMO-PAY-${slug}-002`, status: 'success', receivedBy: users.staff2._id },
      { invoiceId: invoices[2]._id, tenantId: tenant._id, amount: 100, paymentMode: 'online', paymentReference: `DEMO-PAY-${slug}-003`, status: 'failed', receivedBy: users.staff2._id }
    ]);
    summary.payments += payments.length;
  }

  return summary;
}

module.exports = { createBusinessData };
