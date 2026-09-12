import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../config/index.js';

const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

let pool = null;
let isConnected = false;

if (connectionString || process.env.DB_HOST) {
  try {
    pool = new Pool(
      connectionString
        ? {
            connectionString,
            ssl: process.env.NODE_ENV === 'production' || process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          }
        : {
            host: config.db.host,
            port: config.db.port,
            database: config.db.database,
            user: config.db.user,
            password: config.db.password,
            ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
          }
    );
  } catch (err) {
    console.warn('Failed to initialize PostgreSQL Pool:', err.message);
  }
}

export const query = async (text, params) => {
  if (pool) {
    return pool.query(text, params);
  }
  throw new Error('Database pool not configured.');
};

export const initDb = async () => {
  if (!pool) return false;
  try {
    const client = await pool.connect();
    try {
      await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

      await client.query(`
        CREATE TABLE IF NOT EXISTS services (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            vendor_profile_id UUID,
            title VARCHAR(200),
            name VARCHAR(200),
            category VARCHAR(100) NOT NULL,
            base_price NUMERIC(10,2),
            starting_price NUMERIC(10,2),
            description TEXT,
            image_url VARCHAR(500),
            status VARCHAR(30) DEFAULT 'ACTIVE',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS venues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(200) NOT NULL,
            slug VARCHAR(200),
            city VARCHAR(100),
            country VARCHAR(100),
            location VARCHAR(200),
            capacity INT NOT NULL DEFAULT 0,
            rental_fee NUMERIC(10,2),
            pricing NUMERIC(10,2),
            description TEXT,
            image_url VARCHAR(500),
            images JSONB,
            amenities JSONB,
            status VARCHAR(30) DEFAULT 'ACTIVE',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS client_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            partner_first_name VARCHAR(100),
            partner_last_name VARCHAR(100),
            partner_email VARCHAR(255),
            anniversary_date DATE,
            notes TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS planner_profiles (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            user_id UUID,
            bio TEXT,
            specialization VARCHAR(100),
            max_active_weddings INT DEFAULT 5,
            rating NUMERIC(3,2) DEFAULT 5.00,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS weddings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            wedding_title VARCHAR(200),
            client_id VARCHAR(255),
            client_name VARCHAR(255),
            client_profile_id UUID,
            planner_profile_id UUID,
            assigned_planner_id VARCHAR(255),
            assigned_planner_name VARCHAR(255),
            wedding_date DATE,
            estimated_budget NUMERIC(12,2),
            budget NUMERIC(12,2),
            actual_spent NUMERIC(12,2) DEFAULT 0.00,
            guest_count INT,
            theme_description TEXT,
            notes TEXT,
            internal_notes TEXT,
            status VARCHAR(30) DEFAULT 'PLANNING',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            deleted_at TIMESTAMP WITH TIME ZONE
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS wedding_venues (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
            venue_id UUID NOT NULL REFERENCES venues(id) ON DELETE CASCADE,
            booking_status VARCHAR(30) DEFAULT 'Reserved',
            agreed_price NUMERIC(10,2),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS wedding_services (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            wedding_id UUID NOT NULL REFERENCES weddings(id) ON DELETE CASCADE,
            service_id UUID NOT NULL REFERENCES services(id) ON DELETE CASCADE,
            vendor_profile_id UUID,
            custom_price NUMERIC(10,2),
            status VARCHAR(30) DEFAULT 'Proposed',
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `);

      isConnected = true;
      console.log('PostgreSQL schema initialized successfully.');
      return true;
    } finally {
      client.release();
    }
  } catch (err) {
    console.warn('PostgreSQL connection attempt failed during initDb:', err.message);
    return false;
  }
};

export const hasDbConnection = () => isConnected || Boolean(pool);

export default pool;
