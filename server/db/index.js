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

export const DEFAULT_SERVICES = [
  {
    id: 'b7c3d101-5821-4f12-9c31-01a1b2c3d4e1',
    name: 'Luxury Wedding Planning',
    category: 'Other',
    description: 'Our full-service luxury wedding planning is designed for couples who demand perfection, privacy, and impeccable execution.',
    startingPrice: 15000,
    imageUrl: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d102-5821-4f12-9c31-01a1b2c3d4e2',
    name: 'Destination Weddings',
    category: 'Other',
    description: 'Seamless multi-day destination celebrations hosted in private villas, historic châteaux, and island retreats globally.',
    startingPrice: 20000,
    imageUrl: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d103-5821-4f12-9c31-01a1b2c3d4e3',
    name: 'Private Celebrations',
    category: 'Music/Entertainment',
    description: 'High-concept private galas, milestone birthdays, and exclusive anniversary celebrations tailored with theatrical elegance.',
    startingPrice: 10000,
    imageUrl: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d104-5821-4f12-9c31-01a1b2c3d4e4',
    name: 'Event Design & Styling',
    category: 'Decor',
    description: 'Artistic direction, custom floral installations, custom linen, lighting design, and tactile tabletop curation.',
    startingPrice: 8500,
    imageUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d105-5821-4f12-9c31-01a1b2c3d4e5',
    name: 'Guest Experience & Hospitality',
    category: 'Other',
    description: 'White-glove guest care from luxury hotel room block negotiations, private chauffeur transfers, to personalized welcome hampers.',
    startingPrice: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d106-5821-4f12-9c31-01a1b2c3d4e6',
    name: 'Wedding Day Management',
    category: 'Other',
    description: 'Precise, calm, and discreet production management on your celebration day.',
    startingPrice: 6000,
    imageUrl: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d107-5821-4f12-9c31-01a1b2c3d4e7',
    name: 'Hospitality & Concierge',
    category: 'Catering',
    description: 'Tailored hospitality arrangements for bridal parties, high-profile guests, and private dining events.',
    startingPrice: 4500,
    imageUrl: 'https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d108-5821-4f12-9c31-01a1b2c3d4e8',
    name: 'Haute Couture Photography',
    category: 'Photography',
    description: 'Editorial wedding photography capturing high-fashion portraits, candid emotions, and fine art details.',
    startingPrice: 7500,
    imageUrl: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d109-5821-4f12-9c31-01a1b2c3d4e9',
    name: 'Cinematic Videography',
    category: 'Videography',
    description: '4K cinema reel production featuring drone aerial videography, custom sound design, and documentary-style editing.',
    startingPrice: 8000,
    imageUrl: 'https://images.unsplash.com/photo-1518135714426-c18f5ffb6f4d?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d110-5821-4f12-9c31-01a1b2c3d4ea',
    name: 'Sculptural Floral Artistry',
    category: 'Florist',
    description: 'Fine botanical styling, grand floral arches, and delicate centerpiece arrangements sourced from international flower markets.',
    startingPrice: 6500,
    imageUrl: 'https://images.unsplash.com/photo-1561181286-d3fee7d55364?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d111-5821-4f12-9c31-01a1b2c3d4eb',
    name: 'Haute Couture Cake & Pastry Design',
    category: 'Cake',
    description: 'Multi-tiered wedding cakes decorated with hand-sculpted sugar flowers and artisanal flavor pairings.',
    startingPrice: 2500,
    imageUrl: 'https://images.unsplash.com/photo-1535141192574-5d4897c13136?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  },
  {
    id: 'b7c3d112-5821-4f12-9c31-01a1b2c3d4ec',
    name: 'Bridal Makeup & Hair Styling',
    category: 'Makeup & Hair',
    description: 'VIP bridal beauty team specializing in long-lasting red-carpet glam, hair extensions, and trial sessions.',
    startingPrice: 1800,
    imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=1200&q=80',
    status: 'ACTIVE'
  }
];

export const DEFAULT_VENUES = [
  {
    id: 'c8d4e201-6932-5f23-a742-02b2c3d4e5f1',
    name: "Villa d'Este",
    location: "Lake Como, Italy",
    capacity: 200,
    pricing: 35000,
    imageUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
    description: "Nestled on the shores of Lake Como, Villa d'Este is an iconic 16th-century princely residence surrounded by 25 acres of private parkland, centennial trees, and lakeside terraces.",
    amenities: ["Lakeside Ceremony Lawn", "Private Boat Dock", "Michelin Dining", "Helipad Access"],
    status: "ACTIVE"
  },
  {
    id: 'c8d4e202-6932-5f23-a742-02b2c3d4e5f2',
    name: "Château de Chantilly",
    location: "Chantilly, France",
    capacity: 350,
    pricing: 45000,
    imageUrl: "https://images.unsplash.com/photo-1585543805890-6051f7829f98?auto=format&fit=crop&w=1200&q=80",
    description: "A jewel of French heritage surrounded by vast moats and formal gardens designed by André Le Nôtre. Offers grand ballroom galas and majestic courtyard ceremonies.",
    amenities: ["Historic Art Gallery", "Orangerie Reception Hall", "Fireworks Permitted", "Equestrian Grounds"],
    status: "ACTIVE"
  },
  {
    id: 'c8d4e203-6932-5f23-a742-02b2c3d4e5f3',
    name: "The St. Regis Florence",
    location: "Florence, Tuscany, Italy",
    capacity: 250,
    pricing: 28000,
    imageUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80",
    description: "A 15th-century Renaissance palace designed by Filippo Brunelleschi along the Arno River, featuring frescoed ballrooms and Tuscan gastronomic excellence.",
    amenities: ["Salone della Mescita Ballroom", "Arno River Views", "Butler Service", "Historic Wine Cellar"],
    status: "ACTIVE"
  }
];

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

      // Seed Services if table is empty
      const serviceCountRes = await client.query('SELECT COUNT(*) FROM services');
      if (parseInt(serviceCountRes.rows[0].count, 10) === 0) {
        for (const s of DEFAULT_SERVICES) {
          await client.query(
            `INSERT INTO services (id, title, name, category, base_price, starting_price, description, image_url, status, is_active)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [s.id, s.name, s.name, s.category, s.startingPrice, s.startingPrice, s.description, s.imageUrl, s.status, s.status === 'ACTIVE']
          );
        }
        console.log(`Seeded ${DEFAULT_SERVICES.length} website services into database.`);
      }

      // Seed Venues if table is empty
      const venueCountRes = await client.query('SELECT COUNT(*) FROM venues');
      if (parseInt(venueCountRes.rows[0].count, 10) === 0) {
        for (const v of DEFAULT_VENUES) {
          await client.query(
            `INSERT INTO venues (id, name, location, capacity, pricing, rental_fee, description, image_url, amenities, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [v.id, v.name, v.location, v.capacity, v.pricing, v.pricing, v.description, v.imageUrl, JSON.stringify(v.amenities), v.status]
          );
        }
        console.log(`Seeded ${DEFAULT_VENUES.length} default venues into database.`);
      }

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
