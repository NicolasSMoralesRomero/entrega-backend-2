import { cartsModel } from "./models/cartModel.js";

class cartDBManager {

    constructor(productDBManager) {
        this.productDBManager = productDBManager;
    }

    async getAllCarts() {
        return cartsModel.find();
    }

    async getProductsFromCartByID(cid) {
        const cart = await cartsModel.findOne({ _id: cid }).populate('products.productId');

        if (!cart) throw new Error(`El carrito ${cid} no existe!`);
        
        return cart;
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
            cart.products.push({ product: pid, quantity: 1 });
        }
        
        await cartsModel.updateOne({ _id: cid }, { products: cart.products });
        return await this.getProductsFromCartByID(cid);
    }

    async deleteProductByID(cid, pid) {
        await this.productDBManager.getProductByID(pid);

        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        const newProducts = cart.products.filter(item => item.product.toString() !== pid);

        await cartsModel.updateOne({ _id: cid }, { products: newProducts });
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
        if (!quantity || isNaN(parseInt(quantity))) throw new Error(`La cantidad ingresada no es válida!`);

        await this.productDBManager.getProductByID(pid);

        const cart = await cartsModel.findOne({ _id: cid });
        if (!cart) throw new Error(`El carrito ${cid} no existe!`);

        const productIndex = cart.products.findIndex(item => item.product.toString() === pid);
        if (productIndex === -1) throw new Error(`El producto ${pid} no existe en el carrito ${cid}!`);

        cart.products[productIndex].quantity = parseInt(quantity);

        await cartsModel.updateOne({ _id: cid }, { products: cart.products });
        return await this.getProductsFromCartByID(cid);
    }

    async deleteAllProducts(cid) {
        await cartsModel.updateOne({ _id: cid }, { products: [] });
        return await this.getProductsFromCartByID(cid);
    }
}

export { cartDBManager };
