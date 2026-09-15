# HMS API Documentation

Base URL: `/api/v1`

> All endpoints under `/api/v1` require `Authorization: Bearer <accessToken>` unless otherwise noted.

## Authentication

### POST /auth/login
Login user and get JWT tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "user": {
      "id": "60d5ecb74b24c72b8c8b4567",
      "email": "user@example.com",
      "role": "tenant",
      "tenantId": "60d5ecb74b24c72b8c8b4568"
    },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/refresh
Refresh access token using a refresh token.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### POST /auth/register
Register a new user.

This endpoint is public and does not require an authentication token.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "doctor",
  "tenantId": "60d5ecb74b24c72b8c8b4568"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "User created",
  "data": {
    "id": "60d5ecb74b24c72b8c8b4567",
    "email": "john@example.com",
    "role": "doctor",
    "tenantId": "60d5ecb74b24c72b8c8b4568"
  }
}
```

### GET /auth/profile
Get current user profile.

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4567",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "doctor",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Tenants

### GET /tenants
List all tenants.

**Authorization:**
- `admin` only via `ACCESS_GROUPS.PLATFORM_ADMINS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4568",
      "name": "City Hospital",
      "state": "Maharashtra",
      "country": "India",
      "metadata": {},
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /tenants
Create a new tenant.

**Authorization:**
- `admin` only via `ACCESS_GROUPS.PLATFORM_ADMINS`

