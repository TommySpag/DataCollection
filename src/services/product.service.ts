import { Product, ProductDTO, ModifyProductDTO } from "../interfaces/product.interface";
import * as fs from 'fs';
import { ProductModel, ProductDTOModel, ModifyProductDTOModel } from "../models/product.model";

export class ProductService {

    public static products: Product[] = JSON.parse(fs.readFileSync('./products.json', 'utf-8'));
    public static nameRegex: RegExp = /^.{3,50}$/;
    public static priceRegex: RegExp = /^\d+(\.\d+)?$/;
    public static quantityRegex: RegExp = /^[1-9]\d*$/;

    public static getProductByName(name: string) {
        return this.products.find(product => product.name === name);
    }

    public static getProductById(id: number) {
        return this.products.find(product => product.id === id);
    }

    public static async createProduct(product: ProductDTO) : Promise<number> {
        let id = 1;
        let category = "Placeholder";
        if(this.products.length != 0){
            id = this.products[this.products.length - 1].id + 1;
        }
        if (this.nameRegex.test(product.name) && this.priceRegex.test(product.price.toString()) && this.quantityRegex.test(product.quantity.toString())) {
            this.products.push(
                {
                    id: id,
                    name: product.name,
                    description: product.description,
                    category: category,
                    quantity: product.quantity,
                    price: product.price
                }
            )
            if (ProductService.getProductByName(product.name)) {
                return 200;
            }
            else {
                return 400;
            }
        } else {
            return 400;
        }
    }

    public static async modifyProduct(id: number, newProduct: ModifyProductDTO) : Promise<number> {
        const oldProduct = ProductService.getProductById(id);
        let isValid = true;

        if (!oldProduct) {
            return 404;
        }
        const regexPatterns ={
            name: this.nameRegex,
            description: /.*/, //Aucune vérification demandée
            price: this.priceRegex,
            quantity: this.quantityRegex,
        }
        try {
            //Va vérifier chaque paramètre du product entrant, avec un regex, et changer le flag dépendamment
            Object.keys(newProduct).forEach((key) => {
               if(regexPatterns[key as keyof ModifyProductDTO]) {
                    const pattern = regexPatterns[key as keyof ModifyProductDTO];
                    const value = newProduct[key as keyof ModifyProductDTO];
                    if(value !== undefined && !pattern.test(String(value))) {
                        isValid = false;
                    }
               }
            });
            if (isValid) {
                const updatedProduct = {
                    id: oldProduct.id,
                    name: newProduct.name !== undefined ? newProduct.name : oldProduct.name,
                    description: newProduct.description !== undefined ? newProduct.description : oldProduct.description,
                    category: oldProduct.category,
                    quantity: newProduct.quantity !== undefined ? newProduct.quantity : oldProduct.quantity,
                    price: newProduct.price !== undefined ? newProduct.price : oldProduct.price
                };
    
                this.products = this.products.map(currentProduct => currentProduct.id === id ? updatedProduct : currentProduct);
                return 200;
            }
            else {
                return 400;
            }

        } catch (e) {
            return 400;
        }
    }

    public static async deleteProduct(id: number) : Promise<number> {
        if (!ProductService.getProductById(id)) {
            return 404;
        }
        try {
            this.products = this.products.filter(product => product.id !== id);
            return 200;
        } catch (e) {
            return 400;
        }
    }

    public static async filterProductsByPrice(minPrice: number, maxPrice: number) : Promise<Product[]> {
        return this.products.filter(product => product.price >= minPrice && product.price <= maxPrice);
    }

    public static async filterProductsByQuantity(minStock: number, maxStock: number): Promise<Product[]> {
        return this.products.filter(product => product.quantity >= minStock && product.quantity <= maxStock);
    }

    public static async getAllProducts() : Promise<Product[]> {
        return this.products;
    }
}