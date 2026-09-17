# HMS Frontend Workflow Guide

## 1. Purpose

This document explains the complete front-end user journey for the hospital management system, focusing on patient registration, doctor consultation, emergency handling, admission, room and bed allocation, discharge, and billing.

The goal is to make the workflow easy for front-end developers and product teams to understand and implement consistently.

---

## 2. Core user journeys

The system is designed around the following major flows:

1. Patient registration and search
2. Doctor consultation and appointment booking
3. Emergency case intake
4. Admission and bed allocation
5. Inpatient monitoring and treatment
6. Discharge and room release
7. Invoice and payment collection
8. Dashboard and analytics

---

## 3. Screen-wise workflow

### Screen 1: Dashboard

**Goal:** Show an overview of the hospital operations.

**Displayed data:**
- total patients
- appointments today
- admissions
- available beds
- occupied beds
- revenue
- recent activity
- analytics cards

**User roles:** admin, tenant, staff, doctor

**Actions:**
- open patient list
- open appointments
- open admissions
- open emergency queue
- open billing pages

---

### Screen 2: Patient Management

**Goal:** Create and manage patient records.

**Subscreens:**
- Patient list
- Add patient
- Edit patient
- Patient detail

**Fields:**
- patient code
- full name
- date of birth
- gender
- phone
- email
- address
- emergency contact
- medical history

**Flow:**
- user opens patient list
- clicks Add Patient
- fills details
- saves record
- patient is available for doctor/appointment/admission workflow

---

### Screen 3: Appointment / OPD Consultation

**Goal:** Book or manage patient consultations.

**Subscreens:**
- appointment list
- new appointment form
- appointment details

**Fields:**
- patient
- doctor
- appointment type
- department
- date and time
- visit reason
- status

**Workflow:**
- patient is selected
- doctor is selected
- appointment is booked
- doctor reviews patient in OPD
- if admission is needed, the flow continues to admission

---

### Screen 4: Doctor Consultation / Clinical Review

**Goal:** Allow doctors to examine patients and decide treatment or admission.

**Displayed information:**
- patient information
- medical history
- appointment details
- treatment notes
- department
- urgency level

**Decision points:**
- discharge / continue OPD treatment
- admit to ward
- admit to ICU
- refer to emergency

**Outcome:**
- patient remains OPD
- or patient moves to admission flow

---

### Screen 5: Emergency Intake

**Goal:** Accept emergency cases quickly and safely.

**Subscreens:**
- emergency list
- create emergency case
- emergency detail
- emergency patient admission

**Fields:**
- patient name
- case type
- symptoms
- department
- triage status
- attending doctor
- current condition

**Workflow:**
- emergency is registered
- case is triaged
- if stabilized, it can be admitted
- if needed, patient is transferred to an available bed

---

### Screen 6: Admission Form

**Goal:** Convert a consultation or emergency case into an inpatient case.

**Fields:**
- patient
- admission type
  - OPD to IPD
  - Emergency
  - Planned admission
- attending doctor
- department
- ward or room preference
- reason for admission
- expected stay
- bed requirement

**Decision:**
- patient admission is created
- system then checks available beds
- user assigns or confirms bed

---

### Screen 7: Bed Availability and Room Allocation

**Goal:** Show which beds are available and allow manual allocation.

**Page sections:**
- total beds
- available beds
- occupied beds
- maintenance beds
- ward-wise breakdown
- room-wise breakdown
- bed card list

**Filter options:**
- department
- ward
- bed type
- ICU / general / private / deluxe
- status

**Action flow:**
- staff opens bed list
- filters by ward or department
- selects an available bed
- assigns bed to patient admission
- bed status changes to occupied

**Example assignments:**
- General Ward → Room G-101 → Bed 2
- ICU → Room ICU-02 → Bed 1
- Private Room → Room P-08 → Bed 1

---

### Screen 8: Assigned Inpatient Room View

**Goal:** Display patient’s assigned room and bed during treatment.

