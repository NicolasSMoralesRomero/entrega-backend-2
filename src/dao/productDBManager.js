import productModel from "./models/productModel.js";

class productDBManager {
    
    async getAllProducts(params) {
        const paginate = {
            page: params.page ? parseInt(params.page) : 1,
            limit: params.limit ? parseInt(params.limit) : 10,
        };

        if (params.sort && (params.sort === 'asc' || params.sort === 'desc')) paginate.sort = { price: params.sort };

        const query = params.category ? { category: params.category } : {}; // Filtro por categoría

        // Obtener productos con paginación
        const products = await productModel.find(query)
            .limit(paginate.limit)
            .skip((paginate.page - 1) * paginate.limit);

        // Contar el total de productos para la paginación
        const total = await productModel.countDocuments(query);

        // Generar enlaces de paginación
        products.prevLink = paginate.page > 1 ? `http://localhost:8080/api/products?page=${paginate.page - 1}&limit=${paginate.limit}` : null;
        products.nextLink = (paginate.page * paginate.limit) < total ? `http://localhost:8080/api/products?page=${paginate.page + 1}&limit=${paginate.limit}` : null;

        // Agregar orden de precios si corresponde
        if (paginate.sort) {
            if (products.prevLink) products.prevLink += `&sort=${params.sort}`;
            if (products.nextLink) products.nextLink += `&sort=${params.sort}`;
        }

        return {
            products,
            hasPrevPage: paginate.page > 1,
            hasNextPage: (paginate.page * paginate.limit) < total,
            total
        };
    }

    async getProductByID(pid) {
        const product = await productModel.findById(pid);
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
}

export default productDBManager;