const express = require('express');
const router = express.Router();
const User = require('../models/User');
const LeaderboardSchema = require('../models/Leaderboard');

// Fetch leaderboard data
router.get('/', async (req, res) => {
    try {
        const { sortBy = 'points', limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;

        let sortField = {};
        switch(sortBy) {
            case 'wins':
                sortField = { wins: -1 };
                break;
            case 'reputation':
                sortField = { reputation: -1 };
                break;
            // Add more sorting options as needed
            default: // points
                sortField = { points: -1 };
        }

        const users = await User.find()
            .sort(sortField)
            .select('_id username points wins reputation tournamentsWon')
            .skip(skip)
            .limit(parseInt(limit));

        const leaderboard = users.map(user => {
            return {
                user: user._id,
                username: user.username,
                points: user.points,
                wins: user.wins,
                reputation: user.reputation,
                tournamentsWon: user.tournamentsWon || 0 // Assuming this field exists, or default to 0
            };
        });

        res.json({ leaderboard, total: await User.countDocuments() });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;