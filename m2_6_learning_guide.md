# M2.6 Learning Guide: Services & Venues Management

## Goal
Implement the Services and Venues Management systems, allowing Elegant Moments administrators to curate a luxury vendor network and exclusive venues, while allowing clients to browse these options securely.

## Architecture

1. **Service Layer (`serviceService.js`, `venueService.js`)**
   - Built to handle JSON persistence.
   - Initialized with strict enumerations for statuses (`ACTIVE`, `INACTIVE`, `ARCHIVED`) and categories.
   - Gracefully handles initial `ENOENT` to auto-create JSON files upon first read.

2. **Controllers & Routing**
   - Mapped to `/api/services` and `/api/venues`.
   - Secured with existing JWT middleware (`requireAuth`) and role-based permissions (`requirePermissions`).
   - Integrated with `auditService.js` to log all create, update, and delete actions for auditing.

3. **RBAC Modifications**
   - Updated `server/config/permissions.js` to grant the `client` role `PERMISSIONS.SERVICES_VIEW` and `PERMISSIONS.VENUES_VIEW`. 
   - This ensures clients can view the curated lists without modifying them.

4. **UI Implementation**
   - Created Admin pages with list and detail views (`AdminServices.jsx`, `AdminServiceDetails.jsx`, etc.).
   - Created Client-facing browsing pages matching the luxury design system (`ClientServices.jsx`, `ClientVenues.jsx`).
   - Designed responsive CSS Grid layouts for image-heavy asset displays.

## Key Learnings & Nuances

- **JSON Fallbacks**: Implemented strict ID generation using `crypto.randomUUID()` instead of `uuid` to avoid dependency issues on Vercel (as discovered in M2.5).
- **Arrays vs Strings**: Handled the `amenities` field as a dynamic array with chip-style UI for adding and removing tags dynamically.
- **Client vs Admin Fetching**: The `ClientVenues` component specifically fetches `/api/venues?status=ACTIVE` to ensure clients never see archived or drafted listings.
- **Wedding Integration Validation**: Modified `weddingService.js` to strictly validate `selectedVenueId` and `selectedServices` against their respective databases when updating a wedding. Added specific Audit Logging for venue and service updates.
- **UI Integration**: Extended `AdminWeddingDetails.jsx` and `ClientWedding.jsx` to fetch active system Venues and Services, allowing interactive selection and rendering in the dashboard.
- **Testing**: Added `tests/m2_6_services_venues.test.js` to verify CRUD and validation when attaching a venue and services to a wedding.

## Status
Milestone 2.6 is fully completed, integrated with the Wedding system, and tested.
