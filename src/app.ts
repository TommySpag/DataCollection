import express from 'express';
import { ImportedProduct } from './interfaces/product.interface';
import userRoutes from './routes/user.route';
import productRoutes from './routes/product.route';
import { errorMiddleware } from './middlewares/error.middleware';
import axios from 'axios';
import { logger } from './utils/logger';
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

import * as fs from 'fs';
const app = express();

app.use(express.json());

export async function fetchProducts(): Promise<void> {
  try {
    logger.info('Fetch data from fakestoreapi');
    const response = await axios.get('https://fakestoreapi.com/products');
    const productsToModify: ImportedProduct[] = response?.data;
    const products = productsToModify.map(product => ({
      id: product.id,
      name: product.title,
      description: product.description,
      category: product.category,
      quantity: Math.floor((Math.random() * 50) + 1), // Générer une quantité aléatoire entre 1 et 50
      price: product.price
    }));
    fs.writeFileSync('./products.json', JSON.stringify(products, null, 2), 'utf-8'); //Vient placer les données dans le fichier

  } catch (e) {
    console.log('Erreur -> Transfert produits API externe')
  }
}

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

app.use('/api/v1', userRoutes);
app.use('/api/v1', productRoutes);

app.use(errorMiddleware);

export default app;