const express = require('express');
const router = express.Router();
const Thread = require('../models/Thread');
const Post = require('../models/Post');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// Create a new thread
router.post('/threads', async (req, res) => {
    try {
        const { title, content } = req.body;
        const thread = new Thread({ title, content, author: req.user._id });
        await thread.save();
        res.status(201).json({ message: 'Thread created successfully', thread });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all threads
router.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find().populate('author', 'username').sort({ createdAt: -1 });
        res.json({ threads });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific thread and its posts
router.get('/threads/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId).populate('author', 'username');
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        const posts = await Post.find({ thread: req.params.threadId }).populate('author', 'username').sort({ createdAt: 1 });
        res.json({ thread, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post in a thread
router.post('/threads/:threadId/posts', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId);
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        const post = new Post({
            content: req.body.content,
            author: req.user._id,
            thread: req.params.threadId
        });
        await post.save();
        res.status(201).json({ message: 'Post created successfully', post });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;