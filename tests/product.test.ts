import {ProductService} from '../src/services/product.service';

test('Returns all products', async () => {
    const products = await ProductService.getAllProducts();
    expect(products.length).toBe(1);
});

test('Creates a product', async () => {
    const product = {name: 'Test product', description: 'Test description', quantity: 10, price: 10.50};
    expect(await ProductService.createProduct(product)).toBe(200);
});

test('Modify a product', async () => {
    const modifiedProduct = {name: 'Modified'}
    await ProductService.modifyProduct(1, modifiedProduct);
    const product = ProductService.getProductById(1);
    expect(product?.name).toBe('Modified');
});

test('Delete product', async () => {
    await ProductService.deleteProduct(1);
    const product = ProductService.getProductById(1);
    expect(product).toBe(undefined);
});