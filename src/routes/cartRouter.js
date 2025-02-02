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

        //console.log(cart)

        if (!cart) {
            return res.status(404).send('Carrito no encontrado');
        }

        const cartProducts = cart.products.map(item => ({
            productId: item._id,
            title: item.id, //tengo el id, pero necesito "acceder a BD productos para decodificar el nombre en base al id, lo mismo con precio"
            quantity: item.quantity,
            price: item.price
        }));

        // Calcular el total
        const total = cartProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);

        res.render('cart', {
            cart: cartProducts,
            total: total
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
        const products = await CartService.updateProductByID(cid, pid, quantity);
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
        const products = await CartService.deleteAllProducts(cid);
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