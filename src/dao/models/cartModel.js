import mongoose from 'mongoose';

const cartProductSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'productos', required: true },
    quantity: { type: Number, required: true, min: 1 }
});

const cartsSchema = new mongoose.Schema({
    products: [cartProductSchema],
    total: { type: Number, default: 0 }
});

export const cartsModel = mongoose.model('carts', cartsSchema);
