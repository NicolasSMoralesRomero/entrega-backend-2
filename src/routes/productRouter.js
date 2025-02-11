import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();
const productDB = new productDBManager();

// Obtener todos los productos con paginación, filtros y ordenamiento
router.get('/', async (req, res) => {
    try {
        let { limit = 10, page = 1, category = '', sort = 'title', sortOrder = 'asc' } = req.query;

        limit = parseInt(limit);
        page = parseInt(page);

        // Construir parámetros de consulta alineados con WebSockets
        const params = {
            limit,
            page,
            category: category || null,
            sort: { [sort]: sortOrder === 'asc' ? 1 : -1 }
        };

        const result = await productDB.getAllProducts(params);

        res.render('products', {
            title: 'Productos',
            products: result.products,
            hasPrevPage: result.hasPrevPage,
            hasNextPage: result.hasNextPage,
            total: result.total,
            prevLink: result.prevLink,
            nextLink: result.nextLink,
            limit,
            isSession: !!req.session.user,
            isAdmin: req.user && req.user.role === 'admin',
            sortBy: sort,   // Pasar ordenamiento a Handlebars
            sortOrder       // Pasar dirección de ordenamiento a Handlebars
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Obtener un producto por ID
router.get('/:pid', async (req, res) => {
    try {
        const product = await productDB.getProductByID(req.params.pid);
        
        if (!product) {
            return res.status(404).send('Producto no encontrado');
        }

        res.render('productDetail', { 
            title: product.title, 
            product,
            isSession: req.session.user ? true : false, // Verifica si hay sesión activa
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