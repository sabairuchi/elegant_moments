# Milestone 3.1 Learning Guide — Payment & Online Consultation Flow

Welcome to the **M3.1 Learning Guide** for **Elegant Moments**. This document explains how the Online Consultation booking, Sandbox Payment gateway integration, Server-Side Verification, and Status Tracking work together in simple, easy-to-understand terms.

---

## 1. How the Consultation Flow Works

The consultation booking flow bridges prospective and authenticated clients with Elegant Moments' event curators.

1. **Request / Selection**:
   - A client selects their preferred consultation date, time slot, meeting format (HD Video Call, Phone, or In-Person), and provides notes about their wedding vision.
   - A fixed consultation fee (e.g. `$150.00 USD`) is transparently shown. This fee is automatically credited toward the wedding package upon contract signing.

2. **Record Creation**:
   - Submitting the request creates a consultation record in the database with status `REQUESTED` and payment status `UNPAID`.
   - If the user is authenticated, the record is linked directly to their `user_id`.

3. **Payment Step**:
   - The user transitions to the payment gateway step where a payment session is initiated.

---

## 2. How Payment Initiation Works

Payment initiation prepares a secure checkout order before any payment provider processing occurs.

1. **Client Action**: The client clicks **Pay $150.00 Now**.
2. **Server Request (`POST /api/payments/initiate`)**:
   - The client sends the target `consultationId` and preferred payment method (`CARD`).
3. **Duplicate Payment Check**:
   - The server inspects if a completed (`PAID`) payment already exists for this consultation. If so, initiation is rejected with a `409 Conflict` status.
4. **Order Generation**:
   - `paymentGatewayService.createOrder()` generates a unique gateway order ID (e.g. `ord_sbx_1729...`) and computes a cryptographically hashed HMAC SHA256 signature token.
5. **Database Storage**:
   - A payment record with status `PENDING` is saved in PostgreSQL (and persistent storage fallback).
   - The consultation's payment status is updated to `PENDING`.
6. **Client Payload**: The backend responds with the order ID, currency, amount, and public gateway key for the checkout UI.

---

## 3. How Server-Side Verification Works

Server-side verification ensures that payment outcome claims from the client cannot be forged or tampered with.

1. **Client Verification Request (`POST /api/payments/verify`)**:
   - After gateway authorization, the client sends `{ paymentId, gatewayOrderId, gatewayTransactionId, gatewaySignature, mockOutcome }`.
2. **Signature Validation**:
   - The backend re-computes the HMAC SHA256 checksum using the server-side gateway secret (`PAYMENT_GATEWAY_SECRET`).
   - If the submitted signature does not match the server-calculated hash, verification fails immediately with a `400 Bad Request`.
3. **Status Promotion on Success**:
   - Payment status changes to `PAID`.
   - Gateway transaction ID (e.g., `txn_sbx_...`) and signature are stored.
   - Linked consultation payment status is set to `PAID`, and status is set to `CONFIRMED`.
   - An audit log entry (`PAYMENT_SUCCESS`) is generated.
4. **Handling Failure**:
   - If payment fails (e.g., card decline), payment status is set to `FAILED`, reason is recorded, and client is presented with retry options.

---

## 4. How Duplicate Payments Are Prevented

Duplicate payment protection is built into both initiation and verification stages (Idempotency Control):

- **Initiation Guard**: When a client requests `/api/payments/initiate`, the server checks if the consultation's `paymentStatus` is already `PAID`. If `PAID`, the API aborts with `409 Conflict` and code `DUPLICATE_PAYMENT`.
- **Verification Guard**: When `/api/payments/verify` is invoked, the payment service verifies whether `payment.status` is already `PAID`. If so, double-processing is prevented.

---

## 5. Webhooks & Status Updates

In a production payment architecture (such as Razorpay or Stripe):
- **Webhooks**: The payment gateway asynchronously sends server-to-server HTTP POST events (e.g. `payment_intent.succeeded`, `charge.failed`) directly to an endpoint like `/api/payments/webhook`.
- **Validation**: The webhook handler verifies the raw request payload against a `WEBHOOK_SECRET` header signature to prevent spoofing.
- **Asynchronous Reconciliation**: If a user closes their browser before returning to the confirmation page, the webhook handler updates the database so the payment and consultation status are updated automatically.

---

## 6. PostgreSQL Payment Data Structure

The `payments` table connects clients, consultations, enquiries, and weddings without storing sensitive PCI data:

```sql
CREATE TABLE IF NOT EXISTS payments (
    id VARCHAR(255) PRIMARY KEY,
    payment_number VARCHAR(50) UNIQUE NOT NULL,
    consultation_id VARCHAR(255) REFERENCES consultations(id) ON DELETE CASCADE,
    user_id VARCHAR(255) REFERENCES users(id) ON DELETE CASCADE,
    enquiry_id VARCHAR(255) REFERENCES enquiries(id) ON DELETE SET NULL,
    wedding_id VARCHAR(255) REFERENCES weddings(id) ON DELETE SET NULL,
    amount NUMERIC(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USD',
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, PAID, FAILED, REFUNDED
    payment_method VARCHAR(50) DEFAULT 'CARD',
    gateway_transaction_id VARCHAR(255),
    gateway_order_id VARCHAR(255),
    gateway_signature VARCHAR(255),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

---

## 7. Payment Security Best Practices

1. **Never Store Sensitive PCI Data**: Card numbers, CVVs, and banking PINs are processed strictly by the gateway and never hit or persist in application servers or databases.
2. **Keep Secret Keys Server-Side**: `PAYMENT_GATEWAY_SECRET` is kept in environment variables (`.env`) and never exposed in React/frontend bundles.
3. **Enforce RBAC & Data Ownership**:
   - Clients can only initiate, view, or verify payments belonging to their own user ID.
   - Admins can inspect payments across all clients for auditing purposes.
4. **Server-Side Verification**: Client claims of payment success are never trusted without cryptographic signature verification on the server.

---

## 8. Sandbox vs Production Configuration

| Setting | Sandbox Mode (Development / Demo) | Production Mode |
| :--- | :--- | :--- |
| **`PAYMENT_GATEWAY_MODE`** | `sandbox` | `live` |
| **Gateway Keys** | Test API keys (e.g., `sbx_key_...`) | Live Secret Keys from Provider Portal |
| **Card Numbers** | Standard test cards (`4242 •••• •••• 4242`) | Real Customer Credit Cards / UPI |
| **HTTPS Enforcement** | Optional on localhost | Strictly Required (TLS 1.3) |
| **Debug Endpoints** | Enabled for simulation testing | Disabled / Restricted to Admins |

---
