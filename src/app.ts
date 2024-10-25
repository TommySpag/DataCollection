import express from 'express';
import userRoutes from './routes/user.route';
import productRoutes from './routes/product.route';
import bookRoutes from './routes/book.route';
import { errorMiddleware } from './middlewares/error.middleware';
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');
const app = express();

app.use(express.json());

// Définir les options de Swagger
const swaggerOptions = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'User API',
        version: '1.0.0',
        description: 'A simple API to manage users',
      },
    },
    apis: [`${__dirname}/routes/*.ts`], // Fichier où les routes de l'API sont définies
  };

// Générer la documentation à partir des options
const swaggerDocs = swaggerJsdoc(swaggerOptions);
  
// Servir la documentation Swagger via '/api-docs'
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.use('/api', userRoutes);
app.use('/api', productRoutes);
app.use('/api', bookRoutes);

app.use(errorMiddleware);

export default app;