import { Product, ProductDTO, ModifyProductDTO, IProduct } from '../interfaces/product.interface';
import mongoose, { Schema } from 'mongoose';

export class ProductModel implements Product {
  constructor(public id: number, public name: string, public description: string, public category: string, public quantity: number, public price: number) {}
}

export class ProductDTOModel implements ProductDTO {
  constructor(public name: string, public description: string, public quantity: number, public price: number) {}
}

export class ModifyProductDTOModel implements ModifyProductDTO {
  constructor(public name?: string, public description?: string, public quantity?: number, public price?: number) {}
}

export const productSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model<IProduct>('Product', productSchema, 'products');

export default Product;