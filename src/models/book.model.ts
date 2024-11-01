import mongoose, { Schema } from 'mongoose';
import { IBook } from '../interfaces/book.interface';

export const bookSchema: Schema = new Schema({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  });

const Book = mongoose.model<IBook>('Book', bookSchema, 'Book'); //Troisième argument spécifie le nom de collection

export default Book;
