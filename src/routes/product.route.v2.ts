import express, { Router, Request, Response, NextFunction } from 'express';
import Product from '../models/product.model';
import Joi from 'joi';
import { config } from '../config/config';
import {logger} from '../utils/logger';
import jwt from 'jsonwebtoken';

const router = Router();
const SECRET_KEY = config.jwtSecret;

const productSchema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    description: Joi.string().required(),
    category: Joi.string().required(),
    quantity: Joi.number().integer().min(0).required(),
    price: Joi.number().greater(0).required(),
    user: Joi.object().optional() //Ajouté lors de la verif du token, faut pas le considérer
  });

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    logger.info('vérification du token');
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ message: 'Token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(401).json({ message: 'Invalid token' });
        }
        req.body.user = decoded;
        next();
    });
};

const canManage = (req: Request, res: Response, next: NextFunction) => {
    const user = req.body.user;
    if(user && user.role === 'gestionnaire') {
        next();
    } else {
        return res.status(403).json({message: 'Forbidden: This account does not have access to this'})
    }
}
  
async function validateProducts(req: Request, res: Response, next: NextFunction) {
    const { error } = productSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

async function getProduct(req: Request, res: Response, next: NextFunction) {
    let product;
    try {
      product = await Product.findById(req.params.id);
      if (product == null) {
        return res.status(404).json({ message: 'Produit non trouvé' });
      }
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  
    res.locals.product = product;
    next();
  }

/**
 * @swagger
 * /api/v2/products:
 *   get:
 *     tags:
 *       - "Product (v2)"
 *     summary: Récupère tous les produits avec filtres (facultatifs) - Possible pour les employées
 *     description: Récupère la liste des produits en fonction des filtres de prix et de stock fournis.
 *     parameters:
 *       - name: minPrice
 *         in: query
 *         description: Prix minimum pour le filtrage des produits.
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *       - name: maxPrice
 *         in: query
 *         description: Prix maximum pour le filtrage des produits.
 *         required: false
 *         schema:
 *           type: number
 *           format: float
 *       - name: minStock
 *         in: query
 *         description: Quantité minimum pour le filtrage des produits.
 *         required: false
 *         schema:
 *           type: integer
 *       - name: maxStock
 *         in: query
 *         description: Quantité maximum pour le filtrage des produits.
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Liste des produits filtrés
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: number
 *                     example: 1
 *                   name:
 *                     type: string
 *                     example: Mens Black Jacket
 *                   description:
 *                     type: string
 *                     example: A black leather jacket
 *                   category:
 *                     type: string
 *                     example: Menswear
 *                   quantity:
 *                     type: number
 *                     example: 50
 *                   price:
 *                     type: number
 *                     example: 59.99
 */
router.get('/products', async (req: Request, res: Response) => {
    try {
        logger.info('Démarrage du GET products');
        const { minPrice, maxPrice, minStock, maxStock } = req.query;
        let query: any = {};

        if (minPrice != undefined || maxPrice != undefined) {
            query.price = {};
            if(minPrice != undefined) {
                query.price.$gte = parseFloat(minPrice as string);
            }
            if(maxPrice != undefined) {
                query.price.$lte = parseFloat(maxPrice as string);
            }
        }

        else if (minStock != undefined || maxStock != undefined) {
            query.quantity = {};
            if(minStock != undefined) {
                query.quantity.$gte = parseInt(minStock as string);
            }
            if(maxStock != undefined) {
                query.quantity.$lte = parseInt(maxStock as string);
            }
        }
        
        const product = await Product.find(query);
        return res.status(200).json(product);

    } catch (err) {
        return res.status(400).json({ error: 'An error occurred while fetching products.' });
    }
});

/**
 * @swagger
 * /api/v2/products:
 *   post:
 *     tags:
 *       - "Product (v2)"
 *     summary: Enregistre un nouveau produit
 *     description: Ajoute un nouveau produit au système.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mens Black Jacket
 *               description:
 *                 type: string
 *                 example: A black leather jacket
 *               category:
 *                 type: string
 *                 example: menswear
 *               quantity:
 *                 type: number
 *                 example: 50
 *               price:
 *                 type: number
 *                 example: 59.99
 *     responses:
 *       '200':
 *         description: Produit enregistré avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produit enregistré avec succès
 *       '400':
 *         description: Requête incorrecte par valeurs invalides
 *       '401':
 *         description: Non autorisé
 */
router.post('/products', verifyToken, canManage, validateProducts, async (req: Request, res: Response) => {
    logger.info('Démarrage du POST product');
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            category: req.body.category,
            quantity: req.body.quantity,
            price: req.body.price
        });
        const createProduct = await product.save();
        res.status(200).json(createProduct);
    } catch (error) {
        res.status(400).json({ message: (error as Error).message });
    }
});

/**
 * @swagger
 * /api/v2/products/{id}:
 *   put:
 *     tags:
 *       - "Product (v2)"
 *     summary: Modifie un produit existant
 *     description: Modifie les informations d'un produit basé sur son identifiant.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Identifiant du produit à modifier
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Mens Black Jacket
 *               description:
 *                 type: string
 *                 example: A black leather jacket
 *               category:
 *                 type: string
 *                 example: menswear
 *               quantity:
 *                 type: number
 *                 example: 50
 *               price:
 *                 type: number
 *                 example: 59.99
 *     responses:
 *       '200':
 *         description: Produit modifié avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Produit modifié avec succès
 *       '400':
 *         description: Requête incorrecte
 *       '404':
 *         description: Produit non trouvé
 *       '401':
 *         description: Non autorisé
 */
router.put('/products/:id',verifyToken, canManage, getProduct,  async (req: Request, res: Response) => {
    for (let key in req.body) {
        if (req.body[key] != null) {
            res.locals.product[key] = req.body[key];
        }
    }
    try {
        const updatedProduct = await res.locals.product.save();
        res.json(updatedProduct);
    } catch (err) {
        res.status(400).json({ message: (err as Error).message });
    }
});

/**
 * @swagger
 * /api/v2/products/{id}:
 *   delete:
 *     tags:
 *       - "Product (v2)"
 *     summary: Supprime un produit
 *     description: Supprime un produit du système en fonction de son identifiant.
 *     parameters:
 *       - name: id
 *         in: path
 *         description: Identifiant du produit à supprimer
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: Produit supprimé avec succès
 *       '500':
 *         description: Requête incorrecte
 *       '404':
 *         description: Produit non trouvé
 *       '401':
 *         description: Non autorisé
 */
router.delete('/products/:id',verifyToken, canManage, getProduct, async (req: Request, res: Response) => {
    logger.info('Démarrage du DELETE product');
    try {
        await Product.deleteOne(res.locals.product)
        res.json({ message: 'Produit supprimé avec succès' });
      } catch (err) {
        res.status(500).json({ message: (err as Error).message });
      }
});

export default router;