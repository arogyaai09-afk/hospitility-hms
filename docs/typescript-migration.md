# TypeScript migration plan for HMS

## Phase 1 - Bootstrap TypeScript
- Add TypeScript, ts-node, and Node type packages.
- Create a TypeScript entrypoint with the same behavior as the current app.
- Keep existing JavaScript modules working while the app runs through TypeScript.

## Phase 2 - Convert core modules
Convert the modules in this order:
1. config and shared utilities
2. auth module
3. tenant and user-related modules
4. patient/doctor/staff modules
5. appointments, admissions, beds, emergencies
6. invoices and taxes
7. discharge and final cleanup

## Phase 3 - Add types
- Introduce interfaces for request/response payloads.
- Add models and DTOs for each domain.
- Replace `any` with specific types gradually.

## Phase 4 - Improve developer workflow
- Add linting with ESLint.
- Add testing with Jest or Vitest.
- Add strict TypeScript settings once the project is migrated.
