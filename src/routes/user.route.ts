import express, { Request, Response, NextFunction } from 'express';
import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { config } from '../config/config';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const router = Router();
const userController = new UserController();
const SECRET_KEY = config.jwtSecret;

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Retrieve a list of users
 *     description: Retrieve a list of users from the API. Can be used to populate a list of users in your system.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                     example: John Doe
 *                   password:
 *                     type: string
 *                     example: hispassword
 */
router.get('/users', userController.getAllUsers);

/**
 * @swagger
 * /api/register:
 *   post:
 *     summary: Register a new user
 *     description: Registers a new user by creating a username and password after hashing the password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username for the new user
 *                 example: exampleUser
 *               password:
 *                 type: string
 *                 description: The password for the new user
 *                 example: examplePassword
 *     responses:
 *       '200':
 *         description: User successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Utilisateur inscrit avec succès
 *       '400':
 *         description: Bad request, invalid input
 */
router.post('/register', async (req: Request, res: Response) => {
    const { username, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);
    userController.registerUser({ username, password: hashedPassword });

    res.json({ message: 'User registered successfully' });
});

/**
 * @swagger
 * /api/login:
 *   post:
 *     summary: Login and generate a JWT
 *     description: Authenticates a user and generates a JSON Web Token (JWT) for access to protected resources.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *                 description: The username of the user trying to log in
 *                 example: exampleUser
 *               password:
 *                 type: string
 *                 description: The password of the user trying to log in
 *                 example: examplePassword
 *     responses:
 *       '200':
 *         description: Successfully logged in and JWT generated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: The JWT token for authenticated access
 *                   example: your_jwt_token
 *       '400':
 *         description: Invalid username or password
 */
router.post('/login', userController.verifyUser);

const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
        return res.status(403).json({ message: 'Token required' });
    }

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.body.user = decoded;
        next();
    });
};

/**
 * @swagger
 * /api/protected:
 *   get:
 *     summary: Access a protected resource
 *     description: Access a protected endpoint which requires a valid JWT token in the `Authorization` header.
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       '200':
 *         description: Successfully accessed protected resource
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   description: Message confirming access to the protected resource
 *                   example: Bienvenue, exampleUser, vous avez accès à cette ressource protégée !
 *       '403':
 *         description: Forbidden, invalid or missing JWT token
 */
router.get('/protected', verifyToken, (req: Request, res: Response) => {
    res.json({ message: `Welcome, ${req.body.user.username}, you have access to this protected resource!` });
});

export default router;