# Hospital Management System (HMS)

Backend service built with Node.js, Koa, MongoDB and JWT authentication.

## Features
- Role-based authentication with JWT + refresh tokens
- Multi-tenant support by tenantId scope
- OPD/IPD registration and admission workflows
- Bed allotment and discharge summary
- Invoice generation with online/offline payment modes
- Versioned API under `/api/v1`
- Docker and CI/CD ready

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
# hospitility-hms
