const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Reputation = require('../models/Reputation');
const Activity = require('../models/Activity'); // Assuming you have an Activity model

// Give reputation points
router.post('/', async (req, res) => {
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

        const reputation = new Reputation({
            user: user._id,
            givenBy: giver._id,
            points,
            reason,
            relatedActivity: activityId
        });

        await reputation.save();

        await user.adjustReputation(points);

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

        res.json({ message: 'Reputation given successfully', reputation });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user reputation
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('reputations');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ reputation: user.reputation, reputations: user.reputations });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;