**Displayed info:**
- patient name
- patient ID
- admission ID
- room number
- bed number
- ward
- assigned doctor
- admission date
- expected discharge date

**Roles involved:**
- doctor
- nurse
- ward staff
- admin

---

### Screen 9: Nursing / Ward Staff View

**Goal:** Support ward-day operational management.

**Core actions:**
- view assigned patients
- view room and bed assignments
- update treatment status
- check patient progress
- update discharge preparation

**Use cases:**
- nurse checks patient list by ward
- nurse sees which beds are occupied and free
- nurse helps coordinate discharge cleaning and room readiness

**Recommended design:**
- Keep nursing staff under the Staff module with role = nurse
- Add ward and shift data where needed
- Avoid creating a full independent nurse module unless future scope requires it

---

### Screen 10: Discharge and Room Release

**Goal:** Complete the inpatient stay and free the bed.

**Fields:**
- patient
- admission summary
- doctor remarks
- discharge date
- discharge reason
- treatment outcome
- room cleaning status

**Workflow:**
- doctor or admin clicks discharge
- system marks admission as discharged
- bed is released to available
- room becomes ready for next patient

---

### Screen 11: Billing and Invoice Generation

**Goal:** Generate and track charges for consultation, admission, room, and procedures.

**Document types:**
- consultation invoice
- appointment invoice
- admission invoice
- room and service invoice
- final settlement invoice

**Fields:**
- patient
- invoice number
- invoice date
- services list
- consultation fees
- room charges
- medicine charges
- lab charges
- total amount
- paid amount
- balance amount
- payment mode

**Workflow:**
- invoice is created after consultation or admission
- payment is collected via online or offline mode
- amount update is reflected in patient billing summary
- invoice status moves to paid or partially paid

---

### Screen 12: Payment History / Payment Collection

**Goal:** Track all payments for an invoice.

**Displayed info:**
- invoice number
- total billed
- paid amount
- remaining balance
- payment method
- date/time
- reference number

**Actions:**
- collect partial payment
- collect full payment
- view payment timeline

---

### Screen 13: Analytics / BI Dashboard

**Goal:** Provide business intelligence across hospital operations.

**Widgets:**
- total patients
- appointments
- admissions
- revenue
- popular doctors
- top departments
- bed occupancy
- doctors schedule
- income by treatment
- appointment table

**Filters:**
- period
- department
- doctor
- status

---

## 4. Recommended frontend module structure

### Main modules
- Auth
- Dashboard
- Patient
- Appointment
- Emergency
- Doctor
- Staff
- Department
- Admission
- Bed / Room
- Discharge
- Invoice
- Analytics

### Recommended navigation
- Dashboard
- Patients
- Appointments
- Doctors
- Staff / Nurses
- Departments
- Admissions
- Emergency
- Beds
- Discharges
- Invoices
- Analytics

---

## 5. Suggested user flow summary

```text
Patient Registration
        ↓
Doctor Consultation / Appointment
        ↓
Emergency or Planned Admission
        ↓
Bed Availability Check
        ↓
Room + Bed Assignment
        ↓
Inpatient Treatment
        ↓
Discharge
        ↓
Invoice Generation
        ↓
Payment Collection
        ↓
Analytics and Reports
```

---

## 6. Recommended implementation principles

- Keep patient, doctor, admission, bed, and invoice as separate modules.
- Keep nurse under Staff unless a separate nursing module is required later.
- Use a central Bed Availability screen for room and bed management.
- Keep ward and room assignment simple, clear, and filterable.
- Ensure discharge automatically frees the assigned bed and room.
- Keep billing as a separate flow connected to appointments and admissions.

---

## 7. Final recommendation

The most manageable and consistent front-end design for this project is:

- unified staff directory with nurse as a staff role
- dedicated patient and admission screens
- central bed management dashboard
- separate discharge and invoice flows
- analytics page as a dedicated BI section

This keeps the product easier to build, easier to maintain, and easier for teams to understand.
