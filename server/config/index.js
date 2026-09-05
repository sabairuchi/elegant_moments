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
};

// Security check for production
if (config.env === 'production' && (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'elegant_moments_jwt_secret_key_m2')) {
  console.warn('WARNING: Production environment is using a default or missing JWT_SECRET environment variable.');
}

