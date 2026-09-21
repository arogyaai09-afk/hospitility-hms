# Patient Registration and Visit-wise Medical History Implementation Plan

## 1. Purpose

This document defines the implementation plan for maintaining a patient's complete medical history across multiple visits.

The target workflow is:

```text
Patient -> Visits -> Consultations -> Diagnoses
                         |-> Prescriptions and medicines
                         |-> Lab orders and reports
                         |-> Procedures and treatments
                         |-> Invoices -> Payments
                         |-> Clinical notes
```

A patient must have one permanent Patient ID. Each appointment, walk-in, emergency encounter, or admission must be connected to a separate visit record instead of creating a duplicate patient.

## 2. Current Code Assessment

### Existing modules

The backend currently contains patient, appointment, admission, discharge, invoice, payment, emergency, doctor, department, and authentication modules.

### Current limitations

- `Patient` has a free-text `medicalHistory` field rather than structured clinical records.
- `patientCode` is supplied by the client and is globally unique instead of tenant-scoped.
- Patient lookup supports MongoDB `_id`, but there is no dedicated search by Patient ID, phone, email, or identity document.
- `Appointment` stores scheduling information but is not a clinical visit.
- `Admission` stores `patientName` and does not reliably store `patientId`.
- `Invoice` can reference a patient, appointment, or admission, but not a visit.
- `Payment` is linked to an invoice only.
- Consultation, diagnosis, prescription, medicine, lab report, procedure, and clinical-note models do not exist.
- Patient routes currently expose CRUD operations only.
- The test command is a placeholder and does not exercise the clinical workflow.

### Relevant current files

- `src/modules/patient/patient.model.ts`
- `src/modules/patient/patient.service.ts`
- `src/modules/patient/patient.controller.ts`
- `src/modules/patient/patient.routes.ts`
- `src/modules/appointment/appointment.model.ts`
- `src/modules/admission/admission.model.ts`
- `src/modules/invoice/invoice.model.ts`
- `src/modules/invoice/payment.model.ts`
- `src/modules/invoice/invoice.service.ts`
- `app.ts`

## 3. Target Domain Model

### Patient

The permanent demographic and identity record.

Required relationships:

```text
Patient 1 -> many Visits
Patient 1 -> many Appointments
Patient 1 -> many Admissions
Patient 1 -> many Invoices
```

Suggested fields:

- `patientCode`
- `userId`
- `name`
- `dateOfBirth`
- `gender`
- `phone`
- `email`
- `address`
- `emergencyContact`
- `bloodGroup`
- `allergies`
- `currentMedications`
- `idProofType`
- `idProofNumber`
- `nationality`
- `insuranceProvider`
- `insurancePolicyNumber`
- `status`
- `tenantId`
- `createdAt`
- `updatedAt`

`medicalHistory` should remain temporarily for legacy data but should no longer be the source of truth for new clinical information.

### Visit

A visit is the central clinical encounter for one patient at one point in time.

Suggested fields:

- `visitCode`
- `patientId`
- `tenantId`
- `visitType`: `OPD`, `IPD`, `emergency`, `follow_up`, `walk_in`
- `status`: `registered`, `checked_in`, `in_consultation`, `completed`, `cancelled`
- `appointmentId`
- `admissionId`
- `doctorId`
- `departmentId`
- `visitReason`
- `checkedInAt`
- `completedAt`
- `createdBy`
- `createdAt`
- `updatedAt`

A visit must always have a valid `patientId` and `tenantId`.

### Consultation

One consultation record belongs to a visit.

Suggested fields:

- `visitId`
- `patientId`
- `doctorId`
- `chiefComplaint`
- `symptoms`
- `examination`
- `vitals`
- `assessment`
- `diagnosis`
- `treatmentPlan`
- `followUpDate`
- `clinicalNotes`
- `status`
- `createdBy`
- timestamps

### Prescription and medicine items