**Request Body:**
```json
{
  "name": "City Hospital",
  "state": "Maharashtra",
  "country": "India",
  "metadata": {
    "address": "123 Main St",
    "phone": "+91-1234567890"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Tenant created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4568",
    "name": "City Hospital",
    "state": "Maharashtra",
    "country": "India",
    "metadata": {
      "address": "123 Main St",
      "phone": "+91-1234567890"
    },
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /tenants/:id
Get tenant details.

**Authorization:**
- `admin` or tenant owner via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4568",
    "name": "City Hospital",
    "state": "Maharashtra",
    "country": "India",
    "metadata": {
      "address": "123 Main St",
      "phone": "+91-1234567890"
    },
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Doctors

### GET /doctors
List doctors for a tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Query Parameters:**
- `tenantId` required when the caller is an admin.

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4569",
      "name": "Dr. Smith",
      "specialization": "Cardiology",
      "phone": "+91-9876543210",
      "email": "smith@hospital.com",
      "userId": "60d5ecb74b24c72b8c8b4567",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /doctors
Create a doctor profile.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Request Body:**
```json
{
  "name": "Dr. Smith",
  "specialization": "Cardiology",
  "phone": "+91-9876543210",
  "email": "smith@hospital.com",
  "userId": "60d5ecb74b24c72b8c8b4567",
  "tenantId": "60d5ecb74b24c72b8c8b4568"
}
```

**Notes:**
- `userId` is optional and links the profile to an auth user.
- Admin users must pass `tenantId`; tenant users are scoped automatically.

**Response:**
```json
{
  "status": "success",
  "message": "Doctor created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4569",
    "name": "Dr. Smith",
    "specialization": "Cardiology",
    "phone": "+91-9876543210",
    "email": "smith@hospital.com",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /doctors/:id
Get a single doctor profile for the current tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "message": "Doctor retrieved",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4569",
    "name": "Dr. Smith",
    "specialization": "Cardiology",
    "phone": "+91-9876543210",
    "email": "smith@hospital.com",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /doctors/:id
Update a doctor profile.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Request Body:**
```json
{
  "name": "Dr. Smith Updated",
  "specialization": "Neurology",
  "phone": "+91-9988776655",
  "email": "smith.updated@hospital.com"
}
```

**Notes:**
- `tenantId` cannot be changed from this endpoint.
- `userId` can be reassigned only if the target user belongs to the same tenant and has the `doctor` role.

**Response:**
```json
{
  "status": "success",
  "message": "Doctor updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4569",
    "name": "Dr. Smith Updated",
    "specialization": "Neurology",
    "phone": "+91-9988776655",
    "email": "smith.updated@hospital.com",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### DELETE /doctors/:id
Delete a doctor profile from the current tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "message": "Doctor deleted",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4569",
    "name": "Dr. Smith Updated",
    "specialization": "Neurology",
    "phone": "+91-9988776655",
    "email": "smith.updated@hospital.com",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Patients

### GET /patients
List patients for the current tenant.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4570",
      "patientCode": "PAT-1001",
      "name": "Jane Doe",
      "dateOfBirth": "1990-07-20T00:00:00.000Z",
      "gender": "female",
      "phone": "+91-9876501234",
      "email": "jane.doe@example.com",
      "address": "45 Ocean Drive",
      "emergencyContact": "+91-9876509999",
      "medicalHistory": "No known allergies",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /patients
Create a patient.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "patientCode": "PAT-1001",
  "name": "Jane Doe",
  "dateOfBirth": "1990-07-20",
  "gender": "female",
  "phone": "+91-9876501234",
  "email": "jane.doe@example.com",
  "address": "45 Ocean Drive",
  "emergencyContact": "+91-9876509999",
  "medicalHistory": "No known allergies"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Patient created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4570",
    "patientCode": "PAT-1001",
    "name": "Jane Doe",
    "dateOfBirth": "1990-07-20T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876501234",
    "email": "jane.doe@example.com",
    "address": "45 Ocean Drive",
    "emergencyContact": "+91-9876509999",
    "medicalHistory": "No known allergies",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /patients/:id
Get patient details.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4570",
    "patientCode": "PAT-1001",
    "name": "Jane Doe",
    "dateOfBirth": "1990-07-20T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876501234",
    "email": "jane.doe@example.com",
    "address": "45 Ocean Drive",
    "emergencyContact": "+91-9876509999",
    "medicalHistory": "No known allergies",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Admissions

### POST /admissions/from-opd
Convert an OPD appointment into an admission.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "appointmentId": "60d5ecb74b24c72b8c8b4571",
  "bedNumber": "B-101",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "OPD converted to admission",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4572",
    "patientName": "Jane Doe",
    "admissionType": "OPD",
    "appointmentId": "60d5ecb74b24c72b8c8b4571",
    "bedNumber": "B-101",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "admitted",
    "admittedAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### POST /admissions/ipd
Create a new IPD admission.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "patientName": "Jane Doe",
  "admissionType": "IPD",
  "bedNumber": "B-102",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "IPD admission created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4573",
    "patientName": "Jane Doe",
    "admissionType": "IPD",
    "bedNumber": "B-102",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "admitted",
    "admittedAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /admissions
List admissions for the current tenant.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4572",
      "patientName": "Jane Doe",
      "admissionType": "OPD",
      "bedNumber": "B-101",
      "doctorId": "60d5ecb74b24c72b8c8b4569",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "status": "admitted",
      "admittedAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### PATCH /admissions/:id/discharge
Discharge an admission.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "message": "Patient discharged",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4572",
    "patientName": "Jane Doe",
    "admissionType": "OPD",
    "bedNumber": "B-101",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "discharged",
    "dischargedAt": "2023-05-11T12:00:00.000Z"
  }
}
```

## Beds

### GET /beds
List all beds.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4574",
      "bedNumber": "B-101",
      "status": "available",
      "assignedAdmissionId": null,
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /beds
Create a bed.

**Authorization:**
- `admin`, `tenant`, or `staff` via `ACCESS_GROUPS.OPERATIONS_MANAGERS`

**Request Body:**
```json
{
  "bedNumber": "B-103"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Bed created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4574",
    "bedNumber": "B-103",
    "status": "available",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /beds/available
List available beds.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4574",
      "bedNumber": "B-103",
      "status": "available",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

## Appointments

### GET /appointments
List appointments for the current tenant.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.APPOINTMENT_MANAGERS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4575",
      "patientId": "60d5ecb74b24c72b8c8b4570",
      "patientName": "Jane Doe",
      "patientType": "local",
      "appointmentType": "OPD",
      "visitReason": "Routine checkup",
      "doctorId": "60d5ecb74b24c72b8c8b4569",
      "status": "scheduled",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdBy": "60d5ecb74b24c72b8c8b4567",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /appointments
Create an appointment.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.APPOINTMENT_MANAGERS`

**Request Body:**
```json
{
  "patientId": "60d5ecb74b24c72b8c8b4570",
  "patientName": "Jane Doe",
  "patientType": "local",
  "appointmentType": "OPD",
  "visitReason": "Routine checkup",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Appointment created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4575",
    "patientId": "60d5ecb74b24c72b8c8b4570",
    "patientName": "Jane Doe",
    "patientType": "local",
    "appointmentType": "OPD",
    "visitReason": "Routine checkup",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "status": "scheduled",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdBy": "60d5ecb74b24c72b8c8b4567",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Emergencies

### GET /emergencies
List emergency cases.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4576",
      "patientName": "Jane Doe",
      "patientId": "60d5ecb74b24c72b8c8b4570",
      "emergencyType": "accident",
      "severity": "high",
      "assignedDoctor": "60d5ecb74b24c72b8c8b4569",
      "status": "pending",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /emergencies
Create an emergency case.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "patientName": "Jane Doe",
  "patientId": "60d5ecb74b24c72b8c8b4570",
  "emergencyType": "accident",
  "severity": "high",
  "assignedDoctor": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Emergency case created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4576",
    "patientName": "Jane Doe",
    "patientId": "60d5ecb74b24c72b8c8b4570",
    "emergencyType": "accident",
    "severity": "high",
    "assignedDoctor": "60d5ecb74b24c72b8c8b4569",
    "status": "pending",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### POST /emergencies/:id/admit
Admit an emergency case to IPD.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "bedNumber": "B-104",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Emergency admitted to IPD",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4576",
    "patientName": "Jane Doe",
    "status": "admitted",
    "tenantId": "60d5ecb74b24c72b8c8b4568"
  }
}
```

## Discharge

### POST /discharge
Create a discharge summary.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "admissionId": "60d5ecb74b24c72b8c8b4572",
  "summary": "Patient discharged in stable condition",
  "followUpInstructions": "Return after 2 weeks"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Discharge summary created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4577",
    "admissionId": "60d5ecb74b24c72b8c8b4572",
    "summary": "Patient discharged in stable condition",
    "followUpInstructions": "Return after 2 weeks",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Invoices

### GET /invoices
List invoices for the current tenant.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4578",
      "invoiceNumber": "INV-1001",
      "patientName": "Jane Doe",
      "subtotalAmount": 1000,
      "taxAmount": 50,
      "totalAmount": 1050,
      "paidAmount": 0,
      "balanceAmount": 1050,
      "status": "pending",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /invoices
Create an invoice.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Request Body:**
```json
{
  "patientId": "60d5ecb74b24c72b8c8b4570",
  "patientName": "Jane Doe",
  "appointmentId": "60d5ecb74b24c72b8c8b4575",
  "lineItems": [
    {
      "description": "Consultation",
      "quantity": 1,
      "unitPrice": 1000,
      "amount": 1000
    }
  ],
  "subtotalAmount": 1000,
  "discountAmount": 0,
  "taxRate": 5,
  "taxAmount": 50,
  "totalAmount": 1050,
  "paidAmount": 0,
  "balanceAmount": 1050,
  "amount": 1050,
  "paymentType": "one_time",
  "paymentMode": "cash"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Invoice generated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4578",
    "invoiceNumber": "INV-1001",
    "patientName": "Jane Doe",
    "totalAmount": 1050,
    "paidAmount": 0,
    "balanceAmount": 1050,
    "status": "pending",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### POST /invoices/appointments/:appointmentId
Create an invoice from an appointment.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Request Body:**
```json
{
  "lineItems": [
    {
      "description": "Consultation",
      "quantity": 1,
      "unitPrice": 1000,
      "amount": 1000
    }
  ],
  "subtotalAmount": 1000,
  "discountAmount": 0,
  "taxRate": 5,
  "taxAmount": 50,
  "totalAmount": 1050,
  "amount": 1050,
  "paymentMode": "cash"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Appointment invoice generated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4579",
    "appointmentId": "60d5ecb74b24c72b8c8b4575",
    "totalAmount": 1050,
    "status": "pending",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /invoices/:id/pay
Collect payment for an invoice.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Request Body:**
```json
{
  "amount": 1050,
  "paymentMode": "cash",
  "paymentReference": "TXN-1234",
  "paymentTerminalId": "TERM-001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4578",
    "paidAmount": 1050,
    "balanceAmount": 0,
    "status": "paid"
  }
}
```

### GET /invoices/:id/payments
Retrieve payments for an invoice.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Response:**
```json
{
  "status": "success",
  "data": {
    "invoiceId": "60d5ecb74b24c72b8c8b4578",
    "payments": [
      {
        "amount": 1050,
        "paymentMode": "cash",
        "paymentReference": "TXN-1234",
        "paymentTerminalId": "TERM-001",
        "status": "success",
        "receivedBy": "60d5ecb74b24c72b8c8b4567",
        "createdAt": "2023-05-11T10:00:00.000Z"
      }
    ]
  }
}
```

## Taxes

### GET /taxes
List taxes for the current tenant.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Query Parameters:**
- `isActive=true|false`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4580",
      "name": "GST",
      "code": "GST18",
      "rate": 18,
      "isActive": true,
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /taxes
Create a tax record.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Request Body:**
```json
{
  "name": "GST",
  "code": "GST18",
  "rate": 18,
  "isActive": true,
  "components": [
    {
      "name": "CGST",
      "code": "CGST9",
      "rate": 9,
      "type": "percentage"
    },
    {
      "name": "SGST",
      "code": "SGST9",
      "rate": 9,
      "type": "percentage"
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Tax created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4580",
    "name": "GST",
    "code": "GST18",
    "rate": 18,
    "isActive": true,
    "components": [
      {
        "name": "CGST",
        "code": "CGST9",
        "rate": 9,
        "type": "percentage"
      },
      {
        "name": "SGST",
        "code": "SGST9",
        "rate": 9,
        "type": "percentage"
      }
    ],
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /taxes/:id
Get a tax record.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4580",
    "name": "GST",
    "code": "GST18",
    "rate": 18,
    "isActive": true,
    "components": [
      {
        "name": "CGST",
        "code": "CGST9",
        "rate": 9,
        "type": "percentage"
      },
      {
        "name": "SGST",
        "code": "SGST9",
        "rate": 9,
        "type": "percentage"
      }
    ],
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /taxes/:id
Update a tax record.

**Authorization:**
- `tenant` or `staff` via `ACCESS_GROUPS.BILLING_MANAGERS`

**Request Body:**
```json
{
  "rate": 19,
  "isActive": false
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Tax updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4580",
    "name": "GST",
    "code": "GST18",
    "rate": 19,
    "isActive": false,
    "tenantId": "60d5ecb74b24c72b8c8b4568"
  }
}
```

## Staff

### GET /staff
List staff members for the tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4581",
      "name": "Raj Patel",
      "role": "staff",
      "phone": "+91-9876501111",
      "email": "raj.patel@example.com",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /staff
Create a staff member.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Request Body:**
```json
{
  "name": "Raj Patel",
  "role": "staff",
  "phone": "+91-9876501111",
  "email": "raj.patel@example.com"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff member created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4581",
    "name": "Raj Patel",
    "role": "staff",
    "phone": "+91-9876501111",
    "email": "raj.patel@example.com",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /staff/:id
Get a single staff member for the current tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "message": "Staff member retrieved",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4581",
    "name": "Raj Patel",
    "role": "staff",
    "phone": "+91-9876501111",
    "email": "raj.patel@example.com",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /staff/:id
Update a staff member.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Request Body:**
```json
{
  "name": "Raj Patel Updated",
  "role": "supervisor",
  "phone": "+91-9999888777"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Staff member updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4581",
    "name": "Raj Patel Updated",
    "role": "supervisor",
    "phone": "+91-9999888777",
    "email": "raj.patel@example.com",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### DELETE /staff/:id
Delete a staff member from the current tenant.

**Authorization:**
- `admin` or `tenant` via `ACCESS_GROUPS.TENANT_ADMINS`

**Response:**
```json
{
  "status": "success",
  "message": "Staff member deleted",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4581",
    "name": "Raj Patel Updated",
    "role": "supervisor",
    "phone": "+91-9999888777",
    "email": "raj.patel@example.com",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Patients

### GET /patients
List patients for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4571",
      "userId": "60d5ecb74b24c72b8c8b4567",
      "patientCode": "PAT001",
      "name": "Alice Johnson",
      "dateOfBirth": "1990-01-15T00:00:00.000Z",
      "gender": "female",
      "phone": "+91-9876543212",
      "email": "alice@example.com",
      "address": "456 Oak St",
      "emergencyContact": "+91-9876543213",
      "medicalHistory": "No known allergies",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /patients
Create a patient profile (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "userId": "60d5ecb74b24c72b8c8b4567",
  "patientCode": "PAT001",
  "name": "Alice Johnson",
  "dateOfBirth": "1990-01-15",
  "gender": "female",
  "phone": "+91-9876543212",
  "email": "alice@example.com",
  "address": "456 Oak St",
  "emergencyContact": "+91-9876543213",
  "medicalHistory": "No known allergies"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Patient created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4571",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "patientCode": "PAT001",
    "name": "Alice Johnson",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876543212",
    "email": "alice@example.com",
    "address": "456 Oak St",
    "emergencyContact": "+91-9876543213",
    "medicalHistory": "No known allergies",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /patients/:id
Get patient profile (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4571",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "patientCode": "PAT001",
    "name": "Alice Johnson",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876543212",
    "email": "alice@example.com",
    "address": "456 Oak St",
    "emergencyContact": "+91-9876543213",
    "medicalHistory": "No known allergies",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /patients/:id
Update a patient profile.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Request Body:**
```json
{
  "name": "Alice Johnson Updated",
  "phone": "+91-9876543219",
  "medicalHistory": "Allergic to penicillin"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Patient updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4571",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "patientCode": "PAT001",
    "name": "Alice Johnson Updated",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876543219",
    "email": "alice@example.com",
    "address": "456 Oak St",
    "emergencyContact": "+91-9876543213",
    "medicalHistory": "Allergic to penicillin",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### DELETE /patients/:id
Delete a patient profile from the tenant scope.

**Authorization:**
- `admin`, `tenant`, `doctor`, or `staff` via `ACCESS_GROUPS.CLINICAL_OPERATIONS`

**Response:**
```json
{
  "status": "success",
  "message": "Patient deleted",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4571",
    "userId": "60d5ecb74b24c72b8c8b4567",
    "patientCode": "PAT001",
    "name": "Alice Johnson Updated",
    "dateOfBirth": "1990-01-15T00:00:00.000Z",
    "gender": "female",
    "phone": "+91-9876543219",
    "email": "alice@example.com",
    "address": "456 Oak St",
    "emergencyContact": "+91-9876543213",
    "medicalHistory": "Allergic to penicillin",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Beds

### GET /beds
List all beds for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4572",
      "bedNumber": "101",
      "ward": "General Ward",
      "type": "general",
      "status": "available",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "assignedAdmissionId": null,
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /beds
Create a hospital bed (admin, tenant, staff).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "bedNumber": "101",
  "ward": "General Ward",
  "type": "general"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Bed created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4572",
    "bedNumber": "101",
    "ward": "General Ward",
    "type": "general",
    "status": "available",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "assignedAdmissionId": null,
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### GET /beds/available
List available beds for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4572",
      "bedNumber": "101",
      "ward": "General Ward",
      "type": "general",
      "status": "available",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "assignedAdmissionId": null,
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

## Appointments

### GET /appointments
List appointments for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4573",
      "patientId": "60d5ecb74b24c72b8c8b4571",
      "patientName": "Alice Johnson",
      "patientType": "local",
      "appointmentType": "OPD",
      "visitReason": "Regular checkup",
      "doctorId": "60d5ecb74b24c72b8c8b4569",
      "status": "scheduled",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdBy": "60d5ecb74b24c72b8c8b4567",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /appointments
Create an appointment (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "patientId": "60d5ecb74b24c72b8c8b4571",
  "patientName": "Alice Johnson",
  "patientType": "local",
  "appointmentType": "OPD",
  "visitReason": "Regular checkup",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Appointment created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4573",
    "patientId": "60d5ecb74b24c72b8c8b4571",
    "patientName": "Alice Johnson",
    "patientType": "local",
    "appointmentType": "OPD",
    "visitReason": "Regular checkup",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "status": "scheduled",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdBy": "60d5ecb74b24c72b8c8b4567",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Emergencies

### GET /emergencies
List emergency cases for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4574",
      "patientName": "Bob Wilson",
      "patientId": "60d5ecb74b24c72b8c8b4571",
      "emergencyType": "accident",
      "severity": "high",
      "assignedDoctor": "60d5ecb74b24c72b8c8b4569",
      "status": "pending",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-11T10:00:00.000Z"
    }
  ]
}
```

### POST /emergencies
Register an emergency case (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "patientName": "Bob Wilson",
  "patientId": "60d5ecb74b24c72b8c8b4571",
  "emergencyType": "accident",
  "severity": "high",
  "assignedDoctor": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Emergency case created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4574",
    "patientName": "Bob Wilson",
    "patientId": "60d5ecb74b24c72b8c8b4571",
    "emergencyType": "accident",
    "severity": "high",
    "assignedDoctor": "60d5ecb74b24c72b8c8b4569",
    "status": "pending",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### POST /emergencies/:id/admit
Convert emergency case to IPD admission (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "bedNumber": "102",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Emergency admitted to IPD",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4575",
    "patientName": "Bob Wilson",
    "admissionType": "Emergency",
    "bedNumber": "102",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "admitted",
    "admittedAt": "2023-05-11T10:00:00.000Z"
  }
}
```

## Admissions

### GET /admissions
List admissions for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4575",
      "patientName": "Alice Johnson",
      "admissionType": "IPD",
      "appointmentId": "60d5ecb74b24c72b8c8b4573",
      "bedNumber": "101",
      "doctorId": "60d5ecb74b24c72b8c8b4569",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "status": "admitted",
      "admittedAt": "2023-05-11T10:00:00.000Z",
      "dischargedAt": null
    }
  ]
}
```

### POST /admissions/from-opd
Convert OPD appointment to bed allotment (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "appointmentId": "60d5ecb74b24c72b8c8b4573",
  "bedNumber": "101",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "OPD converted to admission",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4575",
    "patientName": "Alice Johnson",
    "admissionType": "OPD",
    "appointmentId": "60d5ecb74b24c72b8c8b4573",
    "bedNumber": "101",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "admitted",
    "admittedAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### POST /admissions/ipd
Create IPD admission directly (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "patientName": "Charlie Brown",
  "admissionType": "IPD",
  "bedNumber": "102",
  "doctorId": "60d5ecb74b24c72b8c8b4569"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "IPD admission created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4576",
    "patientName": "Charlie Brown",
    "admissionType": "IPD",
    "bedNumber": "102",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "admitted",
    "admittedAt": "2023-05-11T10:00:00.000Z"
  }
}
```

### PATCH /admissions/:id/discharge
Discharge a patient and release bed (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "message": "Patient discharged",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4575",
    "patientName": "Alice Johnson",
    "admissionType": "IPD",
    "appointmentId": "60d5ecb74b24c72b8c8b4573",
    "bedNumber": "101",
    "doctorId": "60d5ecb74b24c72b8c8b4569",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "status": "discharged",
    "admittedAt": "2023-05-11T10:00:00.000Z",
    "dischargedAt": "2023-05-12T10:00:00.000Z"
  }
}
```

## Discharge

### POST /discharge
Create discharge summary (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "admissionId": "60d5ecb74b24c72b8c8b4575",
  "summary": "Patient recovered well, no complications",
  "recommendations": "Follow up in 2 weeks, continue medication"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Discharge summary created",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4577",
    "admissionId": "60d5ecb74b24c72b8c8b4575",
    "summary": "Patient recovered well, no complications",
    "recommendations": "Follow up in 2 weeks, continue medication",
    "dischargeDate": "2023-05-12T10:00:00.000Z",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-12T10:00:00.000Z"
  }
}
```

