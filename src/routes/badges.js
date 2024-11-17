const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Badge = require('../models/Badge');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have an auth middleware

// Apply authentication middleware to all routes
router.use(authMiddleware);

/**
 * POST /badges/check - Endpoint to check and potentially award new badges to the user
 */
router.post('/check', async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('badges', 'name description'); // Populate to get badge details

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming User model has a `checkBadges` method to check for new badges
        await user.checkBadges();

        // Save user document after checking for new badges
        await user.save();

        res.json({ 
            message: 'Badges checked and updated', 
            badges: user.badges.map(badge => ({
                _id: badge._id,
                name: badge.name,
                description: badge.description
            }))
        });
    } catch (error) {
        console.error('Error checking badges:', error);
        res.status(500).json({ message: 'An error occurred while checking badges' });
    }
});

/**
 * GET /badges - Endpoint to get all available badges
 */
router.get('/', async (req, res) => {
    try {
        const badges = await Badge.find()
            .select('name description icon'); // Only select necessary fields for performance

        res.json(badges);
    } catch (error) {
        console.error('Error fetching badges:', error);
        res.status(500).json({ message: 'An error occurred while fetching badges' });
    }
});

module.exports = router;