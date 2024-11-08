import app, {fetchProducts} from './app';
import session from 'express-session';
import { config } from './config/config';
import {logger} from './utils/logger';
import https from 'https';
import fs from 'fs';
import path from 'path';


// Middleware de session avec la clé secrète provenant des variables de configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // Les cookies sécurisés ne sont activés qu'en production
  }
}));

//JUST IN DEV
const httpsOptions: https.ServerOptions = {  key: fs.readFileSync(path.resolve(config.CERT_KEY ?? "")),  cert: fs.readFileSync(path.resolve(config.CERT_CERT ?? "")),};
const port = config.port;

// Démarrage du serveur

function start() {
  logger.info('Demarrage app');
  https.createServer(httpsOptions, app).listen(port, () => {  console.log(`Server is running on https://localhost:${port}`);});
  fetchProducts();
}

start();
