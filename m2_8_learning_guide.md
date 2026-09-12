# M2.8 Learning Guide: Planner & Vendor Management Workflows

## Goal
Build the real Planner and Vendor management workflows and dashboards for Elegant Moments using the existing M2.1–M2.7 architecture. Planners oversee assigned client weddings, manage venue/service allocations, update statuses, and track planning notes. Partner Vendors manage business profiles, view catalog services, track assigned wedding requests, and confirm service fulfillment while strictly maintaining client data privacy.

---

## Architecture & Implementation

### 1. Backend Security & Role-Based Ownership Scoping

- **Planner Ownership Scoping (`planner`)**:
  - `GET /api/weddings`: Filters weddings by `assignedPlannerId = req.user.id`. Planners only see client weddings explicitly assigned to them.
  - `GET /api/weddings/:id` & `PATCH /api/weddings/:id`: Protected by ownership verification (`getWeddingOwner`). Planners can update assigned wedding status (`PLANNING`, `CONFIRMED`, `IN_PROGRESS`, `COMPLETED`, `CANCELLED`), planning notes, assigned venue, and allocated services.

- **Vendor Scoping & Privacy Compliance (`vendor`)**:
  - `GET /api/weddings`: Filters weddings where `wedding_services` contains vendor services (`vendorId`).
  - **Client Privacy Boundary**: Non-vendor private fields (`internalNotes`, `adminNotes`, `notes`) are stripped server-side before returning the API payload. Client full names are sanitized to first name + privacy indicator (`Eleanor (Client)`), preserving privacy while exposing event date, capacity, venue, and service allocation status.
  - `GET /api/users/vendor-profile`: Returns vendor business profile details (Company Name, Category, Verified Partner Status, Rating, Website, Instagram).

---

### 2. Frontend Component Architecture

- **`PlannerDashboard.jsx` (`/planner`)**:
  - **Welcome & Stats Bar**: Renders planner credentials, total assigned weddings count, active planning count, and confirmed venue count.
  - **Assigned Weddings Roster**: Displays wedding title, client contact details, event date, guest count, estimated budget, assigned venue, selected services tags, and planner notes.
  - **Update Planning Modal**: Allows planners to update wedding status, change assigned venue, toggle allocated services, and edit operational notes.

- **`VendorDashboard.jsx` (`/vendor`)**:
  - **Business Profile Banner**: Displays verified partner status, rating, category, company name, website, and Instagram credentials.
  - **Tabbed Interface**:
    1. **Wedding Requests & Assignments**: List of assigned wedding service requests with event date, venue location, capacity, service allocation, and fulfillment confirmation badge.
    2. **Services Offered**: Catalog of active services provided by the vendor.
    3. **Business Profile Details**: Verification status and client privacy notice explanation.

- **Navigation Integration (`Header.jsx` & `App.jsx`)**:
  - Replaced placeholders with real `PlannerDashboard` and `VendorDashboard` routes in `App.jsx`.
  - Added dynamic `PLANNER PORTAL` (`/planner`) and `VENDOR PORTAL` (`/vendor`) header links for authenticated users.

---

## Entity Relationships (Planner / Vendor → Weddings → Services → Venues)

```
[User / Account]
   ├── role: 'planner' ──► Assigned Weddings (wedding.assignedPlannerId = planner.id)
   │                           ├── Client Info (wedding.clientName, wedding.clientId)
   │                           ├── Venue Allocation (wedding_venues ──► venues.id)
   │                           └── Service Allocation (wedding_services ──► services.id)
   │
   └── role: 'vendor'  ──► Service Bookings (wedding_services ──► services.category/id)
                               ├── Event Date & Guest Capacity
                               ├── Event Venue Location
                               └── Sanitized Client Privacy Boundary
```

---

## Verification & RBAC Matrix

| Role | Route Scoping | Weddings List Scoping | Wedding Update Allowed | Client Private Notes Exposed |
|---|---|---|---|---|
| **Super Admin** | `/admin`, `/planner`, `/vendor` | All Weddings | All Fields | Yes |
| **Admin** | `/admin`, `/planner`, `/vendor` | All Weddings | All Fields | Yes |
| **Planner** | `/planner` | Assigned Only (`assignedPlannerId`) | Status, Notes, Venue, Services | Yes (Assigned) |
| **Vendor** | `/vendor` | Service Assigned Only | Fulfillment Status | **No (Sanitized)** |
| **Client** | `/dashboard` | Client Owned Only (`clientId`) | Client Fields Only | **No (Sanitized)** |
