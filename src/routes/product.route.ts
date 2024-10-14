import express, { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { ModifyProductDTO } from '../interfaces/product.interface';
import { config } from '../config/config';
import {logger} from '../utils/logger';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const productController = new ProductController();
const SECRET_KEY = config.jwtSecret;

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

/**
 * @swagger
 * /api/v1/products:
 *   get:
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
        let products = await productController.getAllProducts();
        let filterMin;
        let filterMax;

        if (minPrice != undefined || maxPrice != undefined) {
            //Vérifie que le filtre est présent, et lui donne une valeur si non
            filterMin = minPrice != undefined ? parseFloat(minPrice as string) : 0;
            filterMax = maxPrice != undefined ? parseFloat(maxPrice as string) : Number.MAX_VALUE;
            products = await productController.getProductsPriceFilter(filterMin, filterMax);
            return res.status(200).json(products);
        }

        else if (minStock != undefined || maxStock != undefined) {
            filterMin = minPrice != undefined ? parseInt(minStock as string) : 0;
            filterMax = maxPrice != undefined ? parseInt(maxStock as string) : Number.MAX_VALUE;
            products = await productController.getProductsQuantityFilter(filterMin, filterMax);
            return res.status(200).json(products);
        }
        else {
            return res.status(200).json(products);
        }
    } catch (err) {
        return res.status(400).json({ error: 'An error occurred while fetching products.' });
    }
});

/**
 * @swagger
 * /api/v1/products:
 *   post:
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
router.post('/products',verifyToken, async (req: Request, res: Response) => {
    logger.info('Démarrage du POST product');
    const { name, description, quantity, price } = req.body;
    switch(await productController.registerProduct({ name, description, quantity, price })){
        case 200:
            return res.status(200).json({message: "Produit enregistré correctement"});
        case 400:
            return res.status(400).json({error: "Produit invalide"});
        case 401:
            return res.status(401).json({error: "Autorisation non concluse"});
    }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   put:
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
router.put('/products/:id',verifyToken, async (req: Request, res: Response) => {
    logger.info('Démarrage du PUT product');
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid product ID' });
    }
    const { name, description, quantity, price }: ModifyProductDTO = req.body;
    switch(await productController.modifyProduct(id, { name, description, quantity, price })){
        case 200:
            return res.status(200).json({message: "Produit modifié correctement"});
        case 400:
            return res.status(400).json({error: "Produit invalide"});
        case 404:
            return res.status(404).json({error: "Produit non trouvé"});
        case 401:
            return res.status(401).json({error: "Autorisation non concluse"});
    }
});

/**
 * @swagger
 * /api/v1/products/{id}:
 *   delete:
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
 *       '400':
 *         description: Requête incorrecte
 *       '404':
 *         description: Produit non trouvé
 *       '401':
 *         description: Non autorisé
 */
router.delete('/products/:id',verifyToken, async (req: Request, res: Response) => {
    logger.info('Démarrage du DELETE product');
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
        res.status(400).json({ error: 'Invalid product ID' });
    }
    switch(await productController.deleteProduct(id)) {
        case 200:
            return res.status(200).json({message: "Produit retiré correctement"});
        case 400:
            return res.status(400).json({error: "Invalid product ID"});
        case 404:
            return res.status(404).json({error: "Produit non trouvé"});
        case 401:
            return res.status(401).json({error: "Autorisation non concluse"});
    }
});

export default router;