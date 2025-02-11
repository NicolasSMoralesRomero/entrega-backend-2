import mongoose from 'mongoose';

const ticketSchema = new mongoose.Schema({
    code: { type: String, unique: true, required: true },
    purchase_datetime: { type: Date, default: Date.now },
    amount: { type: Number, required: true },
    purchaser: { type: String, required: true }
});

ticketSchema.pre('save', function(next) {
    console.log(`Generando ticket con código: ${this.code}`);
    next();
});

const ticketModel = mongoose.model('Ticket', ticketSchema);
export default ticketModel;