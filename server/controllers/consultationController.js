import { consultationService } from '../services/consultationService.js';

export const getConsultations = async (req, res, next) => {
  try {
    const consultations = await consultationService.getAllConsultations();
    res.json({
      success: true,
      count: consultations.length,
      consultations,
    });
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
      message: 'Consultation call scheduled successfully. We look forward to connecting.',
      consultation,
    });
  } catch (error) {
    next(error);
  }
};
