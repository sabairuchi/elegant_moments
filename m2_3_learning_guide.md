# Milestone 2.3 - RBAC & Security Hardening Learning Guide

This document outlines the design and implementation of the authorization and security framework introduced in M2.3 of the Elegant Moments platform.

## 1. Architecture: Authentication vs. Authorization

*   **Authentication (Who you are):** Handled by JWT and `authMiddleware.js`. Validates identity and extracts `req.user`.
*   **Authorization (What you can do):** Handled by `rbacMiddleware.js`. Determines if `req.user` has the rights to perform an action on a specific resource.

We implemented a layered authorization model:
1.  **Role-Based Access Control (RBAC):** Coarse-grained control (e.g., "Are you an admin?").
2.  **Permission-Based Access Control (PBAC):** Fine-grained control (e.g., "Do you have the `users.view` permission?").
3.  **Data Ownership:** Resource-level control (e.g., "Are you the owner of this specific proposal?").

## 2. Centralized Permissions (`server/config/permissions.js`)

Instead of hardcoding roles in every route, we decoupled roles from permissions:
*   `PERMISSIONS`: A dictionary of all possible actions in the system (e.g., `USERS_VIEW`, `WEDDINGS_CREATE`).
*   `ROLE_PERMISSIONS`: A matrix mapping the 5 strict roles (`super_admin`, `admin`, `planner`, `vendor`, `client`) to their respective permissions.
*   `getPermissionsForRoles()`: A utility that resolves a user's roles into a flat array of permissions.

## 3. Middleware Implementation (`server/middleware/rbacMiddleware.js`)

We added two key middleware functions:
*   `requirePermission(permission)`: Checks if `req.user.permissions` includes the required permission. Used extensively on API routes.
*   `checkResourceOwnership(getOwnerUserId)`: Ensures the user owns the resource being accessed, while allowing `super_admin` and `admin` to bypass this check.

## 4. User Management & Audit (`server/services/userService.js` & `auditService.js`)

*   **Audit Logging:** `auditService.js` records sensitive administrative actions (like changing user roles or statuses) to `server/data/activity_logs.json` for accountability.
*   **Admin Features:** Added `listUsers`, `updateUserStatus`, and `updateUserRole` to `userService.js`. We also implemented safeguards to prevent modifying one's own status/role and to prevent deleting/suspending the last remaining `super_admin`.

## 5. Security Hardening

*   **Rate Limiting:** Implemented a lightweight, in-memory sliding window rate limiter (`server/middleware/rateLimiter.js`) that works in both Express and Vercel serverless environments. It protects sensitive endpoints like `/login`, `/register`, and `/reset-password` against brute-force attacks.
*   **CORS Configuration:** Updated `server/index.js` and `api/index.js` to strictly allow requests only from `config.clientUrl` in production environments, mitigating CSRF risks.
*   **Token Protection:** Restricted the `/api/auth/debug-tokens` endpoint to only be accessible in the `development` environment.

## 6. Frontend Integration

*   **Admin Dashboard:** Created `src/pages/AdminUsers.jsx`, providing a UI for administrators to view, search, filter, and modify user roles and statuses.
*   **Protected Routes:** Updated `App.jsx` to secure the `/admin/users` route using the existing `<ProtectedRoute>` component.
*   **Dynamic Navigation:** Updated `src/components/Header.jsx` to conditionally render the "ADMIN" link only if the current user has the `admin` or `super_admin` role.

## Summary
With M2.3 complete, the Elegant Moments backend is secured with a robust, scalable permission system, administrative oversight tools, and essential security safeguards, paving the way for feature development in Milestone 3.
