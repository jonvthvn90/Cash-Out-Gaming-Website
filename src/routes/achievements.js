const express = require('express');
const router = express.Router();
const User = require('../models/User');

router.post('/check', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        await user.checkAchievements();
        res.json({ message: 'Achievements checked and updated', achievements: user.achievements });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;