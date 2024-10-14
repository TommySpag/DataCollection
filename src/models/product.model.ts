import { Product, ProductDTO, ModifyProductDTO } from '../interfaces/product.interface';

export class ProductModel implements Product {
  constructor(public id: number, public name: string, public description: string, public category: string, public quantity: number, public price: number) {}
}

export class ProductDTOModel implements ProductDTO {
  constructor(public name: string, public description: string, public quantity: number, public price: number) {}
}

export class ModifyProductDTOModel implements ModifyProductDTO {
  constructor(public name?: string, public description?: string, public quantity?: number, public price?: number) {}
}