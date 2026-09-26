import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '..', '.env');

if (fs.existsSync(envPath)) {
  try {
    const rawEnv = fs.readFileSync(envPath, 'utf-8');
    rawEnv.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
        const [key, ...valueParts] = trimmed.split('=');
        const val = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        if (key && !process.env[key.trim()]) {
          process.env[key.trim()] = val;
        }
      }
    });
  } catch (e) {
    // Ignore error
  }
}

export const config = {
  port: process.env.PORT || 5000,
  env: process.env.NODE_ENV || 'development',
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  jwtSecret: process.env.JWT_SECRET || 'elegant_moments_jwt_secret_key_m2',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'elegant_moments_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
  },
  paymentGateway: {
    mode: process.env.PAYMENT_GATEWAY_MODE || 'sandbox',
    key: process.env.PAYMENT_GATEWAY_KEY || 'sbx_key_em_2026_test',
    secret: process.env.PAYMENT_GATEWAY_SECRET || 'sbx_secret_em_2026_test_secret_key',
    currency: process.env.PAYMENT_CURRENCY || 'USD',
  },
};

// Security check for production
if (config.env === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'elegant_moments_jwt_secret_key_m2')) {
  console.warn('WARNING: Production environment is using a default or missing JWT_SECRET environment variable.');
}

