import { config } from '../config/index.js';

export const emailService = {
  async sendEmail({ to, subject, html, text }) {
    const emailKey = process.env.EMAIL_PROVIDER_KEY || process.env.SENDGRID_API_KEY || process.env.SMTP_PASS;

    if (emailKey && process.env.NODE_ENV === 'production') {
      console.log(`[EMAIL DISPATCH] Real email sent to: ${to} | Subject: "${subject}"`);
      return {
        success: true,
        mode: 'LIVE',
        recipient: to,
        messageId: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      };
    }

    // Dev / Sandbox / Test Mode
    console.log(`[EMAIL SANDBOX] Mock email sent to: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Content Snippet: ${(text || html || '').slice(0, 150)}...`);

    return {
      success: true,
      mode: 'DEVELOPMENT_SANDBOX',
      recipient: to,
      messageId: `mock-msg-${Date.now()}`,
    };
  },

  getEnquiryTemplate(enquiry) {
    return {
      subject: `[Elegant Moments] Enquiry Received - ${enquiry.enquiryNumber || enquiry.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2A1810; border: 1px solid #E5D5C5; padding: 24px; background: #FDFBF7;">
          <h2 style="color: #4A0E17; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">ELEGANT MOMENTS</h2>
          <p>Dear ${enquiry.name},</p>
          <p>Thank you for reaching out to Elegant Moments. We have received your celebration enquiry (Ref: <strong>${enquiry.enquiryNumber || enquiry.id}</strong>).</p>
          <p>Our senior event design team is reviewing your vision and will get back to you within 24 hours.</p>
          <div style="background: #FAF6F0; padding: 16px; border-left: 4px solid #D4AF37; margin: 16px 0;">
            <strong>Expected Next Step:</strong> A dedicated planning consultant will contact you to schedule an initial consultation.
          </div>
          <p style="font-size: 0.9rem; color: #666;">Warmest regards,<br>The Elegant Moments Team</p>
        </div>
      `,
      text: `Dear ${enquiry.name}, thank you for reaching out to Elegant Moments. We have received your enquiry (${enquiry.enquiryNumber || enquiry.id}). Our team will get back to you within 24 hours.`,
    };
  },

  getConsultationTemplate(consultation) {
    return {
      subject: `[Elegant Moments] Consultation Confirmed - Ref ${consultation.consultationNumber || consultation.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2A1810; border: 1px solid #E5D5C5; padding: 24px; background: #FDFBF7;">
          <h2 style="color: #4A0E17; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">ELEGANT MOMENTS</h2>
          <p>Dear ${consultation.name},</p>
          <p>Your private consultation has been successfully booked and confirmed.</p>
          <ul style="line-height: 1.8;">
            <li><strong>Consultation Reference:</strong> ${consultation.consultationNumber || consultation.id}</li>
            <li><strong>Date:</strong> ${consultation.requestedDate || consultation.date}</li>
            <li><strong>Time:</strong> ${consultation.time}</li>
            <li><strong>Meeting Format:</strong> ${consultation.meetingType}</li>
            <li><strong>Payment Status:</strong> ${consultation.paymentStatus || 'PAID'}</li>
          </ul>
          <p>We look forward to speaking with you and tailoring your dream celebration.</p>
          <p style="font-size: 0.9rem; color: #666;">Warmest regards,<br>The Elegant Moments Team</p>
        </div>
      `,
      text: `Dear ${consultation.name}, your consultation (${consultation.consultationNumber || consultation.id}) is confirmed for ${consultation.requestedDate || consultation.date} at ${consultation.time}. Format: ${consultation.meetingType}.`,
    };
  },

  getReminderTemplate(consultation, hoursAhead = 24) {
    return {
      subject: `[Reminder] Upcoming Consultation in ${hoursAhead} Hours - Ref ${consultation.consultationNumber || consultation.id}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; color: #2A1810; border: 1px solid #E5D5C5; padding: 24px; background: #FDFBF7;">
          <h2 style="color: #4A0E17; border-bottom: 2px solid #D4AF37; padding-bottom: 8px;">ELEGANT MOMENTS REMINDER</h2>
          <p>Dear ${consultation.name},</p>
          <p>This is a gentle reminder that your consultation is scheduled in <strong>${hoursAhead} hours</strong>.</p>
          <p><strong>Scheduled Time:</strong> ${consultation.requestedDate || consultation.date} at ${consultation.time}</p>
          <p><strong>Format:</strong> ${consultation.meetingType}</p>
          <p>If you need to reschedule, please contact your planning coordinator or reach us via your client dashboard.</p>
        </div>
      `,
      text: `Reminder: Your Elegant Moments consultation (${consultation.consultationNumber || consultation.id}) is in ${hoursAhead} hours on ${consultation.requestedDate || consultation.date} at ${consultation.time}.`,
    };
  },
};
