# Elegant Moments - Milestone 2.5: Wedding Management Core

## Overview
Milestone 2.5 establishes the core "Wedding" entity, forming the backbone of the client lifecycle. It transitions a prospective lead (Enquiry) into a formal project (Wedding) managed by a Planner.

## Core Concepts

### 1. Wedding Entity Lifecycle
- **Creation**: An admin or super admin can manually create a Wedding, or the system can auto-generate one when an Enquiry is "Converted to Client".
- **Statuses**: Follows a strict, centralized lifecycle (`PLANNING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`).
- **Data Shape**: Stores event metadata (date, guest count, budget, venue reference), client links (`clientId`), and planner assignments (`assignedPlannerId`).

### 2. Authorization and Ownership (RBAC)
- **Role-Based Access Control (RBAC)**: Ensures endpoints like `POST /api/weddings` are protected and restricted to authorized roles (e.g., `admin`, `super_admin`) via `requirePermission(PERMISSIONS.WEDDINGS_CREATE)`.
- **Resource Ownership Middleware**: Planners and Clients both need access to specific weddings, but shouldn't see others. `checkResourceOwnership` is used with a custom owner resolver function (`getWeddingOwner`) that evaluates the requested wedding and returns `req.user.id` only if the user matches the `clientId` or `assignedPlannerId`.
- **Admin Override**: The middleware inherently allows `admin` and `super_admin` to bypass ownership checks.

### 3. Controller vs Service Pattern
- **Service Layer (`weddingService.js`)**: Pure data operations, reads/writes JSON files, validates strict status rules. Unaware of HTTP contexts.
- **Controller Layer (`weddingController.js`)**: Translates HTTP requests to Service calls. Extracts `req.user` context for filtering. Triggers the `auditService` for all state changes.

### 4. Audit Logging
Every significant change is tracked for accountability:
- `CREATE_WEDDING`
- `UPDATE_WEDDING`
- `UPDATE_WEDDING_STATUS`
- `ASSIGN_PLANNER`
- `CONVERT_ENQUIRY` (logs the creation of both the user and the wedding record).

### 5. Architectural Flow to Future Modules
- **Services/Venues**: The wedding entity holds a `venueReference` but will soon link directly to actual `Venue` models (M2.6/M2.7).
- **Proposals & Bookings**: A Wedding acts as the parent container. Planners will create Proposals under a Wedding, which then convert into Bookings.
- **Vendor Constraints**: Vendors currently have no access to the `/api/weddings` endpoints, maintaining security over private event details.
