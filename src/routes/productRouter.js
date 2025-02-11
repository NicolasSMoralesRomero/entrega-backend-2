import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();
const productDB = new productDBManager();

// Obtener todos los productos
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
            limit: parseInt(limit),
            user: req.user || null, // Pasar usuario autenticado
            isAdmin: req.user && req.user.role === 'admin' // Pasar variable para Handlebars
        });
        
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productDB.getProductByID(req.params.pid);
        
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        console.log("Producto encontrado:", product); // 👈 Verifica que el producto se obtiene bien
        
        res.render('productDetail', { 
            title: product.title, 
            product 
        });

    } catch (err) {
        console.error("Error al obtener producto:", err);
        res.status(500).send('Internal Server Error');
    }
});

// Crear un producto (SOLO ADMINISTRADOR)
router.post('/', authorizeRole('admin'), async (req, res) => {
    try {
        const newProduct = await productDB.createProduct(req.body);
        res.status(201).json(newProduct);
    } catch (err) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Actualizar un producto (SOLO ADMINISTRADOR)
router.put('/:pid', authorizeRole('admin'), async (req, res) => {
    try {
        const updatedProduct = await productDB.updateProduct(req.params.pid, req.body);
        res.json(updatedProduct);
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

// Eliminar un producto (SOLO ADMINISTRADOR)
router.delete('/:pid', authorizeRole('admin'), async (req, res) => {
    try {
        await productDB.deleteProduct(req.params.pid);
        res.status(204).end();
    } catch (err) {
        res.status(404).json({ error: err.message });
    }
});

export default router;