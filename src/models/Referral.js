const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferralSchema = new Schema({
    referrer: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    referee: { 
        type: Schema.Types.ObjectId, 
        ref: 'User',
        unique: true // Assuming a user can only be referred once
    },
    referredAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reward: {
        type: Number,
        required: true,
        default: 0
    }
});

module.exports = mongoose.model('Referral', ReferralSchema);