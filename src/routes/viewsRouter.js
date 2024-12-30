import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Rutas para vistas


router.get('/products', async (req, res) => {
    const { limit = 10, page = 1 } = req.query;

    try {
        const products = await ProductService.getAllProducts(req.query)

        const totalProducts = await ProductService.getAllProducts(req.query)
        const hasPrevPage = page > 1;
        const hasNextPage = (page * limit) < totalProducts;

        res.render('products', {
            title: 'Lista de Productos',
            products,
            hasPrevPage,
            hasNextPage,
            prevPage: page - 1,
            nextPage: page + 1,
            limit: parseInt(limit)
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Internal Server Error');
    }
});

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

router.get('/realtimeproducts', (req, res) => {
    res.render('realTimeProducts', { title: 'Real Time Products' });
});
export default router;