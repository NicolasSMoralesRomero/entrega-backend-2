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
        // Verificar que el producto existe antes de agregarlo al carrito
        await this.productDBManager.getProductByID(pid);
    
        const cart = await cartsModel.findById(cid);
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    
        // Buscar si el producto ya está en el carrito
        let productIndex = cart.products.findIndex(item => item.productId.toString() === pid);
    
        if (productIndex !== -1) {
            // Si ya existe, aumentar la cantidad
            cart.products[productIndex].quantity += 1;
        } else {
            // Si no existe, agregarlo con cantidad 1
            cart.products.push({ productId: pid, quantity: 1 });
        }
    
        // Guardar el carrito actualizado
        await cart.save();
        
        return await this.getProductsFromCartByID(cid);
    }
    

    async deleteProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);  // Verifica si el producto existe
    
        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
    
        // Filtrar el producto que debe ser eliminado
        const newProducts = cart.products.filter(item => item.productId.toString() !== pid);
    
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

    async updateProductByID(cid, pid, change) {
        if (change === undefined || isNaN(parseInt(change))) {
            throw new Error('La cantidad ingresada no es válida!');
        }
        
        await this.productDBManager.getProductByID(pid);  // Verifica si el producto existe
        
        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
        
        const productIndex = cart.products.findIndex(item => item.productId.toString() === pid);
        
        if (productIndex === -1) {
            throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);
        }
    
        // Sumar/restar cantidad
        const nuevaCantidad = cart.products[productIndex].quantity + parseInt(change);
    
        if (nuevaCantidad <= 0) {
            // Si la cantidad es 0 o menos, eliminamos el producto del carrito
            cart.products.splice(productIndex, 1);
        } else {
            cart.products[productIndex].quantity = nuevaCantidad;
        }
    
        // Guardar cambios
        await cart.save();
        
        // Retornar el carrito actualizado
        return await this.getProductsFromCartByID(cid);
    }    
    

    async deleteAllProducts(cid) {
        await cartsModel.updateOne({ _id: cid }, { products: [] });
        return await this.getProductsFromCartByID(cid);
    }
}

export { cartDBManager };
