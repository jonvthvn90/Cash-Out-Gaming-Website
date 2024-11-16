const express = require('express');
const router = express.Router();
const Statistic = require('../models/Statistic');
const User = require('../models/User');
const Match = require('../models/Match');
const Bet = require('../models/Bet');

/**
 * Endpoint to fetch and update user statistics
 * @param {string} userId - The ID of the user whose statistics are being requested
 * @returns {object} - The statistics of the user
 */
router.get('/:userId', async (req, res) => {
    try {
        // Try to find existing statistics for the user
        let stats = await Statistic.findOne({ user: req.params.userId });

        // If no statistics found, create a new Statistic document
        if (!stats) {
            stats = new Statistic({ user: req.params.userId });
        }

        // Fetch user's matches and bets
        const user = await User.findById(req.params.userId).select('wins');
        const matches = await Match.find({ 'players.user': req.params.userId });
        const bets = await Bet.find({ user: req.params.userId });

        // Update statistics based on the fetched data
        stats.totalGames = matches.length;
        
        // Calculate win rate
        const wins = matches.reduce((acc, match) => {
            // Assuming winner is stored as an ObjectId
            return match.winner.toString() === req.params.userId ? acc + 1 : acc;
        }, 0);
        stats.winRate = matches.length > 0 ? wins / matches.length : 0;

        // Calculate average bet amount
        if (bets.length > 0) {
            const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
            stats.averageBetAmount = totalBetAmount / bets.length;
        } else {
            stats.averageBetAmount = 0;
        }

        // Calculate total earnings from bets
        stats.totalEarnings = bets.reduce((total, bet) => {
            if (bet.status === 'won') return total + (bet.amount * bet.odds - bet.amount);
            return total;
        }, 0);

        // Most frequent game - This would require additional logic to track over time
        // For simplicity, we'll assume we can derive this from the matches:
        const gameFrequency = {};
        matches.forEach(match => {
            gameFrequency[match.game] = (gameFrequency[match.game] || 0) + 1;
        });
        stats.mostFrequentGame = Object.keys(gameFrequency).reduce((a, b) => gameFrequency[a] > gameFrequency[b] ? a : b, '');

        // Total hours played - this would require tracking play time in matches
        stats.totalHoursPlayed = 0; // Placeholder, needs real time tracking

        // Longest win streak - this would require tracking win/loss history over time
        stats.longestStreak = user.wins; // Simple approximation, needs proper streak tracking

        stats.lastUpdated = Date.now();
        await stats.save();

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ message: 'An error occurred while fetching statistics' });
    }
});

module.exports = router;