const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    product: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    priceAtPurchase: { type: Number, required: true },
    date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Purchase', PurchaseSchema);