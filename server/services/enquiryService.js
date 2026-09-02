import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ENQUIRIES_FILE = path.join(__dirname, '..', 'data', 'enquiries.json');

const ensureFileExists = () => {
  const dir = path.dirname(ENQUIRIES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(ENQUIRIES_FILE)) fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify([], null, 2), 'utf-8');
};

const readData = () => {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(ENQUIRIES_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading enquiries file:', err);
    return [];
  }
};

const writeData = (data) => {
  ensureFileExists();
  try {
    fs.writeFileSync(ENQUIRIES_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing enquiries file:', err);
    return false;
  }
};

export const enquiryService = {
  async getAllEnquiries() {
    return readData();
  },

  async createEnquiry(payload) {
    const { name, email, phone, eventType, eventDate, location, guestCount, estimatedBudget, servicesRequired, vision } = payload;

    const enquiries = readData();
    const newEnquiry = {
      id: `ENQ-${Date.now().toString().slice(-6)}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone ? phone.trim() : '',
      eventType: eventType.trim(),
      eventDate: eventDate || '',
      location: location ? location.trim() : '',
      guestCount: guestCount || '',
      estimatedBudget: estimatedBudget || '',
      servicesRequired: Array.isArray(servicesRequired) ? servicesRequired : [],
      vision: vision ? vision.trim() : '',
      status: 'New',
      createdAt: new Date().toISOString(),
    };

    enquiries.unshift(newEnquiry);
    const saved = writeData(enquiries);
    if (!saved) {
      throw new Error('Failed to persist enquiry.');
    }
    return newEnquiry;
  },
};
