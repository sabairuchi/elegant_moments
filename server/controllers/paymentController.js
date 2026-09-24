import { paymentService } from '../services/paymentService.js';
import { consultationService } from '../services/consultationService.js';
import { auditService } from '../services/auditService.js';

export const initiatePayment = async (req, res, next) => {
  try {
    const { consultationId, paymentMethod } = req.body;
    const user = req.user;

    if (!consultationId) {
      return res.status(400).json({
        success: false,
        message: 'consultationId is required to initiate payment.',
      });
    }

    const consultation = await consultationService.getConsultationById(consultationId);
    if (!consultation) {
      return res.status(404).json({
        success: false,
        message: 'Consultation record not found.',
      });
    }

    // Ownership check for clients
    if (user.role === 'client') {
      const isOwner =
        (consultation.userId && consultation.userId === user.id) ||
        (consultation.email && consultation.email.toLowerCase() === user.email.toLowerCase());

      if (!isOwner) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden. You can only initiate payment for your own consultations.',
        });
      }
    }

    const result = await paymentService.initiatePayment({
      consultationId,
      userId: user.id,
      paymentMethod: paymentMethod || 'CARD',
    });

    return res.status(201).json({
      success: true,
      message: 'Payment session initiated successfully.',
      ...result,
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_PAYMENT') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_PAYMENT',
        message: error.message,
      });
    }
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const { paymentId, gatewayOrderId, gatewayTransactionId, gatewaySignature, mockOutcome } = req.body;
    const user = req.user;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required for verification.',
      });
    }

    const payment = await paymentService.getPaymentById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found.',
      });
    }

    // Ownership check for clients
    if (user.role === 'client' && payment.userId && payment.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You can only verify payments for your own account.',
      });
    }

    const result = await paymentService.verifyPayment({
      paymentId,
      gatewayOrderId,
      gatewayTransactionId,
      gatewaySignature,
      mockOutcome,
    });

    return res.json({
      success: true,
      message: 'Payment verified and consultation confirmed.',
      ...result,
    });
  } catch (error) {
    if (error.code === 'DUPLICATE_PAYMENT') {
      return res.status(409).json({
        success: false,
        code: 'DUPLICATE_PAYMENT',
        message: error.message,
      });
    }
    if (error.statusCode === 400) {
      return res.status(400).json({
        success: false,
        message: error.message,
        payment: error.payment || null,
      });
    }
    next(error);
  }
};

export const cancelPayment = async (req, res, next) => {
  try {
    const { paymentId, reason } = req.body;
    const user = req.user;

    if (!paymentId) {
      return res.status(400).json({
        success: false,
        message: 'paymentId is required to cancel payment.',
      });
    }

    const payment = await paymentService.getPaymentById(paymentId);
    if (user.role === 'client' && payment.userId && payment.userId !== user.id) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You can only cancel your own payments.',
      });
    }

    const updatedPayment = await paymentService.cancelPayment({
      paymentId,
      reason: reason || 'Cancelled by user during checkout.',
    });

    return res.json({
      success: true,
      message: 'Payment cancelled successfully.',
      payment: updatedPayment,
    });
  } catch (error) {
    next(error);
  }
};

export const getPayments = async (req, res, next) => {
  try {
    const { page, limit, search, status, consultationId } = req.query;
    const { role, id: userId } = req.user || {};

    const filterOptions = { page, limit, search, status, consultationId };

    if (role === 'client') {
      filterOptions.userId = userId;
    }

    const result = await paymentService.getAllPayments(filterOptions);

    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getPaymentById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role, id: userId } = req.user || {};

    const payment = await paymentService.getPaymentById(id);

    if (role === 'client' && payment.userId && payment.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access forbidden. You can only view your own payment records.',
      });
    }

    return res.json({
      success: true,
      payment,
    });
  } catch (error) {
    next(error);
  }
};
