# HMS Architecture and Folder Structure

## Overview
This backend application is organized using a modular MVC-inspired structure. Each feature lives in its own module folder so the codebase can later be split into microservices.

## Key folders
- `config/`: shared configuration and database connection logic.
- `src/modules/`: each module contains model, service, controller, and routes for a business domain.
  - `auth/` handles login, register, JWT, and role-based access.
  - `tenant/` supports multi-tenant registration and tenant isolation.
  - `patient/` tracks patient profiles and tenant-scoped patient data.
  - `bed/` manages bed inventory and availability.
  - `emergency/` tracks emergency cases and admission conversion.
  - `appointment/`, `admission/`, `discharge/`, `invoice/` support the patient lifecycle.
- `src/middlewares/`: reusable authentication, authorization, and error handling.
- `src/utils/`: shared response helpers.

## Multi-tenant strategy
- Every primary document includes `tenantId`.
- `admin` users can manage all tenants.
- `tenant` users are scoped to a single tenant and only see their own records.

## Versioned API
Routes are namespaced under `/api/v1` so future backward-compatible changes are possible.
