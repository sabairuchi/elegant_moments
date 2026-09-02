import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const CONSULTATIONS_FILE = path.join(__dirname, '..', 'data', 'consultations.json');

const ensureFileExists = () => {
  const dir = path.dirname(CONSULTATIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(CONSULTATIONS_FILE)) fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify([], null, 2), 'utf-8');
};

const readData = () => {
  ensureFileExists();
  try {
    const raw = fs.readFileSync(CONSULTATIONS_FILE, 'utf-8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('Error reading consultations file:', err);
    return [];
  }
};

const writeData = (data) => {
  ensureFileExists();
  try {
    fs.writeFileSync(CONSULTATIONS_FILE, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.error('Error writing consultations file:', err);
    return false;
  }
};

export const consultationService = {
  async getAllConsultations() {
    return readData();
  },

  async createConsultation(payload) {
    const { name, email, phone, preferredTime, note } = payload;

    const consultations = readData();
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
    const saved = writeData(consultations);
    if (!saved) {
      throw new Error('Failed to persist consultation.');
    }
    return newConsultation;
  },
};
