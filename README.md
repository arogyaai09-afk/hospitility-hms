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

## API documentation
See `docs/api.md` for route definitions and sample requests.
# hospitility-hms
