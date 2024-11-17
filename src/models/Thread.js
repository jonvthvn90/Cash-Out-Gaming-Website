// Importing the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the schema for threads
const ThreadSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 100
    },
    content: {
        type: String,
        required: true,
        trim: true,
        minlength: 10
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Using timestamps option instead of manual createdAt and updatedAt
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for thread's last update
ThreadSchema.virtual('lastUpdated').get(function() {
    return this.updatedAt;
});

// Method to update thread content
ThreadSchema.methods.updateContent = function(newContent) {
    this.content = newContent.trim();
    this.updatedAt = Date.now();  // Manually update since we're using timestamps
    return this.save();
};

// Static method to find threads by author
ThreadSchema.statics.findByAuthor = function(authorId) {
    return this.find({ author: authorId });
};

// Hook to update the updatedAt before saving
ThreadSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Middleware to update the thread's updatedAt when it's updated
ThreadSchema.pre('findOneAndUpdate', function(next) {
    this._update.updatedAt = new Date();
    next();
});

// Creating the model
const Thread = mongoose.model('Thread', ThreadSchema);

// Exporting the model for use in other parts of the application
module.exports = Thread;