Use a prescription header and separate medicine items so the system can identify current and historical medications.

`Prescription` fields:

- `visitId`
- `patientId`
- `doctorId`
- `notes`
- `status`
- `prescribedAt`

`PrescriptionItem` fields:

- `prescriptionId`
- `medicineName`
- `genericName`
- `dosage`
- `frequency`
- `route`
- `duration`
- `quantity`
- `instructions`
- `startDate`
- `endDate`
- `status`

### Lab orders and reports

`LabOrder` should store the requested test and its visit. `LabReport` should store the result and any attachment or report reference.

Both records should include `patientId`, `visitId`, and `tenantId`.

### Procedures and treatments

A procedure record should include:

- `visitId`
- `patientId`
- `procedureName`
- `indication`
- `performedBy`
- `notes`
- `outcome`
- `performedAt`
- `status`
- `tenantId`

### Billing and payments

Invoices should gain `visitId` while retaining existing appointment and admission links for compatibility.

Payments remain linked to invoices, with patient and visit history obtained through the invoice relationship.

## 4. Module Changes

### 4.1 Patient registration and search

Update the patient module to:

1. Generate Patient IDs on the server.
2. Use a tenant-scoped unique index on `{ tenantId, patientCode }`.
3. Add the missing demographic, allergy, medication, insurance, and identity fields.
4. Add `updatedAt` and patient status.
5. Validate duplicate identity information before creating a patient.
6. Prevent non-admin users from submitting an arbitrary `tenantId`.
7. Preserve historical records when demographic data is updated.

Recommended endpoints:

```text
POST  /api/v1/patients
GET   /api/v1/patients/search?q=<patient-code-or-identity>
GET   /api/v1/patients/:id
GET   /api/v1/patients/:id/summary
PATCH /api/v1/patients/:id
```

Search should support Patient ID, phone, email, and configured identity fields. Exact Patient ID matches should be preferred.

### 4.2 Visit module

Create `src/modules/visit/` with model, service, controller, and routes.

Recommended endpoints:

```text
POST  /api/v1/patients/:patientId/visits
GET   /api/v1/patients/:patientId/visits
GET   /api/v1/visits/:visitId
PATCH /api/v1/visits/:visitId/status
GET   /api/v1/visits/:visitId/history
```

The visit service must verify patient, doctor, appointment, admission, and department ownership within the same tenant.

### 4.3 Consultation module

Create a consultation module or a clinical module containing consultation and diagnosis services.

Recommended endpoints:

```text
POST  /api/v1/visits/:visitId/consultation
GET   /api/v1/visits/:visitId/consultation
PATCH /api/v1/consultations/:consultationId
```

Doctors should be able to save draft notes and complete the consultation separately.

### 4.4 Prescription and medicine module

Recommended endpoints:

```text
POST  /api/v1/visits/:visitId/prescriptions
GET   /api/v1/patients/:patientId/prescriptions
GET   /api/v1/patients/:patientId/medications/current
GET   /api/v1/visits/:visitId/prescriptions
PATCH /api/v1/prescriptions/:prescriptionId
```

The current medication endpoint should return medicines that are active based on their status and dates, with the latest prescription clearly identified.

### 4.5 Lab and report module

Recommended endpoints:

```text
POST /api/v1/visits/:visitId/lab-orders
GET  /api/v1/patients/:patientId/lab-orders
POST /api/v1/lab-orders/:labOrderId/report
GET  /api/v1/visits/:visitId/reports
```

Reports should support result text and future file or attachment references.

### 4.6 Procedure and treatment module

Recommended endpoints:

```text
POST /api/v1/visits/:visitId/procedures
GET  /api/v1/visits/:visitId/procedures
GET  /api/v1/patients/:patientId/procedures
```

### 4.7 Appointment changes

Appointments remain scheduling records, but they must reference a valid patient.

Update the appointment flow to support:

```text
Appointment created -> patient checked in -> visit created
```

