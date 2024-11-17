const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware'); // Authentication middleware

/**
 * Middleware to check if the user owns the post
 */
function ownsPost(req, res, next) {
    Post.findById(req.params.id, (err, post) => {
        if (err || !post) {
            return res.status(404).json({ message: 'Post not found or error occurred' });
        }
        if (post.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'You do not have permission to alter this post' });
        }
        req.post = post; // Attach the post to request for further processing if needed
        next();
    });
}

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username avatar') // Populate with both username and avatar
            .sort({ createdAt: -1 })
            .limit(50); // Limit to last 50 posts for performance
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'An error occurred while fetching posts' });
    }
});

// Create a new post
router.post('/', authMiddleware, async (req, res) => {
    const { content, mediaType, mediaUrl } = req.body;

    if (!content) {
        return res.status(400).json({ message: 'Content is required for a post' });
    }

    const post = new Post({
        user: req.user._id,
        content,
        mediaType,
        mediaUrl
    });

    try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error saving post:', error);
        res.status(400).json({ message: 'Failed to create post', error: error.message });
    }
});

// Update a post
router.put('/:id', [authMiddleware, ownsPost], async (req, res) => {
    const { content, mediaType, mediaUrl } = req.body;

    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, 
            { $set: { content, mediaType, mediaUrl } },
            { new: true, runValidators: true }
        );
        res.json(updatedPost);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(400).json({ message: 'Failed to update post', error: error.message });
    }
});

// Delete a post
router.delete('/:id', [authMiddleware, ownsPost], async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post successfully deleted" });
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ message: 'Failed to delete post', error: error.message });
    }
});

module.exports = router;