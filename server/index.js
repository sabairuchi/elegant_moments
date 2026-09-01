import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const ENQUIRIES_FILE = path.join(__dirname, 'data', 'enquiries.json');
const CONSULTATIONS_FILE = path.join(__dirname, 'data', 'consultations.json');

// Helper to ensure directory & file exist
const ensureFileExists = (filePath, defaultData = []) => {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2), 'utf-8');
  }
};

ensureFileExists(ENQUIRIES_FILE);
ensureFileExists(CONSULTATIONS_FILE);

// Utility to read JSON
const readData = (filePath) => {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
    return [];
  }
};

// Utility to write JSON
const writeData = (filePath, data) => {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error(`Error writing to ${filePath}:`, err);
    return false;
  }
};

// --- API ROUTES ---

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    brand: 'Elegant Moments API (Milestone 1)',
    timestamp: new Date().toISOString(),
  });
});

// Submit Enquiry ("Tell Us Your Story")
app.post('/api/enquiries', (req, res) => {
  const { name, email, phone, eventType, eventDate, location, guestCount, estimatedBudget, servicesRequired, vision } = req.body;

  // Simple validation
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

  const enquiries = readData(ENQUIRIES_FILE);
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
  const saved = writeData(ENQUIRIES_FILE, enquiries);

  if (!saved) {
    return res.status(500).json({
      success: false,
      message: 'Failed to save enquiry to database store.',
    });
  }

  console.log(`[API] New Enquiry received from ${newEnquiry.name} (${newEnquiry.id})`);

  return res.status(201).json({
    success: true,
    message: 'Your story has been received. Our senior event curator will contact you within 24 hours.',
    enquiry: newEnquiry,
  });
});

// Fetch all enquiries (Ready for Milestone 2 Admin Dashboard)
app.get('/api/enquiries', (req, res) => {
  const enquiries = readData(ENQUIRIES_FILE);
  res.json({
    success: true,
    count: enquiries.length,
    enquiries,
  });
});

// Submit Consultation Request
app.post('/api/consultations', (req, res) => {
  const { name, email, phone, preferredTime, note } = req.body;

  if (!name || !email) {
    return res.status(400).json({
      success: false,
      message: 'Name and Email are required for a consultation request.',
    });
  }

  const consultations = readData(CONSULTATIONS_FILE);
  const newConsultation = {
    id: `CNS-${Date.now().toString().slice(-6)}`,
    name: name.trim(),
    email: email.trim(),
    phone: phone ? phone.trim() : '',
    preferredTime: preferredTime || 'Flexible',
    note: note ? note.trim() : '',
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  consultations.unshift(newConsultation);
  writeData(CONSULTATIONS_FILE, consultations);

  return res.status(201).json({
    success: true,
    message: 'Consultation call scheduled successfully. We look forward to connecting.',
    consultation: newConsultation,
  });
});

// Fetch all consultations
app.get('/api/consultations', (req, res) => {
  const consultations = readData(CONSULTATIONS_FILE);
  res.json({
    success: true,
    count: consultations.length,
    consultations,
  });
});

const server = app.listen(PORT, () => {
  console.log(`✨ Elegant Moments API running on http://localhost:${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.log(`✨ Elegant Moments API is already running on http://localhost:${PORT} (active instance attached).`);
    process.exit(0);
  } else {
    console.error('Server error:', err);
  }
});

