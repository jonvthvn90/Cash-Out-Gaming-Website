const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'video', 'gif', 'audio'],
        default: 'text'
    },
    mediaUrl: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }]
});

// Adding an index for better query performance
postSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Post', postSchema);