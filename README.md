# Hospital Management System (HMS)

Backend service built with Node.js, Koa, MongoDB and JWT authentication.

## Features
- Role-based authentication with JWT + refresh tokens
- Multi-tenant support by tenantId scope
- Patient registration, doctor consultation, and OPD/IPD workflows
- Emergency case intake and emergency-to-admission conversion
- Bed allotment, room occupancy tracking, and discharge summary
- Invoice generation and payment collection for appointments and services
- Versioned API under `/api/v1`
- Docker and CI/CD ready

## Complete patient and clinical workflow

The current backend supports a full clinical flow that starts from patient registration and continues through consultation, admission, bed allocation, treatment, discharge, and billing.

### 1) Patient registration and onboarding
- Create patient profile using the patient module.
- Capture identity, contact, emergency contact, and medical history.
- Patient record is tenant-scoped and linked to the current hospital/tenant.

### 2) Doctor consultation and appointment flow
- Patients can be booked for consultation through the appointment module.
- Appointment type supports OPD, IPD, and Emergency based on the schema.
- Doctors can be assigned during booking and admission flow.
- Doctor consultation is the entry point for diagnosis and treatment decisions.

### 3) Emergency workflow
- Emergency cases can be created through the emergency module.
- Emergency status can be tracked as pending, under-treatment, stabilized, admitted, or discharged.
- A stabilized emergency case can be admitted to IPD directly through the emergency-to-admission flow.

### 4) Admission flow
- After consultation, the patient may be admitted.
- Admission supports:
  - OPD to admission conversion
  - direct IPD admission
  - emergency admission
- Admission is linked to patient, doctor, tenant, and optional bed assignment.

### 5) Room and bed allocation flow
- Beds are tracked with status values such as available, occupied, and maintenance.
- Bed allotment happens during admission using the bed service.
- The system checks whether the target bed is available before assigning it.
- Once assigned, the bed is marked occupied and linked to the admission.

### 6) Inpatient treatment and monitoring
- The patient remains in the assigned room/bed while under treatment.
- The admission record remains the core operational record for inpatient activity.
- Department, doctor, and bed assignment remain linked to the case.

### 7) Discharge and room release
- When discharged, the admission status changes to discharged.
- The assigned bed is released back to available state.
- Discharge summary can be created through the discharge module.

### 8) Invoice generation and payment
- The system supports invoice creation for services, appointments, and hospital charges.
- Invoice flow includes:
  - create invoice
  - generate appointment-based invoice
  - list invoices
  - collect payment
  - view payment history
- Payment status can move through partially paid and paid states.

## Primary API flow summary

### Patient journey API modules
- `POST /api/v1/auth/register` or user creation flow
- `POST /api/v1/patients`
- `POST /api/v1/appointments`
- `POST /api/v1/emergencies`
- `POST /api/v1/admissions/from-opd`
- `POST /api/v1/admissions/ipd`
- `POST /api/v1/emergencies/:id/admit`
- `GET /api/v1/beds/available`
- `PATCH /api/v1/admissions/:id/discharge`
- `POST /api/v1/invoices`
- `POST /api/v1/invoices/appointments/:appointmentId`
- `PATCH /api/v1/invoices/:id/pay`

### Core business modules involved
- Auth
- Patient
- Doctor
- Staff
- Appointment
- Emergency
- Admission
- Bed
- Discharge
- Invoice
- Analytics

## Operational notes

This flow is already aligned to the current backend implementation and is suitable for a hospital front end that needs:
- patient check-in
- doctor consultation
- emergency intake
- ward/bed assignment
- discharge handling
- invoice and payment collection

The design is intentionally role-aware and tenant-scoped so staff and departments can work within the correct tenant boundary while keeping the clinical flow manageable for front-end modules.

## Folder structure
- `config/` - environment and database configuration
- `src/modules/` - business modules separated by feature
- `src/middlewares/` - reusable Koa middleware
- `src/utils/` - helpers and response utilities
- `docs/` - API and architecture documentation

## Run locally
1. Copy `.env.example` to `.env` and set values.
2. Install dependencies: `npm install`
3. Start service: `npm run dev`

## Docker
- Build: `docker compose build`
- Start: `docker compose up`

## Development seed data

Create a complete multi-tenant development dataset with one command:

```bash
npm run seed:dev
```

The seed creates three demo tenants. Each tenant receives tenant, doctor, staff,
and patient users plus doctors, staff profiles, patients, beds, appointments,
admissions, emergencies, taxes, invoices, payments, and a discharge summary.
The records use the existing Mongoose models and are scoped with the correct
`tenantId` relationships.

The command is safe to rerun. It removes and recreates only records belonging
to the named `HMS Demo ...` tenants and the `hms-demo.example.test` accounts;
other development data is preserved. To reset only the dummy data, run the
same command again. To reset the entire local database, stop the app and use
the database-specific reset command, for example:

```bash
docker compose down -v
docker compose up -d mongo
npm run seed:dev
```

Credentials are development-only and are printed after every successful seed.
The default password is `DevHms@123`; set `SEED_PASSWORD` to override it for a
local run. The generated accounts use `@example.test` addresses and must not be
used in production.

The seeded API can be tested with a tenant account at
`/api/v1/auth/login`, then the returned token can be used for tenant-scoped
routes under `/api/v1`.

## API documentation
See `docs/api.md` for route definitions and sample requests.

## Workflow documentation
See `docs/clinical-workflow-guide.md` for the patient admission, room allocation, nurse registration, and clinical operations flow.
See `docs/frontend-workflow-guide.md` for the screen-by-screen front-end workflow and role-based clinical journey.

# hospitility-hms
