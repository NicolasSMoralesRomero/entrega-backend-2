import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await CartService.createCart();
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
        const cart = await CartService.getProductsFromCartByID(cid);
        
        const cartProducts = cart.products.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            quantity: item.quantity,
            price: item.productId.price
        }));

        const total = cartProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);

        res.render('cart', {
            cart: cartProducts,
            total: total,
            cid: cid  // <-- Agregado aquí
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
        const products = await CartService.addProductByID(cid, pid, quantity);
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
        const products = await CartService.deleteProductByID(cid, pid);
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
        const updatedCart = await CartService.updateProductByID(cid, pid, quantity);  // Llamar a la función de actualización
        res.json({
            status: 'success',
            payload: updatedCart  // Devolver el carrito actualizado
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});


// Vaciar todo el carrito
router.delete('/:cid/products', async (req, res) => {
    const { cid } = req.params;
    try {
        const updatedCart = await CartService.deleteAllProducts(cid);
        res.json({
            status: 'success',
            payload: updatedCart
        });
    } catch (err) {
        console.error(err);
        res.status(400).json({ status: 'error', message: err.message });
    }
});

export default router