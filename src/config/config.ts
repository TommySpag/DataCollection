import dotenv from 'dotenv';

// Charger les variables d'environnement à partir du fichier .env
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  CERT_KEY: process.env.CERT_KEY || '',
  CERT_CERT: process.env.CERT_CERT || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  jwtSecret: process.env.JWT_SECRET || '',
  databaseUrl: process.env.DB_URI || '',
  nodeEnv: process.env.NODE_ENV || '',
  isProduction: process.env.NODE_ENV === 'production'
};