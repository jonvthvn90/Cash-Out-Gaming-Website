const express = require('express');
const router = express.Router();
const Activity = require('../models/Activity');
const User = require('../models/User');

/**
 * Middleware to check if the user is authenticated
 */
function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ message: 'You need to be authenticated to access this route.' });
    }
}

// Create an activity
router.post('/', authenticate, async (req, res) => {
    try {
        const { type, content, relatedObject } = req.body;

        // Validate required fields
        if (!type || !content) {
            return res.status(400).json({ message: 'Type and content are required fields' });
        }

        const activity = new Activity({
            user: req.user._id,
            type,
            content,
            relatedObject
        });

        await activity.save();
        res.status(201).json({ message: 'Activity created', activity });
    } catch (error) {
        console.error('Error creating activity:', error);
        res.status(500).json({ message: 'An error occurred while creating the activity' });
    }
});

// Get activities for a user and their friends/followers
router.get('/feed', authenticate, async (req, res) => {
    try {
        // Fetch the current user and populate their friends and followers
        const user = await User.findById(req.user._id)
            .populate('friends', '_id')
            .populate('following', '_id');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Create an array of user IDs to check for activities
        const usersToCheck = [user._id, ...user.friends.map(f => f._id), ...user.following.map(f => f._id)];

        // Query for activities, populate user info, and limit results
        const activities = await Activity.find({ user: { $in: usersToCheck } })
            .sort({ createdAt: -1 }) // Sort by most recent first
            .populate('user', 'username avatar') // Populate with only username and avatar
            .limit(20); // Limit to the last 20 activities

        res.json(activities);
    } catch (error) {
        console.error('Error fetching activities:', error);
        res.status(500).json({ message: 'An error occurred while fetching the feed' });
    }
});

module.exports = router;