const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { 
        points: { type: Number, default: 0 },
        balance: { type: Number, default: 0 }
    },
    stock: { type: Number, default: -1 }, // -1 for unlimited
    image: { type: String },
    type: { type: String, enum: ['cosmetic', 'privilege', 'other'], required: true }
}, { timestamps: true });

module.exports = mongoose.model('Item', ItemSchema);