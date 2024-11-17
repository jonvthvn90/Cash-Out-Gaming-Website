const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BlogPostSchema = new Schema({
    title: {
        type: String,
        required: [true, 'A title is required for the blog post'],
        minlength: [5, 'Title must be at least 5 characters long'],
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    content: {
        type: String,
        required: [true, 'Content is required for the blog post'],
        minlength: [10, 'Content must be at least 10 characters long']
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Author ID is required for the blog post']
    },
    published: {
        type: Boolean,
        default: false, // Changed from true to false as it's usually better to draft posts before publishing
        index: true // Index for faster querying of published posts
    },
    tags: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length <= 10;
            },
            message: props => `Number of tags cannot exceed 10`
        }
    },
    comments: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    likes: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }], // Users who liked the post
    slug: {
        type: String,
        required: true,
        unique: true,
        index: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Middleware to generate a slug from the title before saving
BlogPostSchema.pre('save', async function(next) {
    if (this.isModified('title')) {
        // Generate a slug from the title
        let slug = this.title
            .toLowerCase()
            .replace(/[^\w ]+/g,'')
            .replace(/ +/g,'-');
        // Ensure slug is unique
        let counter = 0;
        while (await BlogPost.findOne({ slug: slug })) {
            counter++;
            slug = `${this.title.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-')}-${counter}`;
        }
        this.slug = slug;
    }
    next();
});

// Post save middleware for logging
BlogPostSchema.post('save', function(doc, next) {
    console.log('Blog post saved:', doc._id);
    next();
});

// Virtual for URL to this blog post
BlogPostSchema.virtual('url').get(function() {
    return `/blog/${this.slug}`;
});

// Instance method to add a comment to the blog post
BlogPostSchema.methods.addComment = async function(commentId) {
    this.comments.push(commentId);
    await this.save();
    return this;
};

// Instance method to like a blog post
BlogPostSchema.methods.like = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
    }
    return this;
};

// Instance method to unlike a blog post
BlogPostSchema.methods.unlike = async function(userId) {
    const index = this.likes.indexOf(userId);
    if (index !== -1) {
        this.likes.splice(index, 1);
        await this.save();
    }
    return this;
};

// Static method to find blog posts by tag
BlogPostSchema.statics.findByTag = function(tag) {
    return this.find({ tags: tag, published: true });
};

// Static method to find blog posts by author
BlogPostSchema.statics.findByAuthor = function(authorId) {
    return this.find({ author: authorId, published: true })
        .populate('author', 'username email'); // Populate with author's username and email
};

const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = BlogPost;