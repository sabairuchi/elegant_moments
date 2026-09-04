import { enquiryService } from '../services/enquiryService.js';
import { userService } from '../services/userService.js';
import { auditService } from '../services/auditService.js';
import bcrypt from 'bcrypt';

export const getEnquiries = async (req, res, next) => {
  try {
    const { page, limit, search, status } = req.query;
    const result = await enquiryService.getAllEnquiries({ page, limit, search, status });
    res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

export const getEnquiryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await enquiryService.getEnquiryById(id);
    res.json({ success: true, enquiry });
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

export const updateEnquiry = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    const updatedEnquiry = await enquiryService.updateEnquiry(id, updates);

    // Audit log if status changed
    if (updates.status) {
      await auditService.logAction({
        actionType: 'UPDATE_ENQUIRY_STATUS',
        entityType: 'enquiry',
        entityId: id,
        actorId: req.user.id,
        details: { newStatus: updates.status },
      });
    }

    res.json({
      success: true,
      message: 'Enquiry updated successfully.',
      enquiry: updatedEnquiry,
    });
  } catch (error) {
    next(error);
  }
};

export const convertEnquiryToClient = async (req, res, next) => {
  try {
    const { id } = req.params;
    const enquiry = await enquiryService.getEnquiryById(id);

    if (enquiry.status === 'CONVERTED') {
      return res.status(400).json({ success: false, message: 'Enquiry is already converted.' });
    }

    // Check if user already exists
    let user = await userService.findByEmail(enquiry.email);
    
    let generatedPassword = null;

    if (!user) {
      // Create user
      generatedPassword = Math.random().toString(36).slice(-8) + 'A1!'; // Basic complex password
      
      const { user: newUser } = await userService.createUser({
        firstName: enquiry.name.split(' ')[0],
        lastName: enquiry.name.split(' ').slice(1).join(' ') || 'Client',
        email: enquiry.email,
        phone: enquiry.phone,
        password: generatedPassword,
        role: 'client'
      });
      user = newUser;
      
      // Override status to ACTIVE since we are converting them manually
      await userService.updateUser(user.id, { accountStatus: 'ACTIVE', isVerified: true });
    } else {
      // Ensure they have the client role if they were something else? Or just link it.
    }

    // Mark Enquiry as converted
    const updatedEnquiry = await enquiryService.updateEnquiry(id, { 
      status: 'CONVERTED', 
      convertedUserId: user.id 
    });

    await auditService.logAction({
      actionType: 'CONVERT_ENQUIRY',
      entityType: 'enquiry',
      entityId: id,
      actorId: req.user.id,
      details: { newUserId: user.id },
    });

    res.json({
      success: true,
      message: 'Enquiry converted to client successfully.',
      enquiry: updatedEnquiry,
      user: { id: user.id, email: user.email },
      generatedPasswordDevOnly: generatedPassword // DEV ONLY: Expose password so admin can see it to send manually
    });
  } catch (error) {
    next(error);
  }
};
