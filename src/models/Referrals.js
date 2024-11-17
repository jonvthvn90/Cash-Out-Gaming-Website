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
        ref: 'User'
    },
    referralCode: {
        type: String,
        required: [true, 'Referral code is required'],
        unique: true,
        index: true
    },
    used: {
        type: Boolean,
        default: false,
        index: true // Index for faster querying of unused referrals
    },
    // Additional fields for more comprehensive referral tracking
    source: {
        type: String,
        enum: ['email', 'social', 'direct', 'other'],
        default: 'other'
    },
    reward: {
        type: Number,
        default: 0,
        min: [0, 'Reward amount must be non-negative']
    },
    rewardType: {
        type: String,
        enum: ['points', 'credit', 'discount', 'item'],
        default: 'points'
    },
    expiresAt: {
        type: Date
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this referral
ReferralSchema.virtual('url').get(function() {
    return `/api/referrals/${this.referralCode}`;
});

// Virtual to check if the referral is expired
ReferralSchema.virtual('isExpired').get(function() {
    return this.expiresAt && this.expiresAt < new Date();
});

// Pre 'save' middleware to manage expiration
ReferralSchema.pre('save', function(next) {
    if (this.isNew && !this.expiresAt) {
        // Set an expiration date, e.g., 30 days from now
        this.expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    }
    next();
});

// Post 'save' middleware for logging
ReferralSchema.post('save', function(doc, next) {
    console.log(`Referral saved with code: ${doc.referralCode}`);
    next();
});

// Static method to generate a referral code
ReferralSchema.statics.generateCode = async function() {
    let code;
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    do {
        code = Array(8).fill().map(() => characters[Math.floor(Math.random() * characters.length)]).join('');
    } while (await this.findOne({ referralCode: code }));
    return code;
};

// Static method to use a referral
ReferralSchema.statics.useReferral = async function(referralCode, refereeId) {
    const referral = await this.findOne({ referralCode, used: false, expiresAt: { $gt: new Date() } });
    if (!referral) {
        throw new Error('Referral code not found or already used/expired');
    }
    referral.referee = refereeId;
    referral.used = true;
    await referral.save();
    return referral;
};

// Static method to get active referrals for a user (referrer)
ReferralSchema.statics.getActiveReferrals = function(referrerId) {
    return this.find({ referrer: referrerId, used: false, expiresAt: { $gt: new Date() } });
};

// Instance method to extend referral expiration
ReferralSchema.methods.extendExpiration = function(days) {
    if (this.used) {
        throw new Error('Cannot extend expiration for a used referral');
    }
    this.expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
    return this.save();
};

// Index to ensure uniqueness of referrer and referee combination
ReferralSchema.index({ referrer: 1, referee: 1 }, { unique: true, sparse: true });

const Referral = mongoose.model('Referral', ReferralSchema);

module.exports = Referral;