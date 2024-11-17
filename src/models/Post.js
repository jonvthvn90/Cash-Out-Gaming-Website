const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for the post']
    },
    content: {
        type: String,
        required: [true, 'Post content is required'],
        trim: true,
        maxlength: [1000, 'Post content must not exceed 1000 characters']
    },
    mediaType: {
        type: String,
        enum: ['text', 'image', 'video', 'gif', 'audio'],
        default: 'text'
    },
    mediaUrl: {
        type: String,
        validate: {
            validator: function(v) {
                return this.mediaType !== 'text' ? (v && v.length > 0) : true;
            },
            message: props => 'Media URL is required for non-text posts!'
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting posts by creation time
    },
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    // Additional fields for more detailed post information
    tags: [{
        type: String,
        trim: true
    }],
    shares: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPublic: {
        type: Boolean,
        default: true
    },
    // For tracking post visibility
    views: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true, // Automatically adds updatedAt field
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this post
postSchema.virtual('url').get(function() {
    return `/api/posts/${this._id}`;
});

// Virtual for the total number of interactions (likes, comments, shares)
postSchema.virtual('totalInteractions').get(function() {
    return this.likes.length + this.comments.length + this.shares.length;
});

// Pre 'save' middleware to manage media URL validation
postSchema.pre('save', function(next) {
    if (this.isModified('mediaType') && this.mediaType !== 'text' && !this.mediaUrl) {
        throw new Error('Media URL is required for non-text posts');
    }
    next();
});

// Post 'save' middleware for logging
postSchema.post('save', function(doc, next) {
    console.log('Post saved:', doc._id);
    next();
});

// Static method to find posts by user with pagination
postSchema.statics.findByUser = function(userId, limit = 10, skip = 0) {
    return this.find({ user: userId, isPublic: true })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('user', 'username avatar')
        .populate('likes', 'username')
        .populate('comments', 'content');
};

// Static method to find recent public posts
postSchema.statics.findRecentPublic = function(limit = 10) {
    return this.find({ isPublic: true })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'username avatar');
};

// Instance method to like a post
postSchema.methods.like = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
    }
};

// Instance method to unlike a post
postSchema.methods.unlike = async function(userId) {
    const index = this.likes.indexOf(userId);
    if (index !== -1) {
        this.likes.splice(index, 1);
        await this.save();
    }
};

// Instance method to add a comment to the post
postSchema.methods.addComment = async function(commentId) {
    this.comments.push(commentId);
    this.updatedAt = new Date();
    await this.save();
    return this;
};

const Post = mongoose.model('Post', postSchema);

module.exports = Post;