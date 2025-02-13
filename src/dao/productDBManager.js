import productModel from "./models/productModel.js";

class productDBManager {
    
    async getAllProducts(params) {
        const page = params.page ? parseInt(params.page) : 1;
        const limit = params.limit ? parseInt(params.limit) : 10;
        const skip = (page - 1) * limit;
    
        // Filtro por categoría si está presente
        const query = params.category ? { category: params.category } : {};
    
        // Definir el orden de los productos (solo si params.sort es una cadena válida)
        const sort = {};
        if (typeof params.sort === 'string' && (params.sort.toLowerCase() === 'asc' || params.sort.toLowerCase() === 'desc')) {
            sort.price = params.sort.toLowerCase() === 'desc' ? -1 : 1;
        }
    
        // Obtener productos con paginación y orden
        const products = await productModel.find(query)
            .sort(sort)
            .limit(limit)
            .skip(skip)
            .lean(); 
            
        // Contar el total de productos
        const total = await productModel.countDocuments(query);
        const totalPages = Math.ceil(total / limit);
    
        // Generar enlaces de paginación con todos los parámetros
        const buildPaginationLink = (targetPage) => {
            let link = `http://localhost:8080/api/products?page=${targetPage}&limit=${limit}`;
            if (params.category) link += `&category=${params.category}`;
            if (params.sort) link += `&sort=${params.sort}`;
            return link;
        };
    
        return {
            products,
            hasPrevPage: page > 1,
            hasNextPage: page < totalPages,
            total,
            prevLink: page > 1 ? buildPaginationLink(page - 1) : null,
            nextLink: page < totalPages ? buildPaginationLink(page + 1) : null
        };
    }

    async getProductByID(pid) {
        const product = await productModel.findById(pid).lean();
        if (!product) throw new Error(`El producto ${pid} no existe!`);
        return product;
    }

    async createProduct(product) {
        const { title, description, price, stock, category } = product;
        if (!title || !description || !price || !stock || !category) {
            throw new Error('Faltan parámetros requeridos');
        }
        const newProduct = new productModel(product);
        await newProduct.save();
        return newProduct;
    }

    async updateProduct(pid, productUpdate) {
        const updatedProduct = await productModel.findByIdAndUpdate(pid, productUpdate, { new: true });
        if (!updatedProduct) throw new Error(`El producto ${pid} no existe!`);
        return updatedProduct;
    }

    async deleteProduct(pid) {
        const deletedProduct = await productModel.findByIdAndDelete(pid);
        if (!deletedProduct) throw new Error(`El producto ${pid} no existe!`);
        return deletedProduct;
    }

    async getUniqueCategories() {
        const categories = await productModel.distinct('category');
        return categories;
    }
}

export default productDBManager;