An appointment should not create a new patient. At check-in, the existing Patient ID must be selected or resolved.

### 4.8 Admission and discharge changes

Add `patientId` and `visitId` to admissions. Retain `patientName` only as a legacy snapshot if required for historical display.

Update OPD, IPD, emergency admission, and discharge flows so that they preserve the same patient and visit relationships.

### 4.9 Invoice and payment changes

Add `visitId` to invoices and validate that the linked patient, appointment, admission, and visit belong to the same tenant.

Recommended endpoints:

```text
GET /api/v1/patients/:patientId/invoices
GET /api/v1/patients/:patientId/payments
GET /api/v1/visits/:visitId/invoices
GET /api/v1/visits/:visitId/payments
```

Existing invoice payment collection can remain, but the payment history must be accessible from the patient history screen.

## 5. Patient History API

Add a patient history service that aggregates the patient's structured records.

Recommended endpoint:

```text
GET /api/v1/patients/:patientId/summary
```

Response should include:

- Patient demographics
- Allergies and clinical alerts
- Current medications
- Most recent visit
- Paginated previous visits
- Previous consultations
- Diagnoses
- Prescriptions and medicines
- Lab orders and reports
- Procedures and treatments
- Appointments
- Admissions and discharge summaries
- Invoices
- Payments
- Doctor and clinical notes

The visit list should be paginated. A separate visit detail endpoint should return all records for one visit.

Example response shape:

```json
{
  "patient": {},
  "currentMedications": [],
  "latestVisit": {},
  "visits": [
    {
      "visit": {},
      "consultation": {},
      "diagnoses": [],
      "prescriptions": [],
      "reports": [],
      "procedures": [],
      "invoices": [],
      "payments": [],
      "notes": []
    }
  ],
  "pagination": {}
}
```

## 6. Doctor Consultation Screen Contract

When a doctor opens an existing patient for a new consultation, the frontend should:

1. Search and select the existing patient.
2. Display the permanent Patient ID.
3. Load the patient summary.
4. Show allergies and current medications prominently.
5. Show previous visits in reverse chronological order.
6. Allow opening one visit for full detail.
7. Create a new visit before saving new consultation data.
8. Save all new clinical records using the new visit ID.
9. Clearly label current medications separately from historical medications.

The doctor must not edit previous completed visits while creating the new consultation. Corrections should use an audit-aware update process.

## 7. Data Migration Plan

Existing records must be migrated without losing billing or operational history.

### Migration sequence

1. Resolve duplicate or missing patient codes.
2. Add tenant-scoped patient indexes.
3. Add `patientId` to admissions by resolving their appointment relationships where possible.
4. Create historical visits for existing appointments, admissions, and emergency cases.
5. Add `visitId` to invoices using appointment, admission, or patient relationships.
6. Preserve existing payment records through their invoice links.
7. Retain legacy `medicalHistory` text for manual review.
8. Import structured allergies or medications only when the source data is reliable.
9. Mark legacy fields and relationships for later removal after verification.

Migration scripts should be repeatable, tenant-scoped, and produce a summary of migrated, skipped, and unresolved records.

## 8. Indexes and Integrity Rules

Add indexes for the main query paths:

```text
Patient:       { tenantId: 1, patientCode: 1 } unique
Patient:       { tenantId: 1, phone: 1 }
Patient:       { tenantId: 1, email: 1 }
Visit:         { tenantId: 1, patientId: 1, visitDate: -1 }
Consultation:  { tenantId: 1, visitId: 1 }
Prescription:  { tenantId: 1, patientId: 1, prescribedAt: -1 }
LabOrder:      { tenantId: 1, patientId: 1, orderedAt: -1 }
Invoice:       { tenantId: 1, patientId: 1, createdAt: -1 }
Payment:       { tenantId: 1, invoiceId: 1, createdAt: -1 }
```

Integrity rules:

