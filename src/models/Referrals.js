const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReferralSchema = new Schema({
    referrer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    referee: { type: Schema.Types.ObjectId, ref: 'User' },
    referralCode: { type: String, required: true, unique: true },
    used: { type: Boolean, default: false }
}, { timestamps: true });

ReferralSchema.index({ referrer: 1, referee: 1 }, { unique: true });

module.exports = mongoose.model('Referral', ReferralSchema);