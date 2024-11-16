const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ReviewSchema = new Schema({
    reviewer: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    reviewee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        maxlength: 500
    },
    relatedActivity: {
        type: Schema.Types.ObjectId,
        ref: 'Activity'
    }
}, { timestamps: true });

module.exports = mongoose.model('Review', ReviewSchema);