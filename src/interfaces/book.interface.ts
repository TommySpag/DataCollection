import { Document } from "mongoose";
export interface IBook extends Document {
    title: String;
    author: String;
}