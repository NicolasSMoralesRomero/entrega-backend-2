import { Router } from 'express';
import productDBManager from '../dao/productDBManager.js';
import { cartDBManager } from '../dao/cartDBManager.js';
import ticketModel from '../dao/models/ticketModel.js';
import { v4 as uuidv4 } from 'uuid';
import { authorizeRole } from '../middlewares/authMiddleware.js';

const router = Router();
const ProductService = new productDBManager();
const CartService = new cartDBManager(ProductService);

// Crear un nuevo carrito
router.post('/', async (req, res) => {
    try {
        const newCart = await CartService.createCart();
        res.status(201).json({ status: 'success', payload: newCart });
    } catch (err) {
        res.status(500).json({ status: 'error', message: err.message });
    }
});

// Obtener productos de un carrito específico
router.get('/:cid', async (req, res) => {
    try {
        const cart = await CartService.getProductsFromCartByID(req.params.cid);
        const cartProducts = cart.products.map(item => ({
            productId: item.productId._id,
            title: item.productId.title,
            quantity: item.quantity,
            price: item.productId.price
        }));

        const total = cartProducts.reduce((acc, item) => acc + item.price * item.quantity, 0);
        res.render('cart', { cart: cartProducts, total: total, cid: req.params.cid,  isSession: req.session.user ? true : false, });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Agregar un producto a un carrito (SOLO USUARIOS)
router.post('/:cid/product/:pid', authorizeRole('user'), async (req, res) => {
    try {
        const products = await CartService.addProductByID(req.params.cid, req.params.pid, req.body.quantity);
        res.json({ status: 'success', payload: products });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Modificar quantity producto en carrito
router.put('/:cid/product/:pid', authorizeRole('user'), async (req, res) => {
    try {
        const { cid, pid } = req.params;
        const { quantity } = req.body;

        if (!quantity || isNaN(quantity)) {
            console.log("❌ Cantidad inválida");
            return res.status(400).json({ error: 'Cantidad inválida' });
        }

        const updatedCart = await CartService.updateProductByID(cid, pid, quantity);

        res.json({ status: 'success', cart: updatedCart });

    } catch (err) {
        console.error("🚨 Error en updateQuantity:", err);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// Eliminar un producto del carrito
router.delete('/:cid/product/:pid', async (req, res) => {
    try {
        const products = await CartService.deleteProductByID(req.params.cid, req.params.pid);
        res.json({ status: 'success', payload: products });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Vaciar el carrito
router.delete('/:cid/products', async (req, res) => {
    try {
        const updatedCart = await CartService.deleteAllProducts(req.params.cid);
        res.json({ status: 'success', payload: updatedCart });
    } catch (err) {
        res.status(400).json({ status: 'error', message: err.message });
    }
});

// Finalizar compra del carrito
router.post('/:cid/purchase', async (req, res) => {
    try {
        console.log(`Iniciando compra del carrito ${req.params.cid}`);
        const cart = await CartService.getProductsFromCartByID(req.params.cid);

        if (!cart) {
            console.log('Carrito no encontrado');
            return res.status(404).json({ message: 'Carrito no encontrado' });
        }

        let totalAmount = 0, unprocessedProducts = [];
        const productsToUpdate = [];

        for (const item of cart.products) {
            console.log(`Verificando stock para producto: ${item.productId.title}`);
            console.log(`Stock actual: ${item.productId.stock}, cantidad en carrito: ${item.quantity}`);

            if (item.productId.stock >= item.quantity) {
                item.productId.stock -= item.quantity;
                productsToUpdate.push(item.productId.save()); // Guardar actualización sin ejecutarla aún
                totalAmount += item.productId.price * item.quantity;
            } else {
                console.log(`Stock insuficiente para ${item.productId.title}`);
                unprocessedProducts.push({
                    id: item.productId._id.toString(), // Guardamos solo el ID como string
                    title: item.productId.title,
                    stock: item.productId.stock
                });
            }
        }

        // Guardar todos los productos con stock actualizado en paralelo
        await Promise.all(productsToUpdate);

        if (totalAmount === 0) {
            console.log('Ningún producto pudo ser comprado.');
            return res.json({ message: 'No se pudo procesar la compra', unprocessedProducts });
        }

        // Crear ticket
        const ticket = await ticketModel.create({
            code: uuidv4(),
            amount: totalAmount,
            purchaser: req.user.email
        });

        // Obtener los IDs de los productos NO comprados
        const unprocessedProductIds = unprocessedProducts.map(p => p.id);

        // Filtrar el carrito y mantener solo los productos que NO se compraron
        cart.products = cart.products.filter(item =>
            unprocessedProductIds.includes(item.productId._id.toString())
        );

        await cart.save();

        console.log(`Compra finalizada con éxito. Ticket: ${ticket.code}`);
        res.json({ ticket, unprocessedProducts });

    } catch (error) {
        console.error('Error en la compra:', error);
        res.status(500).json({ message: 'Error procesando la compra', error });
    }
});

export default router;
