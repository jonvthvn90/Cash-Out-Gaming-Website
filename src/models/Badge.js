const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BadgeSchema = new Schema({
    name: {
        type: String,
        required: [true, 'Badge name is required'],
        unique: true,
        trim: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description for the badge is required'],
        trim: true
    },
    conditions: {
        type: Schema.Types.Mixed,
        required: [true, 'Conditions for earning the badge must be provided'],
        validate: {
            validator: function(v) {
                return v && (typeof v === 'object') && !Array.isArray(v);
            },
            message: props => `${props.value} is not a valid condition object!`
        }
    },
    icon: {
        type: String,
        required: [true, 'Icon URL is required for the badge'],
        match: [/^(http:\/\/|https:\/\/).+\.(png|jpg|jpeg|gif|svg)$/i, 'Icon must be a valid URL for an image file']
    },
    // Additional fields to enrich the badge model
    rarity: {
        type: String,
        enum: ['Common', 'Uncommon', 'Rare', 'Epic', 'Legendary'],
        default: 'Common'
    },
    category: {
        type: String,
        enum: ['Achievement', 'Participation', 'Milestone', 'Event'],
        default: 'Achievement'
    },
    points: {
        type: Number,
        min: 0,
        default: 5
    },
    // If this badge is part of a special series or set
    series: {
        type: String,
        trim: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this badge
BadgeSchema.virtual('url').get(function() {
    return `/api/badges/${this._id}`;
});

// Pre 'save' middleware to normalize name
BadgeSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.name = this.name.toLowerCase();
    }
    next();
});

// Post 'save' middleware for logging or other side effects
BadgeSchema.post('save', function(doc, next) {
    console.log('Badge saved', doc);
    next();
});

// Index for faster querying by name and category
BadgeSchema.index({ name: 1, category: 1 });

// Static method to find badges by name
BadgeSchema.statics.findByName = function(name) {
    return this.findOne({ name: name.toLowerCase() });
};

// Static method to find badges by category
BadgeSchema.statics.findByCategory = function(category) {
    return this.find({ category: category });
};

// Instance method to check if a user qualifies for the badge
BadgeSchema.methods.checkUserEligibility = function(user) {
    // Placeholder logic for checking badge conditions against user data
    // This should be implemented based on your specific badge conditions
    return Object.entries(this.conditions).every(([key, value]) => {
        return user[key] >= value;
    });
};

module.exports = mongoose.model('Badge', BadgeSchema);