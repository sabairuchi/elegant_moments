import { consultationService } from '../services/consultationService.js';
import { auditService } from '../services/auditService.js';

export const getConsultations = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await consultationService.getAllConsultations({ page, limit, search, status });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getConsultationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const consultation = await consultationService.getConsultationById(id);
    res.json({ success: true, consultation });
  } catch (error) {
    next(error);
  }
};

export const createConsultation = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Name and Email are required for a consultation request.',
      });
    }

    const consultation = await consultationService.createConsultation(req.body);

    return res.status(201).json({
      success: true,
      message: 'Consultation request submitted successfully.',
      consultation,
    });
  } catch (error) {
    next(error);
  }
};

export const updateConsultation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedConsultation = await consultationService.updateConsultation(id, updates);

    if (updates.status) {
      await auditService.logAction({
        actionType: 'UPDATE_CONSULTATION_STATUS',
        entityType: 'consultation',
        entityId: id,
        actorId: req.user.id,
        details: { newStatus: updates.status },
      });
    }

    res.json({
      success: true,
      message: 'Consultation updated successfully.',
      consultation: updatedConsultation,
    });
  } catch (error) {
    next(error);
  }
};
