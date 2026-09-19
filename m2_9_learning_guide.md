# M2.9 Learning Guide: Proposals & Bookings Workflows

## Goal
Build the end-to-end Proposals and Bookings workflows using the existing M2.1–M2.8 architecture. Planners and Admins construct luxury proposal options for client weddings with line-item pricing and automated total calculations. Clients review proposals to approve, decline, or request adjustments. Approved proposals seamlessly generate binding service bookings with vendor scoping and audit logging.

---

## Architecture & Implementation

### 1. Proposals Engine & Financial Line-Item Calculation
- **Proposal Lifecycle**: `DRAFT` ➔ `SENT` ➔ `APPROVED` / `CHANGES_REQUESTED` / `REJECTED` / `EXPIRED`.
- **Financial Math**:
  - `Subtotal` = \(\sum (\text{quantity} \times \text{unitPrice})\)
  - `Final Total` = \(\max(0, \text{Subtotal} + \text{TaxAmount} - \text{DiscountAmount})\)
- **Line Items**: Links selected catalog services or custom line items to the proposal, retaining quantities and agreed pricing.

### 2. Bookings & 1-Click Approved Proposal Conversion
- **Booking Lifecycle**: `PENDING` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED` ➔ `CANCELLED`.
- **Automated Generation**: Once a client approves a proposal (`APPROVED`), a booking can be generated with 1 click via `POST /api/bookings/from-proposal/:proposalId`.
- **Relationship Linking**: Bookings automatically link the proposal, wedding, venue, and assigned service vendors.

### 3. Backend Security & Role Scoping
- **Admin / Super Admin**: Full management access across all proposals and bookings.
- **Planner Scoping**: Planners only view and manage proposals/bookings for weddings where `assignedPlannerId = req.user.id`.
- **Client Scoping**: Clients only view proposals/bookings for weddings where `clientId = req.user.id`, and can update proposal status to `APPROVED`, `CHANGES_REQUESTED`, or `REJECTED`.
- **Vendor Scoping**: Vendors view bookings only if the booking contains services provided by their vendor ID (`vendorId`). Client personal contact info is sanitized to preserve privacy boundaries.

### 4. Security Audit Logging
- All critical actions emit structured audit records via `auditService.logAction`:
  - `PROPOSAL_CREATED`, `PROPOSAL_UPDATED`, `PROPOSAL_STATUS_*`, `PROPOSAL_DELETED`
  - `BOOKING_CREATED`, `BOOKING_CREATED_FROM_PROPOSAL`, `BOOKING_UPDATED`, `BOOKING_CANCELLED`

---

## Entity Relationships

```
[Wedding]
   ├── Client (clientId)
   ├── Planner (assignedPlannerId)
   │
   ├──► [Proposal] (status: DRAFT | SENT | APPROVED | CHANGES_REQUESTED | REJECTED)
   │       ├── Proposal Items (serviceId, description, quantity, unitPrice, subtotal)
   │       └── Financial Totals (subtotal, taxAmount, discountAmount, finalAmount)
   │
   └──► [Booking] (status: PENDING | CONFIRMED | IN_PROGRESS | COMPLETED | CANCELLED)
           ├── Linked Proposal (proposalId)
           ├── Assigned Venue (venueId)
           └── Assigned Services & Vendor Scoping (serviceIds, vendorIds)
```

---

## RBAC & Security Matrix

| Role | View Proposals | Create/Edit Proposals | Respond to Proposal | View Bookings | Edit/Cancel Booking | Data Sanitization |
|---|---|---|---|---|---|---|
| **Super Admin / Admin** | All | All | Yes | All | All | None |
| **Planner** | Assigned Weddings | Assigned Weddings | Yes | Assigned Weddings | Assigned Weddings | None |
| **Client** | Owned Wedding Only | ❌ No | Approve / Request Changes / Decline | Owned Wedding Only | ❌ No | Internal Notes Hidden |
| **Vendor** | ❌ No | ❌ No | ❌ No | Service Bookings Only | ❌ No | Client Info Sanitized |
