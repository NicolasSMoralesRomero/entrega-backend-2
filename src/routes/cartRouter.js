import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await cartService.createCart();
        res.status(201).json({
            status: 'success',
            payload: newCart
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Obtener productos de un carrito específico
router.get('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const products = await CartService.getProductsFromCartByID(cid);
        res.json({
            status: 'success',
            payload: products
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Agregar un producto a un carrito específico
router.post('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const products = await CartService.addProductToCart(cid, pid, quantity);
        res.json({
            status: 'success',
            payload: products
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Eliminar un producto de un carrito específico
router.delete('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    try {
        const products = await CartService.deleteProductFromCart(cid, pid);
        res.json({
            status: 'success',
            payload: products
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Actualizar un producto en el carrito
router.put('/:cid/product/:pid', async (req, res) => {
    const { cid, pid } = req.params;
    const { quantity } = req.body;
    try {
        const products = await CartService.updateProductInCart(cid, pid, quantity);
        res.json({
            status: 'success',
            payload: products
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Eliminar todos los productos de un carrito
router.delete('/:cid', async (req, res) => {
    const { cid } = req.params;
    try {
        const products = await CartService.deleteAllProductsFromCart(cid);
        res.json({
            status: 'success',
            payload: products
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

export default router