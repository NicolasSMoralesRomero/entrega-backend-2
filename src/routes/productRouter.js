import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';

const router = Router();
const productDB = new productDBManager();

// Endpoint para obtener todos los productos con paginación y filtro por categoría
router.get('/', async (req, res) => {
    try {
        const { limit = 10, page = 1, category = '', sort = '' } = req.params;
        const params = { limit: parseInt(limit), page: parseInt(page), category, sort };

        const result = await productDB.getAllProducts(params);
        
        res.render('products', {
            title: 'productos',
            products: result.title,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            total: result.total,
            prevLink: result.products.prevLink,
            nextLink: result.products.nextLink,
            limit: parseInt(limit)
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint para obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productDB.getProductByID(req.params.pid)
        
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

// Endpoint para crear un nuevo producto
router.post('/', async (req, res) => {
    const { title, description, price, stock, category } = req.body;

    if (!title || !description || !price || !category) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos' });
    }

    try {
        const newProduct = await productDB.createProduct(req.body);
        console.log(newProduct);
        
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Endpoint para actualizar un producto
router.put('/:pid', async (req, res) => {
    try {
        const updatedProduct = await productDB.updateProduct(req.params.pid, req.body);
        res.json(updatedProduct);
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
});

// Endpoint para eliminar un producto
router.delete('/:pid', async (req, res) => {
    try {
        await productDB.deleteProduct(req.params.pid);
        res.status(204).end();
    } catch (err) {
        console.error(err);
        res.status(404).json({ error: err.message });
    }
});

export default router;
