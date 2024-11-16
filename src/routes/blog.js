const express = require('express');
const router = express.Router();
const BlogPost = require('../models/BlogPost');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Create a new blog post (admin only)
router.post('/', async (req, res) => {
    try {
        const { title, content, tags } = req.body;
        const blogPost = new BlogPost({
            title,
            content,
            author: req.user._id,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : []
        });
        await blogPost.save();
        res.status(201).json({ message: 'Blog post created successfully', blogPost });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all blog posts (public)
router.get('/', async (req, res) => {
    try {
        let query = { published: true };
        if (req.query.tag) {
            query.tags = { $in: [req.query.tag] };
        }

        const blogPosts = await BlogPost.find(query).populate('author', 'username').sort({ createdAt: -1 });
        res.json({ blogPosts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific blog post by ID (public)
router.get('/:postId', async (req, res) => {
    try {
        const blogPost = await BlogPost.findById(req.params.postId).populate('author', 'username');
        if (!blogPost || !blogPost.published) return res.status(404).json({ message: 'Blog post not found' });
        res.json({ blogPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update a blog post (admin only)
router.put('/:postId', async (req, res) => {
    try {
        const { title, content, tags, published } = req.body;
        const updatedBlogPost = await BlogPost.findByIdAndUpdate(req.params.postId, {
            title,
            content,
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            published,
            updatedAt: Date.now()
        }, { new: true, runValidators: true });
        if (!updatedBlogPost) return res.status(404).json({ message: 'Blog post not found' });
        res.json({ message: 'Blog post updated successfully', blogPost: updatedBlogPost });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a blog post (admin only)
router.delete('/:postId', async (req, res) => {
    try {
        const blogPost = await BlogPost.findByIdAndDelete(req.params.postId);
        if (!blogPost) return res.status(404).json({ message: 'Blog post not found' });
        res.json({ message: 'Blog post deleted successfully', blogPost });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;