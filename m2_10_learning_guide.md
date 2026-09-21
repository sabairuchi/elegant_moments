# M2.10 Learning Guide: PostgreSQL Migration & Production Hardening

## Goal
Transition the **Elegant Moments** platform into a fully production-ready backend by migrating persistent data to PostgreSQL, enforcing zero-disk writes in production, securing environment configuration, hardening authentication and RBAC, and preparing for serverless deployment on platforms like Vercel.

---

## Key Concepts & Architecture

### 1. PostgreSQL Database & Connection Pooling
- **Relational Schema**: Utilizes `schema.sql` defining 22 core tables (`roles`, `users`, `user_roles`, `client_profiles`, `planner_profiles`, `vendor_profiles`, `enquiries`, `consultations`, `weddings`, `venues`, `services`, `service_packages`, `wedding_venues`, `wedding_services`, `proposals`, `proposal_items`, `bookings`, `documents`, `notifications`, `activity_logs`, `tokens`).
- **Flexible Identifier Strategy**: Primary keys use `VARCHAR(255)` compatible with standard UUIDs and legacy string identifiers (`usr-superadmin-001`, `wed-001`, `ENQ-123456`, `CON-123456`).
- **Serverless Connection Management**:
  - Global `pg.Pool` instance shared across hot lambda function invocations.
  - Pool configuration set with `max: 10`, `idleTimeoutMillis: 30000`, `connectionTimeoutMillis: 5000`.
  - SSL configured dynamically (`rejectUnauthorized: false` for production cloud Postgres like Supabase / Neon / Render).

---

### 2. Zero-Disk Writes in Production
- **Read-Only Serverless Compliance**: In production mode (`NODE_ENV=production`), disk writes to `server/data/*.json` files are completely bypassed to prevent Vercel/Lambda read-only file system crashes (`EROFS`).
- **In-Memory & Database Dual Layering**: Data writes mutate PostgreSQL when connected, and keep transient in-memory state during offline/testing modes without touching local JSON files on disk.

---

### 3. Production Security & Environment Hardening
- **Environment Variables**:
  - `DATABASE_URL` / `POSTGRES_URL`: Connection string for PostgreSQL database.
  - `JWT_SECRET`: High-entropy secret key for signing JWTs in production.
  - `NODE_ENV`: Set to `production` for deployed environments.
  - `CLIENT_URL`: Authorized origin for CORS verification.
- **Rate Limiting**: Applied to sensitive public endpoints (`/api/auth/register`, `/api/auth/login`, `/api/auth/forgot-password`, `/api/auth/resend-verification`).
- **Debug Endpoints & Dev Token Scrubbing**:
  - Dev-only endpoints like `/api/auth/debug-tokens` return 404 in production.
  - `verificationUrlDevOnly` and `resetUrlDevOnly` fields are automatically stripped from API JSON responses in production.
- **Sanitized Production Error Handling**:
  - Internal server stack traces and raw database errors are hidden from client responses when `NODE_ENV=production` to prevent information disclosure.

---

## Database Entity Mapping Matrix

| Entity | PostgreSQL Table | Primary Key | Relationships |
|---|---|---|---|
| **Users** | `users` | `id` | `roles`, `client_profiles`, `planner_profiles`, `vendor_profiles` |
| **Enquiries** | `enquiries` | `id` | `consultations` |
| **Consultations** | `consultations` | `id` | `enquiries` |
| **Services** | `services` | `id` | `vendor_profiles`, `wedding_services` |
| **Venues** | `venues` | `id` | `wedding_venues` |
| **Weddings** | `weddings` | `id` | `client_profiles`, `planner_profiles`, `wedding_venues`, `wedding_services`, `proposals`, `bookings` |
| **Proposals** | `proposals` | `id` | `weddings`, `proposal_items` |
| **Bookings** | `bookings` | `id` | `weddings`, `proposals` |
| **Audit Logs** | `activity_logs` | `id` | `users` |
| **Auth Tokens** | `tokens` | `id` | `users` |

---

## Production Deployment Checklist

1. **Configure Environment Variables**:
   ```bash
   DATABASE_URL=postgres://user:password@ep-host.postgres.database.azure.com:5432/db_name?sslmode=require
   JWT_SECRET=super_secret_jwt_key_prod_987654
   NODE_ENV=production
   CLIENT_URL=https://elegantmoments.vercel.app
   ```
2. **Execute Database Schema & Initial Seeding**:
   - Running `initDb()` automatically creates all required PostgreSQL tables and seeds default services and venues if empty.
3. **Verify CORS & Rate Limiting**:
   - CORS origin enforces restriction to `CLIENT_URL`.
   - Sliding-window rate limiter prevents brute-force attempts on sensitive routes.
4. **Run Integration Test Suite**:
   ```bash
   npx vitest run
   ```
