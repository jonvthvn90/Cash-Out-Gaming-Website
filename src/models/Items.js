const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ItemSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Item name is required'],
        unique: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Item description is required']
    },
    price: {
        points: {
            type: Number,
            default: 0,
            min: [0, 'Points price cannot be negative'],
            validate: {
                validator: Number.isInteger,
                message: '{VALUE} is not an integer value for points'
            }
        },
        balance: {
            type: Number,
            default: 0,
            min: [0, 'Balance price cannot be negative'],
            validate: {
                validator: function(value) {
                    return value === 0 || (value > 0 && Number.isInteger(value));
                },
                message: 'Balance price must be an integer greater than zero or zero'
            }
        }
    },
    stock: {
        type: Number,
        default: -1, // -1 for unlimited
        min: [-1, 'Stock cannot be less than -1'],
        validate: {
            validator: function(value) {
                return value === -1 || (value >= 0 && Number.isInteger(value));
            },
            message: 'Stock must be -1 for unlimited or a non-negative integer'
        }
    },
    image: {
        type: String,
        match: [/^(http:\/\/|https:\/\/).+\.(png|jpg|jpeg|gif|svg)$/i, 'Image URL must be a valid URL for an image file']
    },
    type: {
        type: String,
        enum: ['cosmetic', 'privilege', 'other'],
        required: [true, 'Item type is required']
    },
    // Additional fields for more detailed item description
    rarity: {
        type: String,
        enum: ['common', 'uncommon', 'rare', 'epic', 'legendary'],
        default: 'common'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this item
ItemSchema.virtual('url').get(function() {
    return `/api/items/${this._id}`;
});

// Pre 'save' middleware to check if stock is unlimited, then set to -1
ItemSchema.pre('save', function(next) {
    if (this.isModified('stock') && this.stock === 0) {
        this.stock = -1; // Treat 0 stock as unlimited
    }
    next();
});

// Post 'save' middleware for logging or other side effects
ItemSchema.post('save', function(doc, next) {
    console.log('Item saved:', doc.name);
    next();
});

// Static method to find items by type
ItemSchema.statics.findByType = function(type) {
    return this.find({ type: type, isActive: true });
};

// Static method to find limited stock items
ItemSchema.statics.findLimitedStock = function() {
    return this.find({ stock: { $ne: -1 } });
};

// Instance method to check if the item is available in stock
ItemSchema.methods.isAvailable = function() {
    if (this.stock === -1) {
        return true; // unlimited stock
    }
    return this.stock > 0;
};

// Instance method to decrement stock
ItemSchema.methods.decrementStock = async function(amount = 1) {
    if (this.stock === -1) {
        return this; // unlimited stock, no need to decrement
    }
    if (this.stock - amount >= 0) {
        this.stock -= amount;
        await this.save();
        return this;
    }
    throw new Error('Not enough stock');
};

const Item = mongoose.model('Item', ItemSchema);

module.exports = Item;