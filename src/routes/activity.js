const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');

// Create an activity
router.post('/', async (req, res) => {
    try {
        const { type, content, relatedObject } = req.body;
        const activity = new Activity({
            user: req.user._id,
            type,
            content,
            relatedObject
        });
        await activity.save();
        res.status(201).json({ message: 'Activity created', activity });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get activities for a user and their friends/followers
router.get('/feed', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends following');
        const usersToCheck = [user._id, ...user.friends.map(f => f._id), ...user.following.map(f => f._id)];
        const activities = await Activity.find({ user: { $in: usersToCheck } })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .populate('user', 'username avatar')
            .limit(20); // Limit to the last 20 activities

        res.json(activities);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;