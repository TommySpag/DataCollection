import dotenv from 'dotenv';

// Charger les variables d'environnement à partir du fichier .env
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  CERT_KEY: process.env.CERT_KEY || './certificates/key.pem',
  CERT_CERT: process.env.CERT_CERT || './certificates/cert.pem',
  sessionSecret: process.env.SESSION_SECRET || 'secret_par_defaut_pour_les_sessions',
  jwtSecret: process.env.JWT_SECRET || 'secret_par_defaut_pour_le_jwt',
  databaseUrl: process.env.DATABASE_URL || 'mongodb://localhost:27017/defaultdb',
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};