const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferralSchema = new Schema({
    referrer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referrer ID is required']
    },
    referee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Referee ID is required'],
        unique: true // Assuming a user can only be referred once
    },
    referredAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting referrals by date
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
        index: true // Index for status-based queries
    },
    reward: {
        type: Number,
        required: [true, 'Reward amount is required'],
        min: [0, 'Reward must be a positive number'],
        default: 0
    },
    // Additional fields for more detailed referral tracking
    rewardType: {
        type: String,
        enum: ['points', 'credit', 'discount', 'item'],
        default: 'points'
    },
    rewardDetails: {
        type: Schema.Types.Mixed
    },
    referralCode: {
        type: String,
        unique: true
    },
    // For tracking if the referee has completed a required action
    completedAction: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this referral
ReferralSchema.virtual('url').get(function() {
    return `/api/referrals/${this._id}`;
});

// Pre 'save' middleware to generate a referral code
ReferralSchema.pre('save', async function(next) {
    if (this.isNew) {
        // If no referral code exists, generate one
        if (!this.referralCode) {
            let code;
            do {
                // Generate a 6-character alphanumeric code
                code = Math.random().toString(36).substring(2, 8).toUpperCase();
                // Check for uniqueness
            } while (await this.constructor.findOne({ referralCode: code }));
            this.referralCode = code;
        }
    }
    next();
});

// Post 'save' middleware for logging
ReferralSchema.post('save', function(doc, next) {
    console.log(`Referral saved with code: ${doc.referralCode}`);
    next();
});

// Static method to find referrals by status
ReferralSchema.statics.findByStatus = function(status) {
    return this.find({ status })
        .populate('referrer', 'username email')
        .populate('referee', 'username email');
};

// Static method to find referrals made by a specific user
ReferralSchema.statics.findByReferrer = function(referrerId) {
    return this.find({ referrer: referrerId })
        .populate('referee', 'username');
};

// Instance method to approve a referral
ReferralSchema.methods.approve = async function() {
    if (this.status !== 'pending') {
        throw new Error('Referral can only be approved if it is pending');
    }
    this.status = 'approved';
    this.completedAction = true; // Assuming action is completed upon approval
    return await this.save();
};

// Instance method to reject a referral
ReferralSchema.methods.reject = async function() {
    if (this.status !== 'pending') {
        throw new Error('Referral can only be rejected if it is pending');
    }
    this.status = 'rejected';
    return await this.save();
};

// Static method to get statistics for referrals
ReferralSchema.statics.getReferralStats = async function(userId, type) {
    const query = type === 'referrer' ? { referrer: userId } : { referee: userId };
    const stats = await this.aggregate([
        { $match: query },
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 },
                totalReward: { $sum: "$reward" }
            }
        }
    ]);
    
    // Convert to an object with status as keys
    return stats.reduce((acc, curr) => {
        acc[curr._id] = { count: curr.count, totalReward: curr.totalReward };
        return acc;
    }, {});
};

const Referral = mongoose.model('Referral', ReferralSchema);

module.exports = Referral;