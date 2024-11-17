const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Fetch leaderboard data
router.get('/', async (req, res) => {
    try {
        const { sortBy = 'points', limit = 10, page = 1 } = req.query;
        const skip = (page - 1) * limit;
        const validSortFields = ['points', 'wins', 'reputation', 'tournamentsWon'];
        const sortField = validSortFields.includes(sortBy) ? sortBy : 'points';

        // Sorting in descending order
        const sortQuery = { [sortField]: -1 };

        // Querying for leaderboard data with pagination
        const users = await User.find()
            .sort(sortQuery)
            .select('_id username points wins reputation tournamentsWon')
            .skip(skip)
            .limit(parseInt(limit));

        // Transform data for response
        const leaderboard = users.map(user => ({
            user: user._id,
            username: user.username,
            points: user.points || 0,
            wins: user.wins || 0,
            reputation: user.reputation || 0,
            tournamentsWon: user.tournamentsWon || 0
        }));

        // Count total documents for pagination
        const totalCount = await User.countDocuments();

        res.json({
            leaderboard,
            total: totalCount,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalCount / parseInt(limit))
        });
    } catch (error) {
        console.error("Leaderboard fetch error:", error);
        res.status(500).json({ message: "An error occurred while fetching the leaderboard" });
    }
});

module.exports = router;