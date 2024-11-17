const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProductSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Product name is required'],
        unique: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price must be a positive number'],
        set: v => parseFloat(v.toFixed(2)) // Ensure price is always stored in cents
    },
    type: {
        type: String,
        enum: ['skin', 'badge', 'advantage', 'other'],
        required: [true, 'Product type must be specified']
    },
    stock: {
        type: Number,
        default: -1, // -1 for unlimited stock
        validate: {
            validator: function(v) {
                return v === -1 || v >= 0; // Validate that stock is either unlimited or non-negative
            },
            message: 'Stock must be a non-negative integer or -1 for unlimited'
        }
    },
    available: {
        type: Boolean,
        default: true,
        index: true // Index for faster querying of available products
    },
    // Additional fields for more detailed product information
    imageUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return v === undefined || v === '' || /^http(s)?:\/\//.test(v);
            },
            message: 'Image URL must be a valid HTTP(S) URL or empty'
        }
    },
    onSale: {
        type: Boolean,
        default: false
    },
    salePrice: {
        type: Number,
        min: 0,
        validate: {
            validator: function(v) {
                return !this.onSale || (v < this.price);
            },
            message: 'Sale price must be less than the original price when on sale'
        }
    },
    category: {
        type: String,
        enum: ['cosmetics', 'boosters', 'tools', 'miscellaneous'],
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this product
ProductSchema.virtual('url').get(function() {
    return `/api/products/${this._id}`;
});

// Virtual for the display price, considering sale
ProductSchema.virtual('displayPrice').get(function() {
    return this.onSale ? this.salePrice : this.price;
});

// Pre 'save' middleware to check stock and availability
ProductSchema.pre('save', function(next) {
    if (this.isModified('stock') && this.stock === 0) {
        this.available = false; // If stock is 0, mark as unavailable
    }
    next();
});

// Post 'save' middleware for logging
ProductSchema.post('save', function(doc, next) {
    console.log('Product saved:', doc.name);
    next();
});

// Static method to find available products by type
ProductSchema.statics.findByType = function(type, options = {}) {
    const { limit = 10, skip = 0 } = options;
    return this.find({ type, available: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);
};

// Static method to find products on sale
ProductSchema.statics.findOnSale = function(options = {}) {
    const { limit = 10, skip = 0 } = options;
    return this.find({ onSale: true, available: true })
        .sort({ salePrice: 1 }) // Sort by sale price, lowest first
        .skip(skip)
        .limit(limit);
};

// Instance method to purchase a product
ProductSchema.methods.purchase = async function(quantity = 1) {
    if (!this.available) {
        throw new Error('Product is not available for purchase');
    }
    
    if (this.stock !== -1) {
        if (this.stock < quantity) {
            throw new Error('Not enough stock');
        }
        this.stock -= quantity;
        if (this.stock === 0) {
            this.available = false;
        }
    }

    await this.save();
    return this;
};

const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;