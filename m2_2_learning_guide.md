# ELEGANT MOMENTS — MILESTONE 2.2 LEARNING GUIDE
## Full-Stack Authentication & Authorization Explained

Welcome to the full-stack learning guide for **Milestone 2.2: Authentication & User Management**! This guide breaks down every core architectural component into beginner-friendly, step-by-step explanations.

---

### 1. How Registration Works
Registration is the process of creating a new user identity in the system.
- **Client Input**: The user enters their First Name, Last Name, Email, Phone, Password, and Password Confirmation on the frontend form (`src/pages/Register.jsx`).
- **Validation**:
  1. Frontend check: Password and Confirm Password must match.
  2. Backend check (`server/services/userService.js`):
     - Checks if an account already exists with that email (case-insensitive).
     - Validates password strength policy (minimum 8 characters, 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character).
- **Default Role Enforcement**: Public registration strictly sets the user's role to `CLIENT`. Public users cannot register as Admin, Super Admin, Planner, or Vendor.
- **Hashing**: The password is passed through `bcrypt` before saving.
- **Token Generation**: An `EMAIL_VERIFICATION` token is generated and associated with the new user record.

---

### 2. How Passwords Are Securely Stored
- **Never Store Plaintext**: Passwords are NEVER saved in raw readable form. Storing plain text passwords means a database leak exposes all user passwords instantly.
- **Cryptographic Hashing (Bcrypt)**:
  - We use `bcryptjs` with 10 salt rounds.
  - A **salt** is a random string added to the password before hashing to prevent rainbow table attacks.
  - A **hash function** is one-way: `Password123!` -> `$2a$10$wN9P3Q...`. You cannot mathematically reverse the hash to retrieve the original password.
  - When a user logs in, `bcrypt.compare(inputPassword, storedHash)` re-hashes the input password with the stored salt to verify if they produce the exact same output.

---

### 3. How Login Works
Login validates a user's identity based on credentials.
1. The user submits their email and password on `/login`.
2. Backend looks up the user by email (`userService.findByEmail`).
3. If no user is found, returns `401 Unauthorized` with a generic message ("Invalid email or password").
4. If found, runs `bcrypt.compare(inputPassword, user.passwordHash)`.
5. Checks `accountStatus`: If status is `SUSPENDED` or `isActive === false`, returns `403 Forbidden` ("Your account has been suspended").
6. If credentials match and account is active, signs a JSON Web Token (JWT) containing `{ id, email, role, roles }`.
7. Returns HTTP 200 with `{ token, user: safeUser }`. The response NEVER includes `passwordHash` or secret tokens.

---

### 4. How Authentication State Is Maintained
- **Token-Based Auth**: The backend returns a signed JWT on login.
- **Client Storage**: The React application saves the JWT token in `localStorage` (`elegant_moments_auth_token`) via `AuthContext.jsx`.
- **API Requests**: For subsequent protected requests, the frontend includes an HTTP header:
  `Authorization: Bearer <token>`
- **Session Verification**: On page refresh, `AuthContext` calls `GET /api/auth/me` with the stored Bearer token. The backend verifies the JWT signature and returns the latest safe user profile.

---

### 5. Authentication vs Authorization
- **Authentication ("Who are you?")**:
  - Verifies identity. Example: Entering your email/password or presenting a valid JWT token proves you are *Eleanor Vanderbilt*.
- **Authorization ("What are you allowed to do?")**:
  - Verifies permissions. Example: Eleanor is authenticated as a `CLIENT`. Can she access `/super-admin`? Authorization checks her role and denies access with a `403 Forbidden` response because she lacks `super_admin` privileges.

---

### 6. How Roles Are Checked
- **Role Hierarchy / Enforcement**:
  - Elegant Moments supports exactly 5 roles: `super_admin`, `admin`, `client`, `planner`, `vendor`.
- **Backend Role Guard (`rbacMiddleware.js`)**:
  ```js
  export const requireRoles = (...allowedRoles) => {
    return (req, res, next) => {
      const userRoles = req.user.roles || [req.user.role];
      const hasRole = userRoles.some(r => allowedRoles.includes(r));
      if (!hasRole) return res.status(403).json({ message: 'Access denied' });
      next();
    };
  };
  ```
