import { Request, Response } from 'express';
import { ProductService } from '../services/product.service';
import { Product, ProductDTO, ModifyProductDTO } from '../interfaces/product.interface';
import { ProductModel, ProductDTOModel, ModifyProductDTOModel } from '../models/product.model';
import {logger} from '../utils/logger';
import { config } from '../config/config';

export class ProductController {
    public async getAllProducts(){
        logger.info('Démarrage getAllProducts -> ProductController');
        const products = await ProductService.getAllProducts();
        return products;
    }

    public async getProductsPriceFilter(minPrice: number, maxPrice: number){
        logger.info('Démarrage getProductsPriceFilter -> ProductController');
        const products = await ProductService.filterProductsByPrice(minPrice, maxPrice);
        return products;
    }

    public async getProductsQuantityFilter(minStock: number, maxStock: number){
        logger.info('Démarrage getProductsQuantityFilter -> ProductController');
        const products = await ProductService.filterProductsByQuantity(minStock, maxStock);
        return products;
    }

    public async modifyProduct(id: number, newProduct: ModifyProductDTO) : Promise<number> {
        logger.info('Démarrage modifyProduct -> ProductController');
        return await ProductService.modifyProduct(id, newProduct);
    }

    public async deleteProduct(id: number) : Promise<number> {
        logger.info('Démarrage deleteProduct -> ProductController');
        return await ProductService.deleteProduct(id);
    }

    public async registerProduct(product: ProductDTO) : Promise<number> {
        logger.info('Démarrage registerProduct -> ProductController');
        return await ProductService.createProduct(product);
    }
}