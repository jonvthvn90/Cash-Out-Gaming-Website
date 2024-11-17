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
        const userId = req.params.userId;

        // Try to find existing statistics for the user
        let stats = await Statistic.findOne({ user: userId }).populate('user', 'wins');

        // If no statistics found, create a new Statistic document
        if (!stats) {
            stats = new Statistic({ user: userId });
        }

        // Fetch user's matches and bets
        const matches = await Match.find({ 'players.user': userId })
            .select('game winner');

        const bets = await Bet.find({ user: userId })
            .select('amount odds status');

        // Update statistics based on the fetched data
        stats.totalGames = matches.length;

        // Calculate win rate
        const wins = matches.reduce((acc, match) => 
            match.winner && match.winner.toString() === userId ? acc + 1 : acc, 0);
        stats.winRate = matches.length > 0 ? wins / matches.length : 0;

        // Calculate average bet amount
        const totalBetAmount = bets.reduce((sum, bet) => sum + bet.amount, 0);
        stats.averageBetAmount = bets.length > 0 ? totalBetAmount / bets.length : 0;

        // Calculate total earnings from bets
        stats.totalEarnings = bets.reduce((total, bet) => 
            bet.status === 'won' ? total + (bet.amount * (bet.odds - 1)) : total, 0);

        // Most frequent game
        const gameFrequency = matches.reduce((freq, match) => {
            freq[match.game] = (freq[match.game] || 0) + 1;
            return freq;
        }, {});
        stats.mostFrequentGame = Object.keys(gameFrequency).reduce((a, b) => 
            gameFrequency[a] > gameFrequency[b] ? a : b, '');

        // Total hours played - this would require real time tracking in matches
        stats.totalHoursPlayed = 0; // Placeholder, needs real time tracking

        // Longest win streak
        const user = await User.findById(userId).select('wins');
        const winStreak = user ? user.wins : 0;
        stats.longestStreak = winStreak; // Simple approximation, needs proper streak tracking

        // Update the last updated time
        stats.lastUpdated = Date.now();

        // Save the statistics to the database
        await stats.save();

        res.json(stats);
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(500).json({ message: 'An error occurred while fetching statistics' });
    }
});

module.exports = router;