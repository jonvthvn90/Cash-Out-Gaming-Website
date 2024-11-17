const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PurchaseSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for the purchase']
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: [true, 'Product ID is required for the purchase']
    },
    priceAtPurchase: {
        type: Number,
        required: [true, 'Purchase price is required'],
        min: [0, 'Price must be a positive number']
    },
    quantity: {
        type: Number,
        default: 1,
        min: [1, 'Quantity must be at least 1']
    },
    totalPrice: {
        type: Number,
        required: true,
        min: [0, 'Total price must be a positive number']
    },
    date: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting purchases by date
    },
    // Additional fields for more detailed purchase tracking
    paymentMethod: {
        type: String,
        enum: ['credit_card', 'paypal', 'points', 'gift_card', 'crypto']
    },
    transactionId: {
        type: String,
        unique: true // Assuming transaction IDs are unique
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'cancelled', 'refunded'],
        default: 'completed'
    },
    // Details about the product at the time of purchase (for historical tracking)
    productDetails: {
        name: String,
        description: String,
        type: String,
        imageUrl: String
    }
}, {
    timestamps: true, // Automatically adds updatedAt field
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this purchase
PurchaseSchema.virtual('url').get(function() {
    return `/api/purchases/${this._id}`;
});

// Pre 'save' middleware to set the total price if not set
PurchaseSchema.pre('save', function(next) {
    if (this.isNew) {
        if (!this.totalPrice) {
            this.totalPrice = this.priceAtPurchase * this.quantity;
        }
        // Set product details at purchase time
        if (this.productDetails.name === undefined) {
            const Product = mongoose.model('Product');
            Product.findById(this.product).then(product => {
                if (product) {
                    this.productDetails = {
                        name: product.name,
                        description: product.description,
                        type: product.type,
                        imageUrl: product.imageUrl
                    };
                }
                next();
            }).catch(error => next(error));
            return; // Wait for the async operation to finish before next()
        }
    }
    next();
});

// Post 'save' middleware for logging or other side effects
PurchaseSchema.post('save', function(doc, next) {
    console.log('Purchase saved with ID:', doc._id);
    // Here you might update the user's purchase history or decrement stock in the product
    next();
});

// Static method to find purchases by user with pagination
PurchaseSchema.statics.findByUser = function(userId, limit = 10, skip = 0) {
    return this.find({ user: userId })
        .sort({ date: -1 })
        .skip(skip)
        .limit(limit)
        .populate('product', 'name description price type');
};

// Static method to find recent purchases
PurchaseSchema.statics.recentPurchases = function(limit = 10) {
    return this.find({ status: 'completed' })
        .sort({ date: -1 })
        .limit(limit)
        .populate('user', 'username')
        .populate('product', 'name price');
};

// Instance method to cancel a purchase
PurchaseSchema.methods.cancel = async function() {
    if (this.status !== 'completed' && this.status !== 'pending') {
        throw new Error('Purchase cannot be cancelled');
    }
    this.status = 'cancelled';
    return await this.save();
};

const Purchase = mongoose.model('Purchase', PurchaseSchema);

module.exports = Purchase;