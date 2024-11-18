import { Document } from "mongoose";

export interface ImportedProduct {
    id: number,
    title: string,
    price: number,
    description: string,
    category: string,
    image: string,
    rating: {
        rate: number,
        count: number
    }
}

export interface Product {
    id: number;
    name: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
}

export interface ProductDTO {
    name: string;
    description: string;
    quantity: number;
    price: number;
}

export interface ModifyProductDTO {
    name?: string;
    description?: string;
    quantity?: number;
    price?: number;
}

export interface IProduct extends Document {
    name: string;
    description: string;
    category: string;
    quantity: number;
    price: number;
}