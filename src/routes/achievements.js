const express = require('express');
const router = express.Router();
const User = require('../models/User');

/**
 * Middleware to check if the user is authenticated
 * This assumes that you have authentication middleware set up somewhere in your application
 */
function authenticate(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.status(401).json({ message: 'You need to be authenticated to access this route.' });
    }
}

/**
 * POST /check - Endpoint to check and update user achievements
 * @param {Object} req.body - Should not contain any data, just the route to trigger the check
 * @returns {Object} JSON response with updated achievements or error message
 */
router.post('/check', authenticate, async (req, res) => {
    try {
        // Find the user by their ID from the authenticated session
        const user = await User.findById(req.user._id).populate('achievements');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Assuming User model has a method to check and update achievements
        await user.checkAchievements();

        // Save the user document to reflect any changes from checkAchievements method
        await user.save();

        // Send back the list of achievements with detailed information
        res.json({
            message: 'Achievements checked and updated',
            achievements: user.achievements.map(achievement => ({
                id: achievement.id,
                name: achievement.name,
                description: achievement.description,
                dateEarned: achievement.dateEarned
            }))
        });
    } catch (error) {
        console.error('Error checking achievements:', error);
        res.status(500).json({ message: 'An error occurred while checking achievements.' });
    }
});

module.exports = router;