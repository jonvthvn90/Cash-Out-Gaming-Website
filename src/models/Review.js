// Importing the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the schema for reviews
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
}, {
    // Adds createdAt and updatedAt timestamps to documents
    timestamps: true,
    // Includes virtual attributes when converting the document to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual populate for reviewer details
ReviewSchema.virtual('reviewerDetails', {
    ref: 'User',
    localField: 'reviewer',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for reviewee details
ReviewSchema.virtual('revieweeDetails', {
    ref: 'User',
    localField: 'reviewee',
    foreignField: '_id',
    justOne: true
});

// Virtual populate for related activity details
ReviewSchema.virtual('activityDetails', {
    ref: 'Activity',
    localField: 'relatedActivity',
    foreignField: '_id',
    justOne: true
});

// Middleware to ensure that reviewer and reviewee are not the same
ReviewSchema.pre('save', function(next) {
    if (this.reviewer.equals(this.reviewee)) {
        const error = new Error("A user cannot review themselves");
        return next(error);
    }
    next();
});

// Middleware to validate rating before any update operation
ReviewSchema.pre('findOneAndUpdate', function(next) {
    const update = this.getUpdate();
    if (update.rating && (update.rating < 1 || update.rating > 5)) {
        const error = new Error("Rating must be between 1 and 5");
        return next(error);
    }
    next();
});

// Creating the model
const Review = mongoose.model('Review', ReviewSchema);

// Exporting the model for use in other parts of the application
module.exports = Review;