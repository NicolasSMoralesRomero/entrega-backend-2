import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const router = Router();
const productDB = new productDBManager();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Rutas para vistas

router.get('/products/:pid', async (req, res) => {
    try {
        const product = await ProductService.getProductByID(req.query)
        if (product) {
            const productData = {
                _id: product._id,
                title: product.title,
                description: product.description,
                price: product.price,
                stock: product.stock,
                category: product.category
            };
            res.render('productDetail', {
                title: product.title,
                product: productData
            });
        } else {
            res.status(404).send('Producto no encontrado');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

router.get('/', async (req, res) => {
    try {
        const products = await ProductService.getAllProducts(req.query);
        let cart = await CartService.getAllCarts();

        if (!cart) {
            cart = new createCart();
            await cart.save();
        }

        res.render('home', {
            title: 'Home',
            products,
            cartProducts: cart.products
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});
export default router;