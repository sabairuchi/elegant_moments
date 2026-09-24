import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { query } from '../db/index.js';
import { paymentGatewayService } from './paymentGatewayService.js';
import { consultationService } from './consultationService.js';
import { auditService } from './auditService.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PAYMENTS_FILE = path.join(__dirname, '..', 'data', 'payments.json');

let memoryPayments = null;

const ensureFileExists = () => {
  if (process.env.NODE_ENV === 'production') return;
  try {
    const dir = path.dirname(PAYMENTS_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(PAYMENTS_FILE)) fs.writeFileSync(PAYMENTS_FILE, JSON.stringify([], null, 2), 'utf-8');
  } catch (err) {
    // Read-only environment fallback
  }
};

const readData = () => {
  if (memoryPayments) return memoryPayments;
  ensureFileExists();
  try {
    if (process.env.NODE_ENV !== 'production' && fs.existsSync(PAYMENTS_FILE)) {
      const raw = fs.readFileSync(PAYMENTS_FILE, 'utf-8');
      memoryPayments = JSON.parse(raw);
    } else {
      memoryPayments = [];
    }
  } catch (err) {
    memoryPayments = [];
  }
  return memoryPayments;
};

const writeData = (data) => {
  memoryPayments = data;
  if (process.env.NODE_ENV === 'production') return true;
  ensureFileExists();
  try {
    fs.writeFileSync(PAYMENTS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return true;
  }
};

const mapRowToPayment = (row) => ({
  id: row.id,
  paymentNumber: row.payment_number || row.id,
  consultationId: row.consultation_id || row.consultationId || null,
  userId: row.user_id || row.userId || null,
  enquiryId: row.enquiry_id || row.enquiryId || null,
  weddingId: row.wedding_id || row.weddingId || null,
  amount: Number(row.amount) || 0,
  currency: row.currency || 'USD',
  status: row.status || 'PENDING',
  paymentMethod: row.payment_method || row.paymentMethod || 'CARD',
  gatewayTransactionId: row.gateway_transaction_id || row.gatewayTransactionId || null,
  gatewayOrderId: row.gateway_order_id || row.gatewayOrderId || null,
  gatewaySignature: row.gateway_signature || row.gatewaySignature || null,
  failureReason: row.failure_reason || row.failureReason || null,
  createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
});

export const PAYMENT_STATUSES = ['PENDING', 'PAID', 'FAILED', 'REFUNDED'];

export const paymentService = {
  async getAllPayments(options = {}) {
    const { userId, consultationId, status, search, page = 1, limit = 10 } = options;

    try {
      let sql = 'SELECT * FROM payments WHERE 1=1';
      const params = [];
      let paramIdx = 1;

      if (userId) {
        sql += ` AND user_id = $${paramIdx++}`;
        params.push(userId);
      }
      if (consultationId) {
        sql += ` AND consultation_id = $${paramIdx++}`;
        params.push(consultationId);
      }
      if (status) {
        sql += ` AND status = $${paramIdx++}`;
        params.push(status);
      }
      if (search) {
        sql += ` AND (LOWER(payment_number) LIKE $${paramIdx} OR LOWER(gateway_transaction_id) LIKE $${paramIdx})`;
        params.push(`%${search.toLowerCase()}%`);
        paramIdx++;
      }

      sql += ' ORDER BY created_at DESC';
      const res = await query(sql, params);
      const payments = res.rows.map(mapRowToPayment);

      const total = payments.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginated = payments.slice(offset, offset + limit);

      return {
        payments: paginated,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    } catch (dbErr) {
      let payments = readData();

      if (userId) payments = payments.filter(p => p.userId === userId);
      if (consultationId) payments = payments.filter(p => p.consultationId === consultationId);
      if (status) payments = payments.filter(p => p.status === status);
      if (search) {
        const s = search.toLowerCase();
        payments = payments.filter(p =>
          (p.paymentNumber && p.paymentNumber.toLowerCase().includes(s)) ||
          (p.gatewayTransactionId && p.gatewayTransactionId.toLowerCase().includes(s))
        );
      }

      const total = payments.length;
      const totalPages = Math.ceil(total / limit);
      const offset = (page - 1) * limit;
      const paginated = payments.slice(offset, offset + limit);

      return {
        payments: paginated,
        pagination: {
          total,
          page: parseInt(page, 10),
          limit: parseInt(limit, 10),
          totalPages,
        }
      };
    }
  },

  async getPaymentById(id) {
    try {
      const res = await query('SELECT * FROM payments WHERE id = $1', [id]);
      if (res.rows.length > 0) {
        return mapRowToPayment(res.rows[0]);
      }
    } catch (dbErr) {
      // Memory fallback
    }

    const payments = readData();
    const payment = payments.find(p => p.id === id);
    if (!payment) {
      const err = new Error('Payment record not found');
      err.statusCode = 404;
      throw err;
    }
    return payment;
  },

  async getPaymentByConsultationId(consultationId) {
    try {
      const res = await query('SELECT * FROM payments WHERE consultation_id = $1 ORDER BY created_at DESC LIMIT 1', [consultationId]);
      if (res.rows.length > 0) {
        return mapRowToPayment(res.rows[0]);
      }
    } catch (dbErr) {
      // Memory fallback
    }

    const payments = readData();
    return payments.find(p => p.consultationId === consultationId) || null;
  },

  async initiatePayment({ consultationId, userId, paymentMethod = 'CARD' }) {
    if (!consultationId) {
      const err = new Error('Consultation ID is required to initiate payment.');
      err.statusCode = 400;
      throw err;
    }

    const consultation = await consultationService.getConsultationById(consultationId);
    if (!consultation) {
      const err = new Error('Consultation record not found.');
      err.statusCode = 404;
      throw err;
    }

    // DUPLICATE PAYMENT PROTECTION CHECK
    if (consultation.paymentStatus === 'PAID') {
      const err = new Error('Payment for this consultation has already been completed.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_PAYMENT';
      throw err;
    }

    const existingPayment = await this.getPaymentByConsultationId(consultationId);
    if (existingPayment && existingPayment.status === 'PAID') {
      const err = new Error('Payment for this consultation has already been completed.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_PAYMENT';
      throw err;
    }

    const feeAmount = Number(consultation.fee) || 150.00;
    const gatewayOrder = paymentGatewayService.createOrder({
      amount: feeAmount,
      currency: 'USD',
      consultationId,
      userId,
    });

    const paymentId = `PAY-${Date.now().toString().slice(-8)}`;
    const newPayment = {
      id: paymentId,
      paymentNumber: paymentId,
      consultationId,
      userId: userId || consultation.userId || null,
      enquiryId: consultation.enquiryId || null,
      weddingId: null,
      amount: feeAmount,
      currency: 'USD',
      status: 'PENDING',
      paymentMethod,
      gatewayOrderId: gatewayOrder.gatewayOrderId,
      gatewayTransactionId: null,
      gatewaySignature: null,
      failureReason: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await query(
        `INSERT INTO payments (id, payment_number, consultation_id, user_id, enquiry_id, amount, currency, status, payment_method, gateway_order_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          newPayment.id,
          newPayment.paymentNumber,
          newPayment.consultationId,
          newPayment.userId,
          newPayment.enquiryId,
          newPayment.amount,
          newPayment.currency,
          'PENDING',
          paymentMethod,
          gatewayOrder.gatewayOrderId,
        ]
      );
    } catch (dbErr) {
      // Memory fallback
    }

    const payments = readData();
    payments.unshift(newPayment);
    writeData(payments);

    // Update consultation payment status to PENDING
    await consultationService.updateConsultation(consultationId, {
      paymentStatus: 'PENDING',
      paymentId: newPayment.id,
    });

    return {
      payment: newPayment,
      gateway: gatewayOrder,
    };
  },

  async verifyPayment({ paymentId, gatewayOrderId, gatewayTransactionId, gatewaySignature, mockOutcome }) {
    if (!paymentId) {
      const err = new Error('Payment ID is required for verification.');
      err.statusCode = 400;
      throw err;
    }

    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      const err = new Error('Payment record not found for verification.');
      err.statusCode = 404;
      throw err;
    }

    // DUPLICATE PAYMENT PROTECTION CHECK ON VERIFY
    if (payment.status === 'PAID') {
      const err = new Error('Duplicate payment processing blocked: This payment has already been verified and marked PAID.');
      err.statusCode = 409;
      err.code = 'DUPLICATE_PAYMENT';
      throw err;
    }

    const verificationResult = paymentGatewayService.verifySignature({
      gatewayOrderId: gatewayOrderId || payment.gatewayOrderId,
      gatewayTransactionId,
      gatewaySignature,
      amount: payment.amount,
      consultationId: payment.consultationId,
      mockOutcome,
    });

    const now = new Date().toISOString();

    if (verificationResult.valid) {
      // Mark Payment as PAID
      payment.status = 'PAID';
      payment.gatewayTransactionId = gatewayTransactionId || `txn_sbx_${Date.now()}`;
      payment.gatewaySignature = gatewaySignature || 'sbx_sig_valid';
      payment.failureReason = null;
      payment.updatedAt = now;

      try {
        await query(
          `UPDATE payments SET status = 'PAID', gateway_transaction_id = $1, gateway_signature = $2, failure_reason = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = $3`,
          [payment.gatewayTransactionId, payment.gatewaySignature, paymentId]
        );
      } catch (dbErr) {
        // Fallback
      }

      const payments = readData();
      const idx = payments.findIndex(p => p.id === paymentId);
      if (idx !== -1) {
        payments[idx] = payment;
        writeData(payments);
      }

      // Update associated consultation to PAID & CONFIRMED
      let updatedConsultation = null;
      if (payment.consultationId) {
        updatedConsultation = await consultationService.updateConsultation(payment.consultationId, {
          paymentStatus: 'PAID',
          paymentId: payment.id,
          status: 'CONFIRMED',
        });
      }

      if (payment.userId) {
        await auditService.logAction({
          actionType: 'PAYMENT_SUCCESS',
          entityType: 'payment',
          entityId: payment.id,
          actorId: payment.userId,
          details: { amount: payment.amount, consultationId: payment.consultationId, gatewayTransactionId: payment.gatewayTransactionId },
        });
      }

      return {
        success: true,
        message: 'Payment verified and consultation confirmed successfully.',
        payment,
        consultation: updatedConsultation,
      };
    } else {
      // Verification failed
      payment.status = 'FAILED';
      payment.failureReason = verificationResult.reason || 'Payment verification failed.';
      payment.updatedAt = now;

      try {
        await query(
          `UPDATE payments SET status = 'FAILED', failure_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
          [payment.failureReason, paymentId]
        );
      } catch (dbErr) {
        // Fallback
      }

      const payments = readData();
      const idx = payments.findIndex(p => p.id === paymentId);
      if (idx !== -1) {
        payments[idx] = payment;
        writeData(payments);
      }

      if (payment.consultationId) {
        await consultationService.updateConsultation(payment.consultationId, {
          paymentStatus: 'FAILED',
        });
      }

      if (payment.userId) {
        await auditService.logAction({
          actionType: 'PAYMENT_FAILED',
          entityType: 'payment',
          entityId: payment.id,
          actorId: payment.userId,
          details: { reason: payment.failureReason, consultationId: payment.consultationId },
        });
      }

      const err = new Error(payment.failureReason);
      err.statusCode = 400;
      err.payment = payment;
      throw err;
    }
  },

  async cancelPayment({ paymentId, reason }) {
    const payment = await this.getPaymentById(paymentId);
    if (!payment) {
      const err = new Error('Payment record not found.');
      err.statusCode = 404;
      throw err;
    }

    if (payment.status === 'PAID') {
      const err = new Error('Cannot cancel a payment that has already been completed.');
      err.statusCode = 400;
      throw err;
    }

    payment.status = 'FAILED';
    payment.failureReason = reason || 'Payment cancelled by user.';
    payment.updatedAt = new Date().toISOString();

    try {
      await query(
        `UPDATE payments SET status = 'FAILED', failure_reason = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [payment.failureReason, paymentId]
      );
    } catch (dbErr) {
      // Fallback
    }

    const payments = readData();
    const idx = payments.findIndex(p => p.id === paymentId);
    if (idx !== -1) {
      payments[idx] = payment;
      writeData(payments);
    }

    if (payment.consultationId) {
      await consultationService.updateConsultation(payment.consultationId, {
        paymentStatus: 'FAILED',
      });
    }

    return payment;
  },
};
