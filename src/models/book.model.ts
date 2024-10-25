import mongoose, { Schema } from 'mongoose';
import { IBook } from '../interfaces/book.interface';

const bookSchema: Schema = new Schema({
    title: {
      type: String,
      required: true,
    },
    author: {
      type: String,
      required: true,
    },
  });

const Book = mongoose.model('Book', bookSchema);

export default Book;
