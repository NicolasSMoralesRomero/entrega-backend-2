import ProductDBManager from './dao/productDBManager.js';

const productService = new ProductDBManager();

export default (io) => {
    io.on('connection', (socket) => {
        console.log('Nuevo cliente conectado');

        async function refreshProducts(socket) {
            try {
                const { products, hasPrevPage, hasNextPage } = await productService.getAllProducts({
                    page: 1,
                    limit: 10,
                    category: '',
                    sortBy: 'title',
                    sortOrder: 'asc'
                });
                io.emit('updateProducts', { products, hasPrevPage, hasNextPage });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        }

        // Obtener productos con paginación, filtros y orden
        socket.on('getProducts', async ({ page, limit, category, sortBy, sortOrder }) => {
            try {
                const { products, hasPrevPage, hasNextPage } = await productService.getAllProducts({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    category,
                    sort: sortOrder
                });
        
                socket.emit('updateProducts', { products, hasPrevPage, hasNextPage });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Filtrar productos por categoría
        socket.on('filterProducts', async ({ category = '', page = 1, limit = 10, sortBy = 'title', sortOrder = 'asc' }) => {
            try {
                const { products, hasPrevPage, hasNextPage } = await productService.getAllProducts({
                    page: parseInt(page),
                    limit: parseInt(limit),
                    category,
                    sortBy,
                    sortOrder
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
                await refreshProducts(socket);
                socket.emit('productCreated', { success: true, message: 'Producto creado exitosamente.' });
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Eliminar un producto por ID
        socket.on('deleteProduct', async (data) => {
            try {
                await productService.deleteProduct(data.pid);
                await refreshProducts(socket);
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });

        // Actualizar un producto existente
        socket.on('updateProduct', async (data) => {
            try {
                const { pid, updatedData } = data;
                await productService.updateProduct(pid, updatedData);
                await refreshProducts(socket);
            } catch (error) {
                socket.emit('statusError', error.message);
            }
        });
    });
};
