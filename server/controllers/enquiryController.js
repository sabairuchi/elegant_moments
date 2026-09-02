import { enquiryService } from '../services/enquiryService.js';

export const getEnquiries = async (req, res, next) => {
  try {
    const enquiries = await enquiryService.getAllEnquiries();
    res.json({
      success: true,
      count: enquiries.length,
      enquiries,
    });
  } catch (error) {
    next(error);
  }
};

export const createEnquiry = async (req, res, next) => {
  try {
    const { name, email, eventType } = req.body;

    if (!name || !email || !eventType) {
      return res.status(400).json({
        success: false,
        message: 'Please provide required fields: Name, Email, and Event Type.',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const enquiry = await enquiryService.createEnquiry(req.body);

    console.log(`[API] New Enquiry received from ${enquiry.name} (${enquiry.id})`);

    return res.status(201).json({
      success: true,
      message: 'Your story has been received. Our senior event curator will contact you within 24 hours.',
      enquiry,
    });
  } catch (error) {
    next(error);
  }
};
