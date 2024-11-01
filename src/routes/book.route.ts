import { Router, Request, Response, NextFunction } from 'express';
import Book from '../models/book.model';
import Joi from 'joi';

const router = Router();

// Schéma de validation
const bookSchema = Joi.object({
    title: Joi.string().min(3).required(),
    author: Joi.string().min(3).required()
  });
  
  // Middleware de validation
async function validateBook(req: Request, res: Response, next: NextFunction) {
    const { error } = bookSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
}

/**
 * @swagger
 * /api/books:
 *   get:
 *     summary: Retrieve all books
 *     responses:
 *       '200':
 *         description: A list of books
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
router.get('/books', async (req: Request, res: Response) => {
    try {
      const books = await Book.find();
      res.json(books);
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });
  
  /**
 * @swagger
 * /api/books/{id}:
 *   get:
 *     summary: Retrieve a book by ID
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: A book object
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  router.get('/books/:id', getBook, (req: Request, res: Response) => {
    res.json(res.locals.book);
  });
  
  /**
 * @swagger
 * /api/books:
 *   post:
 *     summary: Add a new book
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the book
 *                 example: exampleTitle
 *               author:
 *                 type: string
 *                 description: The author of the book
 *                 example: exampleAuthor
 *     responses:
 *       '200':
 *         description: The created book
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  router.post('/books', validateBook, async (req: Request, res: Response) => {
    const book = new Book({
      title: req.body.title,
      author: req.body.author,
    });
  
    try {
      const newBook = await book.save();
      res.status(200).json(newBook);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  });
  
  /**
 * @swagger
 * /api/books/{id}:
 *   put:
 *     summary: Update an existing book
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: The title of the book
 *                 example: exampleTitle
 *               author:
 *                 type: string
 *                 description: The author of the book
 *                 example: exampleAuthor
 *     responses:
 *       '200':
 *         description: The updated book
 *       '400':
 *         description: Bad request
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  router.put('/books/:id', getBook, async (req: Request, res: Response) => {
    if (req.body.title != null) {
      res.locals.book.title = req.body.title;
    }
    if (req.body.author != null) {
      res.locals.book.author = req.body.author;
    }
  
    try {
      const updatedBook = await res.locals.book.save();
      res.json(updatedBook);
    } catch (err) {
      res.status(400).json({ message: (err as Error).message });
    }
  });
  
  /**
 * @swagger
 * /api/books/{id}:
 *   delete:
 *     summary: Delete a book
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Confirmation message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '404':
 *         description: Book not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       '500':
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 */
  router.delete('/books/:id', getBook, async (req: Request, res: Response) => {
    try {
      await Book.deleteOne(res.locals.book)
      res.json({ message: 'Livre supprimé' });
    } catch (err) {
      res.status(500).json({ message: (err as Error).message });
    }
  });
  
  // Middleware pour obtenir un livre par ID
  async function getBook(req: Request, res: Response, next: NextFunction) {
    let book;
    try {
      book = await Book.findById(req.params.id);
      if (book == null) {
        return res.status(404).json({ message: 'Livre non trouvé' });
      }
    } catch (err) {
      return res.status(500).json({ message: (err as Error).message });
    }
  
    res.locals.book = book;
    next();
  }
  
  export default router;