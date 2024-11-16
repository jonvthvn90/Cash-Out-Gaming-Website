const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReputationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    givenBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    points: {
        type: Number,
        default: 1,
        min: 1
    },
    reason: {
        type: String,
        required: true,
        maxlength: 255
    },
    relatedActivity: {
        type: Schema.Types.ObjectId,
        ref: 'Activity'
    }
}, { timestamps: true });

module.exports = mongoose.model('Reputation', ReputationSchema);