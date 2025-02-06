import { cartsModel } from "./models/cartModel.js";

class cartDBManager {

    constructor(productDBManager) {
        this.productDBManager = productDBManager;
    }

    async getAllCarts() {
        return cartsModel.find();
    }

    // Obtener los productos del carrito por su ID
    async getProductsFromCartByID(cid) {
        const cart = await cartsModel.findOne({ _id: cid }).populate('products.productId');  // Aquí se hace el populate

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        return cart;  // Retorna el carrito con los productos poblados
    }

    async createCart() {
        return await cartsModel.create({ products: [] });
    }

    async addProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);

        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        let productIndex = cart.products.findIndex(item => item.productId === pid);

        if (productIndex >= 0) {
            cart.products[productIndex].quantity += 1;
        } else {
            cart.products.push({ productId: pid, quantity: 1 });
        }

        await cartsModel.updateOne({ _id: cid }, { products: cart.products });
        return await this.getProductsFromCartByID(cid);
    }

    async deleteProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);  // Verifica si el producto existe
    
        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    
        // Filtrar el producto que debe ser eliminado
        const newProducts = cart.products.filter(item => item.productId.toString() !== pid);  // Cambiar 'product' a 'productId'
    
        // Actualizar el carrito
        await cartsModel.updateOne({ _id: cid }, { products: newProducts });
    
        // Retornar el carrito con los productos restantes
        return await this.getProductsFromCartByID(cid);
    }

    async updateAllProducts(cid, products) {
        // Validate if all products exist
        for (let key in products) {
            await this.productDBManager.getProductByID(products[key].product);
        }

        await cartsModel.updateOne({ _id: cid }, { products });
        return await this.getProductsFromCartByID(cid);
    }

    async updateProductByID(cid, pid, quantity) {
        if (!quantity || isNaN(parseInt(quantity))) throw new Error('La cantidad ingresada no es válida!');
    
        await this.productDBManager.getProductByID(pid);  // Verifica si el producto existe
    
        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    
        const productIndex = cart.products.findIndex(item => item.productId.toString() === pid);  // Cambiar 'product' a 'productId'
        if (productIndex === -1) throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);
    
        // Actualizar la cantidad
        cart.products[productIndex].quantity = parseInt(quantity);
    
        // Guardar el carrito actualizado
        await cartsModel.updateOne({ _id: cid }, { products: cart.products });
    
        // Retornar el carrito con los productos actualizados
        return await this.getProductsFromCartByID(cid);
    }

    async deleteAllProducts(cid) {
        await cartsModel.updateOne({ _id: cid }, { products: [] });
        return await this.getProductsFromCartByID(cid);
    }
}

export { cartDBManager };
