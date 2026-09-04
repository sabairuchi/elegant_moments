# Milestone 2.4 - Learning Guide: Enquiry & Consultation Management

## Goal
Implement a robust backend and frontend workflow for managing inbound enquiries and consultations, allowing administrators to track prospective clients through a state machine, update statuses, and seamlessly convert qualified leads into registered users.

## Key Concepts

### 1. State Machine for Lead Tracking
In business workflows, entities often move through predefined states. For Enquiries, we introduced:
`NEW -> CONTACTED -> CONSULTATION_SCHEDULED -> CONSULTATION_COMPLETED -> QUALIFIED -> CONVERTED`
And terminal states like `LOST` or `CLOSED`.
Enforcing these states in the backend (`enquiryService.js`) prevents invalid transitions (e.g., reverting a `CONVERTED` lead).

### 2. Single Source of Truth
We enriched the `getAll` endpoints with pagination, search, and filtering on the backend. This ensures the frontend doesn't need to load all data into memory to filter it, which is crucial for scalability.

### 3. Converting Leads to Users
The `convertEnquiryToClient` function bridges the gap between an anonymous enquiry and an authenticated user. 
- It creates a new User entity.
- It generates a secure temporary password.
- It links the `userId` to the `enquiryId`.
- It logs an audit trail event.

### 4. Admin Interfaces
We built `AdminEnquiries` and `AdminConsultations` using the existing design tokens (burgundy, ivory, gold). These interfaces fetch data securely using JWT Bearer tokens and rely on PBAC (Permission-Based Access Control) to restrict access to authorized staff only.

## Summary of Work Done
- **Backend Services**: Updated `enquiryService` and `consultationService` with pagination and status enforcement.
- **Backend Controllers**: Added comprehensive CRUD logic.
- **API Routes**: Protected endpoints using `requirePermission(PERMISSIONS.ENQUIRIES_VIEW)`, etc.
- **Frontend Admin Pages**: Created `AdminEnquiries.jsx` and `AdminConsultations.jsx`.
- **Navigation**: Integrated routes into `App.jsx` and updated `Header.jsx` to show navigation for users with `admin` or `super_admin` roles.
