const mongoose = require('mongoose');

// Define the schema for Achievements
const AchievementSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Achievement name is required'],
        trim: true,
        unique: true,
        index: true
    },
    description: {
        type: String,
        required: [true, 'Description for the achievement is required'],
        trim: true
    },
    criteria: {
        type: mongoose.Schema.Types.Mixed,
        required: [true, 'Criteria for earning the achievement must be provided'],
        validate: {
            validator: function(v) {
                return v && (typeof v === 'object') && !Array.isArray(v);
            },
            message: props => `${props.value} is not a valid criteria object!`
        }
    },
    icon: {
        type: String,
        match: [/^(http:\/\/|https:\/\/).+\.(png|jpg|jpeg|gif|svg)$/i, 'Icon must be a valid URL for an image file']
    },
    // Additional fields for better management
    isActive: {
        type: Boolean,
        default: true
    },
    difficulty: {
        type: String,
        enum: ['Easy', 'Medium', 'Hard', 'Expert'],
        default: 'Medium'
    },
    points: {
        type: Number,
        min: 0,
        default: 10
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this achievement
AchievementSchema.virtual('url').get(function() {
    return `/api/achievements/${this._id}`;
});

// Middleware to hash the name before saving
AchievementSchema.pre('save', function(next) {
    if (this.isModified('name')) {
        this.name = this.name.toLowerCase();
    }
    next();
});

// Static method to find achievements by name
AchievementSchema.statics.findByName = function(name) {
    return this.findOne({ name: name.toLowerCase() });
};

// Instance method to check if a user qualifies for the achievement
AchievementSchema.methods.checkUserEligibility = function(user) {
    // Here you would implement the logic to check the user's stats against the criteria
    // This is just a placeholder for the logic which would vary based on your criteria definition
    return Object.entries(this.criteria).every(([key, value]) => {
        return user[key] >= value;
    });
};

// Create the model for achievements
const Achievement = mongoose.model('Achievement', AchievementSchema);

module.exports = Achievement;