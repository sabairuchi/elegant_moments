import crypto from 'crypto';
import { config } from '../config/index.js';

export const paymentGatewayService = {
  getGatewayInfo() {
    return {
      mode: config.paymentGateway.mode || 'sandbox',
      currency: config.paymentGateway.currency || 'USD',
      key: config.paymentGateway.key,
    };
  },

  createOrder({ amount, currency = 'USD', consultationId, userId }) {
    if (!amount || amount <= 0) {
      throw new Error('Payment amount must be greater than zero.');
    }

    const orderId = `ord_sbx_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
    const secret = config.paymentGateway.secret || 'sbx_secret_em_2026_test_secret_key';

    // Generate server-side checksum token for tamper protection
    const signatureToken = crypto
      .createHmac('sha256', secret)
      .update(`${orderId}|${amount}|${consultationId}`)
      .digest('hex');

    return {
      gatewayOrderId: orderId,
      amount: Number(amount),
      currency: currency || config.paymentGateway.currency || 'USD',
      gatewayKey: config.paymentGateway.key,
      mode: config.paymentGateway.mode,
      signatureToken,
      createdTimestamp: Date.now(),
    };
  },

  verifySignature({ gatewayOrderId, gatewayTransactionId, gatewaySignature, amount, consultationId, mockOutcome }) {
    // If mockOutcome is explicitly failed in sandbox testing
    if (mockOutcome === 'FAILED' || mockOutcome === 'DECLINED') {
      return {
        valid: false,
        reason: 'Payment transaction was declined or failed by bank in sandbox mode.',
      };
    }

    if (!gatewayOrderId || !gatewayTransactionId || !gatewaySignature) {
      return {
        valid: false,
        reason: 'Missing required payment verification details (order ID, transaction ID, or signature).',
      };
    }

    const secret = config.paymentGateway.secret || 'sbx_secret_em_2026_test_secret_key';

    // Verification check 1: Sandbox standard signature format
    if (gatewaySignature === `sig_valid_${gatewayOrderId}` || gatewaySignature === 'sbx_mock_valid_sig') {
      return { valid: true };
    }

    // Verification check 2: Computed HMAC signature matching
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${gatewayOrderId}|${gatewayTransactionId}|${amount || ''}`)
      .digest('hex');

    const expectedSignatureWithConsultation = crypto
      .createHmac('sha256', secret)
      .update(`${gatewayOrderId}|${amount || ''}|${consultationId || ''}`)
      .digest('hex');

    if (
      gatewaySignature === expectedSignature ||
      gatewaySignature === expectedSignatureWithConsultation
    ) {
      return { valid: true };
    }

    return {
      valid: false,
      reason: 'Server-side signature verification failed. Signature does not match.',
    };
  },
};
