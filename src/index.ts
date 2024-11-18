import app, {fetchProducts} from './app';
import session from 'express-session';
import { config } from './config/config';
import {logger} from './utils/logger';
import mongoose from 'mongoose';
import https from 'https';
import fs from 'fs';
import path from 'path';
import os from 'os';

function getLocalIPAddress() {
  const networkInterfaces = os.networkInterfaces();
  for (const interfaceName in networkInterfaces) {
    const addresses = networkInterfaces[interfaceName];
    for (const address of addresses ?? []) {
      if (address.family === 'IPv4' && !address.internal) {
        return address.address;
      }
    }
  }
  return 'IP address not found';
}

// Middleware de session avec la clé secrète provenant des variables de configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // Les cookies sécurisés ne sont activés qu'en production
  }
}));

const httpsOptions: https.ServerOptions = {  key: fs.readFileSync(path.resolve(config.CERT_KEY ?? "")),  cert: fs.readFileSync(path.resolve(config.CERT_CERT ?? "")),};
const port = config.port;
const ip = getLocalIPAddress();

// Démarrage du serveur
if(config.nodeEnv == 'production') {
    logger.info('Demarrage app');

    mongoose.connect(config.databaseUrl + 'production', {
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    })
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });

    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB:'));
    db.once('open', () => {
      console.log('Connexion à MongoDB réussie');
    });

    app.listen(port, () => {  console.log(`Server is running on https://${ip}:${port}`);});
    fetchProducts();
} else {
    logger.info('Demarrage app');

    mongoose.connect(config.databaseUrl + 'test', {
      socketTimeoutMS: 30000,
      connectTimeoutMS: 30000,
    })
    .then(() => {
      console.log('MongoDB connected successfully');
    })
    .catch((error) => {
      console.error('MongoDB connection error:', error);
    });
    
    const db = mongoose.connection;
    db.on('error', console.error.bind(console, 'Erreur de connexion à MongoDB:'));
    db.once('open', () => {
      console.log('Connexion à MongoDB réussie');
    });

    https.createServer(httpsOptions, app).listen(port, () => {  console.log(`Server is running on https://${ip}:${port}`);});
    fetchProducts();
}
