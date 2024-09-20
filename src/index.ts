import app from './app';
const session = require('express-session');
import { config } from './config/config';

// Middleware de session avec la clé secrète provenant des variables de configuration
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: config.isProduction, // Les cookies sécurisés ne sont activés qu'en production
  }
}));

const port = config.port;

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur en écoute sur <http://localhost>:${port}`);
});