- Every tenant-owned query must include `tenantId`.
- Every clinical record must reference a patient and visit.
- A visit cannot reference a patient from another tenant.
- A returning patient must never create a second Patient document solely because a new visit is being created.
- Completed historical visits should be read-only to normal consultation workflows.

## 9. Security and Access Control

Use the existing role groups as a starting point, then apply more specific permissions:

- Doctors: view assigned or permitted patient history and manage consultations, diagnoses, prescriptions, and clinical notes.
- Clinical staff: register patients, create visits, manage operational records, and view permitted history.
- Billing staff: view patient identity and billing history, but not unrestricted clinical notes.
- Patients: access only their own records if patient self-service is enabled.
- Admin and tenant roles: tenant-scoped access according to existing authorization rules.

Do not trust `tenantId` from request bodies for non-admin users.

## 10. Testing Plan

Replace the placeholder test command with automated tests covering:

- Server-side Patient ID generation
- Duplicate patient prevention
- Search by Patient ID, phone, email, and identity number
- Creation of multiple visits for one patient
- No duplicate patient on a returning visit
- Consultation linkage to the correct visit
- Prescription and medicine history
- Current medication calculation
- Lab order and report linkage
- Procedure and treatment history
- Invoice and payment history by patient and visit
- Appointment-to-visit conversion
- Admission-to-visit conversion
- Full patient summary response
- Full visit detail response
- Cross-tenant access rejection
- Invalid patient, visit, doctor, appointment, and admission references

## 11. Delivery Phases

### Phase 1: Patient identity foundation

- Generate permanent Patient IDs.
- Add duplicate detection and patient search.
- Add registration fields and indexes.
- Add patient-summary placeholder endpoint.

### Phase 2: Visit foundation

- Create the Visit module.
- Add visit lifecycle and status transitions.
- Link appointments, admissions, and emergency cases.
- Add visit list and visit detail endpoints.

### Phase 3: Clinical records

- Add consultation and diagnosis records.
- Add prescriptions and medicine items.
- Add clinical notes and current medication logic.

### Phase 4: Diagnostics and treatment

- Add lab orders and reports.
- Add procedures and treatments.
- Add attachments or report references if required.

### Phase 5: Billing integration

- Add `visitId` to invoices.
- Expose patient and visit invoice history.
- Expose payment history in the patient summary.

### Phase 6: Doctor workflow

- Update the consultation screen to load previous history.
- Add current medication and allergy alerts.
- Add previous-visit detail navigation.
- Prevent accidental edits to completed historical visits.

### Phase 7: Migration and production readiness

- Run migration scripts in a staging database.
- Verify tenant isolation and historical totals.
- Reconcile migrated invoices and payments.
- Enable monitoring and audit logging.
- Remove deprecated fields only after sign-off.

## 12. Acceptance Criteria

The implementation is complete when:

- A patient receives one permanent Patient ID at first registration.
- A returning patient can be found by Patient ID or another approved identifier.
- A returning visit does not create a duplicate patient.
- Every visit has its own visit record and timestamp.
- A doctor can view previous history before starting a new consultation.
- Previous diagnoses, prescriptions, medicines, reports, procedures, notes, bills, and payments are available.
- Current medications are clearly distinguishable from historical medications.
- A specific previous visit can be opened with complete detail.
- New consultation data is linked only to the new visit.
- Appointments, admissions, invoices, and payments remain connected to the same patient.
- All records remain tenant-scoped.
- Existing historical billing data is preserved after migration.
- Automated tests cover the primary returning-patient workflow.

## 13. Recommended Implementation Order

1. Patient ID generation, duplicate detection, and patient search.
2. Visit model, service, controller, routes, and indexes.
3. Appointment and admission linkage to visits.
4. Consultation and diagnosis records.
5. Prescription and medicine records.
6. Lab reports and procedures.
7. Invoice and payment linkage.
8. Patient summary and visit detail APIs.
9. Doctor consultation screen integration.
10. Migration scripts and automated tests.
