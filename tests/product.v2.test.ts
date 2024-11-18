import request from 'supertest';
import app from '../src/app'
import { UserService } from '../src/services/user.service';
import Product from '../src/models/product.model';
import jwt from 'jsonwebtoken';
import { config } from '../src/config/config';

jest.setTimeout(30000);

describe('API Tests - Product', () => {
    let GestionnaireToken: string | undefined;
    let EmployeeToken: string | undefined;
    const SECRET_KEY = config.jwtSecret;

    const productData = {
        name: "Mens Black Jacket",
        description: "A black leather jacket",
        category: "menswear",
        quantity: 50,
        price: 59.99
    };

    //Authentification
    beforeAll(async () => {
        try{
            await request(app)
                .post('/api/register')
                .send({ username: 'admin', password: 'password', role: 'gestionnaire' });
            
            await request(app)
                .post('/api/register')
                .send({ username: 'bob', password: 'password123', role: 'employee' });

            const login1 = await request(app)
                .post('/api/login')
                .send({ username: 'admin', password: 'password' });

            const login2 = await request(app)
                .post('/api/login')
                .send({ username: 'bob', password: 'password123' });
            GestionnaireToken = login1.body.token as string;
            EmployeeToken = login2.body.token as string;
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    });

    test('Create new product', async () => {
        try{
            const res = await request(app)
            .post('/api/v2/products')
            .set('Authorization', `Bearer ${GestionnaireToken}`)
            .send(productData);
            expect(res.status).toBe(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Should not create product', async () => {
        try{
            const res = await request(app)
            .post('/api/v2/products')
            .set('Authorization', `Bearer ${EmployeeToken}`)
            .send(productData);
            expect(res.status).toBe(403);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Modify product', async () => {
        try{
            const id = "673a51d2efef32359ef4d0f3"
            const res = await request(app)
            .put(`/api/v2/products/${id}`)
            .set('Authorization', `Bearer ${GestionnaireToken}`)
            .send({quantity: 18});
            expect(res.status).toBe(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Should not modify product', async () => {
        try{
            const id = "673a51d2efef32359ef4d0f3"
            const res = await request(app)
            .put(`/api/v2/products/${id}`)
            .set('Authorization', `Bearer ${EmployeeToken}`)
            .send({quantity: 18});
            expect(res.status).toBe(403);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Delete product', async () => {
        try{
            const id = "673a9a0ec097251c4c66c96d"
            const res = await request(app)
                .delete(`/api/v2/products/${id}`)
                .set('Authorization', `Bearer ${GestionnaireToken}`);
            expect(res.status).toBe(200);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Should not delete product', async () => {
        try{
            const id = "673a9a0ec097251c4c66c96d";
            const res = await request(app)
                .delete(`/api/v2/products/${id}`)
                .set('Authorization', `Bearer ${EmployeeToken}`);

            expect(res.status).toBe(403);

            //clean
            await request(app)
                .delete('/api/v2/products/' + id)
                .set('Authorization', `Bearer ${GestionnaireToken}`);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Injection SQL', async () => {
        try{
            const maliciousQuery = { name: { $ne: null } };
            const res = await request(app)
            .get('/api/v2/products')
            .query(maliciousQuery)
            .set('Authorization', `Bearer ${GestionnaireToken}`);
            expect(res.status).toBe(400);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })

    test('Expired Token', async () => {
        try{
            const expiredToken = jwt.sign(
                { username: 'User', role: 'gestionnaire' }, SECRET_KEY, { expiresIn: -1 }
            );

            //Put that modifies nothing
            const id = "673a51d2efef32359ef4d0f1"
            const res = await request(app)
                .put(`/api/v2/products/${id}`)
                .set('Authorization', `Bearer ${expiredToken}`)
                .send({quantity: 2});

            expect(res.status).toBe(401);
        } catch (error: unknown) {
            if (error instanceof Error) {
                throw new Error(error.message);
            } else {
                throw new Error("An unknown error occurred");
            }
        }
    })
})