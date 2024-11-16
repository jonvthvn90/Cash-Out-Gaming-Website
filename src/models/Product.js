const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String },
    price: { 
        type: Number,
        required: true,
        min: 0
    },
    type: { 
        type: String,
        enum: ['skin', 'badge', 'advantage', 'other'],
        required: true
    },
    stock: { type: Number, default: -1 }, // -1 for unlimited stock
    available: { type: Boolean, default: true }
});

module.exports = mongoose.model('Product', ProductSchema);