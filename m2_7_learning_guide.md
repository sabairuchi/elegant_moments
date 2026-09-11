# M2.7 Learning Guide: Client / Couple Dashboard

## Goal
Build the Client / Couple Dashboard for Elegant Moments, providing a personalized, luxury experience where clients can review their wedding overview, countdown timer, assigned planner, venue, curated services, enquiries, and consultations—with strict backend ownership enforcement.

## Architecture & Implementation

1. **Backend Security & RBAC Scoping**
   - **Enquiry & Consultation Scoping**: Updated `enquiryController.js` and `consultationController.js` (and services) so that when a request originates from a user with the `client` role, results are automatically filtered by `req.user.email`.
   - **Resource Ownership Verification**: Single resource endpoints (`getEnquiryById`, `getConsultationById`) check that the resource's email matches the authenticated client's email, returning `403 Forbidden` on mismatched ownership.
   - **Sanitized Client Updates**: Added `PERMISSIONS.WEDDINGS_UPDATE` to the `client` role, but enforced strict server-side sanitization in `weddingController.js`. Clients can update allowed fields (`weddingName`, `guestCount`, `budget`, `notes`), but administrative fields (`status`, `assignedPlannerId`, `selectedVenueId`, `selectedServices`) are stripped on the backend if submitted by a client.

2. **Frontend Component Architecture**
   - **`ClientDashboardNav.jsx` / `ClientSubNav.jsx`**: Created a cohesive, elegant tabbed sub-navigation bar rendered across all client workspace routes.
   - **`ClientDashboard.jsx`**: Main overview dashboard featuring a personalized welcome message, live countdown timer to the wedding date, assigned lead planner summary, selected venue preview, curated services chips, upcoming consultation highlight, and recent enquiry metrics.
   - **`ClientWedding.jsx`**: Enhanced "My Wedding" detail page supporting view & inline edit mode for client-editable fields (guest count, budget, vision notes, wedding title).
   - **`ClientEnquiries.jsx`**: Dedicated page for clients to track all submitted enquiries and view upcoming and past consultations with video meeting links.
   - **`ClientServices.jsx` & `ClientVenues.jsx`**: Integrated sub-navigation while keeping browsing views free of admin-only controls.

3. **Routing & Protected Foundations**
   - Configured protected routes under `/dashboard`, `/dashboard/wedding`, and `/dashboard/enquiries` using `ProtectedRoute` mapped to `['client', 'admin', 'super_admin']`.

## Key Learnings & Nuances

- **Multi-tenant Email Scoping**: Since enquiries can precede user account creation, matching logged-in client accounts to historical enquiries via verified email address ensures seamless data access without complex schema changes.
- **Backend Field-Level Sanitization**: Rather than trusting frontend route protection, stripping administrative fields (`status`, `assignedPlannerId`) inside `weddingController.js` when `req.user.role === 'client'` guarantees backend security against tampered payload requests.
- **Unit & Integration Testing**: Created `tests/m2_7_client_dashboard.test.js` to verify enquiry submission, email-scoped filtering, single enquiry ownership protection, and administrative field sanitization on wedding updates.

## Status
Milestone 2.7 is fully completed, tested with 100% test suite pass rate (21/21 tests passing across all 4 test files), and verified with a clean production bundle build (`vite build`).
