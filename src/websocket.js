import ProductDBManager from './dao/productDBManager.js';

const productService = new ProductDBManager();

export default (io) => {
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado');

        // Obtener productos con paginación, filtros y orden
        socket.on('getProducts', async ({ page = 1, limit = 10, category, sortBy = 'title', sortOrder = 'asc' }) => {
            try {
                const { products, hasPrevPage, hasNextPage } = await productService.getProducts({ 
                    page, 
                    limit, 
                    category, 
                    sortBy, 
                    sortOrder 
                });
                socket.emit('updateProducts', { products, hasPrevPage, hasNextPage });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Filtrar productos por categoría
        socket.on('filterProducts', async ({ category, page = 1, limit = 10 }) => {
            try {
                const { products, hasPrevPage, hasNextPage } = await productService.getProducts({
                    page, 
                    limit, 
                    category
                });
                socket.emit('updateProducts', { products, hasPrevPage, hasNextPage });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Agregar un nuevo producto
        socket.on('createProduct', async (data) => {
            try {
                await productService.createProduct(data);
                const { products } = await productService.getProducts({});  // Obtener productos después de crear uno nuevo
                io.emit('updateProducts', { products });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Eliminar un producto por ID
        socket.on('deleteProduct', async (data) => {
            try {
                await productService.deleteProduct(data.pid);  // Eliminar el producto por su ID
                const { products } = await productService.getProducts({});  // Obtener productos después de la eliminación
                io.emit('updateProducts', { products });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Actualizar un producto existente (se puede agregar si se necesita)
        socket.on('updateProduct', async (data) => {
            try {
                const { pid, updatedData } = data;
                await productService.updateProduct(pid, updatedData);  // Llamada al método de actualización del producto
                const { products } = await productService.getProducts({});  // Obtener productos después de actualizar uno
                io.emit('updateProducts', { products });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });
    });
};
