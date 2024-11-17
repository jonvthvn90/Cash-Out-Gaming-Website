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
        if (!title || !content) {
            return res.status(400).json({ message: 'Title and content are required' });
        }

        const thread = new Thread({
            title,
            content,
            author: req.user._id
        });
        const savedThread = await thread.save();
        res.status(201).json({ message: 'Thread created successfully', thread: savedThread });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all threads
router.get('/threads', async (req, res) => {
    try {
        const threads = await Thread.find()
            .populate('author', 'username avatar')
            .sort({ createdAt: -1 })
            .limit(20); // Fetch only the most recent 20 threads for performance
        
        res.json({ threads });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a specific thread and its posts
router.get('/threads/:threadId', async (req, res) => {
    try {
        const thread = await Thread.findById(req.params.threadId)
            .populate('author', 'username avatar');
        
        if (!thread) return res.status(404).json({ message: 'Thread not found' });

        const posts = await Post.find({ thread: req.params.threadId })
            .populate('author', 'username avatar')
            .sort({ createdAt: 1 })
            .limit(50); // Limit to the first 50 posts to prevent overwhelming data transfer
        
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

        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ message: 'Post content is required' });
        }

        const post = new Post({
            content,
            author: req.user._id,
            thread: req.params.threadId
        });

        const savedPost = await post.save();

        // Update the thread's last updated time and post count
        thread.lastPost = savedPost.createdAt;
        thread.postCount = (thread.postCount || 0) + 1;
        await thread.save();

        res.status(201).json({ message: 'Post created successfully', post: savedPost });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;