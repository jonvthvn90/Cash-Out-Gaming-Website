const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have authentication middleware

// Get all posts
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('user', 'username') // Assuming you want to populate with the username from the User model
            .sort({ createdAt: -1 })
            .exec();
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
router.post('/', authMiddleware, async (req, res) => {
    const post = new Post({
        user: req.user._id, // Assuming the authenticated user's ID is attached to the request by authMiddleware
        content: req.body.content,
        mediaType: req.body.mediaType,
        mediaUrl: req.body.mediaUrl
    });

    try {
        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update a post
router.put('/:id', authMiddleware, async (req, res) => {
    if (req.body.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Unauthorized to update this post" });
    }

    try {
        const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete a post
router.delete('/:id', authMiddleware, async (req, res) => {
    if (req.body.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: "Unauthorized to delete this post" });
    }

    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;