## Invoices

### GET /invoices
List invoices for tenant (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Response:**
```json
{
  "status": "success",
  "data": [
    {
      "_id": "60d5ecb74b24c72b8c8b4578",
      "patientName": "Alice Johnson",
      "admissionId": "60d5ecb74b24c72b8c8b4575",
      "appointmentId": "60d5ecb74b24c72b8c8b4573",
      "amount": 5000,
      "paymentMode": "online",
      "paymentTerminalId": "TERM001",
      "status": "pending",
      "tenantId": "60d5ecb74b24c72b8c8b4568",
      "createdAt": "2023-05-12T10:00:00.000Z"
    }
  ]
}
```

### POST /invoices
Generate invoice and payment record (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "patientName": "Alice Johnson",
  "admissionId": "60d5ecb74b24c72b8c8b4575",
  "appointmentId": "60d5ecb74b24c72b8c8b4573",
  "amount": 5000,
  "paymentMode": "online",
  "paymentTerminalId": "TERM001"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Invoice generated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4578",
    "patientName": "Alice Johnson",
    "admissionId": "60d5ecb74b24c72b8c8b4575",
    "appointmentId": "60d5ecb74b24c72b8c8b4573",
    "amount": 5000,
    "paymentMode": "online",
    "paymentTerminalId": "TERM001",
    "status": "pending",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-12T10:00:00.000Z"
  }
}
```

### PATCH /invoices/:id/pay
Update payment status (admin, tenant, staff, doctor).

**Headers:**
```
Authorization: Bearer <accessToken>
```

**Request Body:**
```json
{
  "status": "paid"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Payment updated",
  "data": {
    "_id": "60d5ecb74b24c72b8c8b4578",
    "patientName": "Alice Johnson",
    "admissionId": "60d5ecb74b24c72b8c8b4575",
    "appointmentId": "60d5ecb74b24c72b8c8b4573",
    "amount": 5000,
    "paymentMode": "online",
    "paymentTerminalId": "TERM001",
    "status": "paid",
    "tenantId": "60d5ecb74b24c72b8c8b4568",
    "createdAt": "2023-05-12T10:00:00.000Z"
  }
}
```

## Notes

- Use `Authorization: Bearer <token>` for protected routes.
- The `tenantId` field must be present for tenant-scoped data.
- All dates should be in ISO 8601 format (e.g., "1990-01-15").
- Enum values are case-sensitive and must match the defined options.
- Patient codes should be unique within each tenant.
- Bed numbers should be unique within each tenant.
- Payment terminal IDs are optional and used for payment gateway integration.
