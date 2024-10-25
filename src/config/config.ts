import dotenv from 'dotenv';

// Charger les variables d'environnement à partir du fichier .env
dotenv.config();

const credentials = {
  databaseUser: 'AdminTP',
  databasePWD: 'AdminTP-pwd',
}

export const config = {
  port: process.env.PORT || 3000,
  sessionSecret: process.env.SESSION_SECRET || 'secret_par_defaut_pour_les_sessions',
  jwtSecret: process.env.JWT_SECRET || 'secret_par_defaut_pour_le_jwt',
  databaseUrl: process.env.DATABASE_URL || `mongodb+srv://${credentials.databaseUser}:${credentials.databasePWD}@420-514-tp2.0gxpo.mongodb.net/RestAPI`,
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
};