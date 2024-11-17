const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reputation = require('../models/Reputation');
const Activity = require('../models/Activity');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Give reputation points
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { userId, points, reason, activityId } = req.body;
        const user = await User.findById(userId);
        const giver = await User.findById(req.user._id);

        if (!user || !giver) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user._id.toString() === giver._id.toString()) {
            return res.status(400).json({ message: 'You cannot give reputation to yourself' });
        }

        // Ensure points are positive
        if (points <= 0) {
            return res.status(400).json({ message: 'Points must be positive' });
        }

        const reputation = new Reputation({
            user: user._id,
            givenBy: giver._id,
            points,
            reason,
            relatedActivity: activityId
        });

        await reputation.save();

        // Adjust user's reputation
        user.reputation += points;
        await user.save();

        // If the reputation is related to an activity, create an activity entry
        if (activityId) {
            const activity = new Activity({
                user: user._id,
                type: 'reputation',
                content: `${points} reputation points received from ${giver.username} for ${reason}`,
                relatedObject: reputation._id
            });
            await activity.save();
        }

        res.status(201).json({ message: 'Reputation given successfully', reputation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user reputation
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'reputations',
                populate: {
                    path: 'givenBy',
                    select: 'username' // Only select the username to keep the response lean
                }
            });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ 
            reputation: user.reputation, 
            reputations: user.reputations.map(reputation => ({
                _id: reputation._id,
                points: reputation.points,
                reason: reputation.reason,
                givenBy: reputation.givenBy.username,
                createdAt: reputation.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;