- **Frontend Guard (`ProtectedRoute.jsx`)**:
  Inspects `user.role` from `useAuth()`. If the current route requires `['admin']` and the user is `client`, displays an interactive restricted access notice.

---

### 7. How Protected Routes Work
1. Route definition in `App.jsx`:
   ```jsx
   <Route path="/admin" element={
     <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
       <AdminDashboardPlaceholder />
     </ProtectedRoute>
   } />
   ```
2. Execution sequence:
   - User navigates to `/admin`.
   - `ProtectedRoute` checks `isAuthenticated`.
   - If NOT authenticated -> Redirects to `/login` with `from` history location so the user lands back on `/admin` after logging in.
   - If authenticated BUT role is NOT in allowed roles -> Shows "Access Restricted" screen with option to go to their own profile or home.
   - If authenticated AND authorized -> Renders the protected page.

---

### 8. How Email Verification Works
- **Token Generation**: Upon registration or request, a 32-byte cryptographically secure random token (`crypto.randomBytes(32).toString('hex')`) is created with a 24-hour expiration (`expiresAt`).
- **Verification Request**:
  User opens `/verify-email?token=xyz`.
- **Backend Handling (`userService.verifyEmailToken`)**:
  1. Finds token matching string and type `EMAIL_VERIFICATION`.
  2. Ensures `used === false` and `expiresAt > current_time`.
  3. Marks token as `used = true`.
  4. Updates user `isVerified = true` and `accountStatus = 'ACTIVE'`.

---

### 9. How Password Reset Works
- **Request Step (`/forgot-password`)**:
  1. User enters their email.
  2. Backend generates a 1-hour single-use reset token (`PASSWORD_RESET`).
  3. **Anti-Account Enumeration**: Response ALWAYS says "If an account exists with that email address, password reset instructions have been sent" regardless of whether the email was found. This prevents attackers from testing lists of emails to see who has an account.
- **Reset Step (`/reset-password?token=xyz`)**:
  1. User submits new password and confirm password.
  2. Backend validates token validity, single-use state, and expiration.
  3. Validates password strength policy.
  4. Hashes new password with `bcrypt` and updates user record.
  5. Invalidates reset token so it can never be reused.

---

### 10. How Data Ownership Will Work Later (Foundation)
In upcoming milestones (weddings, proposals, bookings):
- A Client can only query weddings where `wedding.client_profile_id === client.id`.
- A Planner can only edit weddings where `wedding.planner_profile_id === planner.id`.
- A Vendor can only view services/bids associated with `vendor_profile_id === vendor.id`.
- **Foundation Middleware (`checkResourceOwnership`)**:
  ```js
  export const checkResourceOwnership = (getOwnerUserId) => {
    return async (req, res, next) => {
      if (['super_admin', 'admin'].includes(req.user.role)) return next();
      const ownerUserId = typeof getOwnerUserId === 'function' ? await getOwnerUserId(req) : req.params[getOwnerUserId];
      if (req.user.id !== ownerUserId) return res.status(403).json({ message: 'Forbidden' });
      next();
    };
  };
  ```

---

### 11. Why This Authentication Strategy Fits This Project
- **Layered Node/Express Integration**: Matches the existing Express REST architecture built in Milestone 2.1.
- **Stateless Bearer JWT**: Decouples API authentication from server session state, keeping the server lean and scalable for future mobile/SPA integrations.
- **Schema Parity**: Data models in `users.json` directly map to the PostgreSQL DDL in `server/db/schema.sql` (UUIDs, role mappings, account statuses, verification flags).

---

### 12. Security Risks Prevented
- **Password Exposure**: Salting and bcrypt hashing prevent plain text leakage.
- **Brute Force & Enumeration**: Anti-enumeration response on forgot-password; strict validation policies on registration and reset.
- **Unauthorized Privilege Escalation**: Public registration hardcoded to `client` role; backend role middleware checks all protected routes.
- **Token Reuse**: Single-use token invalidation for password resets and email verification.
- **Suspended Account Abuse**: Middleware rejects requests immediately for accounts with `accountStatus === 'SUSPENDED'`.
