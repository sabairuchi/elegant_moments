import { consultationService } from '../services/consultationService.js';
import { auditService } from '../services/auditService.js';

export const getConsultations = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const { role, email, id: userId } = req.user || {};
    const filterOptions = { page, limit, search, status };

    if (role === 'client') {
      filterOptions.email = email;
      filterOptions.userId = userId;
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
      const isOwner =
        (consultation.userId && consultation.userId === req.user.id) ||
        (consultation.email && consultation.email.toLowerCase() === req.user.email.toLowerCase());

      if (!isOwner) {
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
    const { name, email, phone, requestedDate, date, time, meetingType, notes, enquiryId, fee } = req.body;

    const consultationEmail = email || req.user?.email;
    const consultationName = name || (req.user ? `${req.user.firstName} ${req.user.lastName}` : '');

    if (!consultationName || !consultationEmail) {
      return res.status(400).json({
        success: false,
        message: 'Name and Email are required for a consultation request.',
      });
    }

    const payload = {
      enquiryId: enquiryId || null,
      userId: req.user ? req.user.id : null,
      name: consultationName,
      email: consultationEmail,
      phone: phone || req.user?.phone || '',
      requestedDate: requestedDate || date || '',
      date: date || requestedDate || '',
      time: time || '10:00 AM',
      meetingType: meetingType || 'Video Call',
      fee: fee || 150.00,
      notes: notes || '',
    };

    const consultation = await consultationService.createConsultation(payload);

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
