const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Badge = require('../models/Badge');

// Check for new badges
router.post('/check', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.checkBadges();
        res.json({ 
            message: 'Badges checked and updated', 
            badges: user.badges 
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get all available badges
router.get('/', async (req, res) => {
    try {
        const badges = await Badge.find().select('name description icon');
        res.json(badges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;