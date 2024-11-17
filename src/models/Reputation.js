const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReputationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for reputation entry']
    },
    givenBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID of the person giving reputation is required']
    },
    points: {
        type: Number,
        default: 1,
        min: [1, 'Points must be at least 1'],
        max: [100, 'Points cannot exceed 100']
    },
    reason: {
        type: String,
        required: [true, 'A reason for the reputation change must be provided'],
        maxlength: [255, 'Reason cannot exceed 255 characters'],
        trim: true
    },
    relatedActivity: {
        type: Schema.Types.ObjectId,
        ref: 'Activity'
    },
    // Additional fields for more detailed reputation tracking
    isPositive: {
        type: Boolean,
        default: true
    },
    category: {
        type: String,
        enum: ['helpfulness', 'fairness', 'friendliness', 'skill', 'other'],
        default: 'other'
    },
    visibility: {
        type: String,
        enum: ['public', 'private'],
        default: 'public'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this reputation entry
ReputationSchema.virtual('url').get(function() {
    return `/api/reputations/${this._id}`;
});

// Pre 'save' middleware to validate points and set isPositive
ReputationSchema.pre('save', function(next) {
    if (this.isModified('points')) {
        this.isPositive = this.points > 0;
    }
    next();
});

// Post 'save' middleware for logging or other side effects
ReputationSchema.post('save', function(doc, next) {
    console.log(`Reputation saved for user ${doc.user} by ${doc.givenBy}`);
    // Here you might want to update the User's total reputation score
    next();
});

// Static method to get user's reputation summary
ReputationSchema.statics.getUserReputationSummary = function(userId) {
    return this.aggregate([
        { $match: { user: mongoose.Types.ObjectId(userId) } },
        {
            $group: {
                _id: '$user',
                totalPoints: { $sum: '$points' },
                positiveCount: { 
                    $sum: { 
                        $cond: [{ $eq: ['$isPositive', true] }, 1, 0] 
                    }
                },
                negativeCount: {
                    $sum: {
                        $cond: [{ $eq: ['$isPositive', false] }, 1, 0]
                    }
                },
                totalEntries: { $sum: 1 }
            }
        },
        {
            $project: {
                _id: 0,
                userId: '$_id',
                totalPoints: 1,
                positiveCount: 1,
                negativeCount: 1,
                totalEntries: 1
            }
        }
    ]);
};

// Static method to find reputations given by a user
ReputationSchema.statics.reputationsGiven = function(userId) {
    return this.find({ givenBy: userId })
        .populate('user', 'username') // Populate the user who received the reputation
        .sort({ createdAt: -1 });
};

// Instance method to toggle visibility
ReputationSchema.methods.toggleVisibility = async function() {
    this.visibility = this.visibility === 'public' ? 'private' : 'public';
    return await this.save();
};

const Reputation = mongoose.model('Reputation', ReputationSchema);

module.exports = Reputation;