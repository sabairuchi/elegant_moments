import { consultationService } from '../services/consultationService.js';
import { auditService } from '../services/auditService.js';

export const getConsultations = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { role, email } = req.user || {};
    const filterOptions = { page, limit, search, status };

    if (role === 'client') {
      filterOptions.email = email;
    }

    const result = await consultationService.getAllConsultations(filterOptions);
    
    // Sanitize internalNotes for client role
    if (role === 'client' && result.consultations) {
      result.consultations = result.consultations.map((c) => {
        const { internalNotes, adminNotes, ...rest } = c;
        return rest;
      });
    }

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
    let consultation = await consultationService.getConsultationById(id);

    if (req.user && req.user.role === 'client') {
      if (!consultation.email || consultation.email.toLowerCase() !== req.user.email.toLowerCase()) {
        return res.status(403).json({
          success: false,
          message: 'Access forbidden. You can only view your own consultations.',
        });
      }
      const { internalNotes, adminNotes, ...rest } = consultation;
      consultation = rest;
    }

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
