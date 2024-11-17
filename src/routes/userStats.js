const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bet = require('../models/Bet');
const Challenge = require('../models/Challenge');
const Tournament = require('../models/Tournament');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Middleware to check if user has admin rights or if they are viewing their own stats
const authorizeUserOrAdmin = (req, res, next) => {
    const userId = req.params.userId;

    if (userId !== req.user._id.toString() && !req.user.isAdmin) {
        return res.status(403).json({ message: 'Access denied. Admin privileges required to view other users\' stats.' });
    }
    next();
};

// Get user stats
router.get('/:userId', authenticateUser, authorizeUserOrAdmin, async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id; // Allow admin to view stats of other users if userId is provided

        const [bets, challenges, tournaments, user] = await Promise.all([
            Bet.find({ user: userId }),
            Challenge.find({ 
                $or: [
                    { challenger: userId }, 
                    { opponent: userId }
                ] 
            }).populate('winner'),
            Tournament.find({ 
                participants: { $elemMatch: { user: userId } } 
            }).populate('winner'),
            User.findById(userId).select('username')
        ]);

        const stats = {
            username: user.username,
            totalBets: bets.length,
            totalBetAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
            totalWins: bets.filter(bet => bet.status === 'won').length,
            totalLosses: bets.filter(bet => bet.status === 'lost').length,
            totalWinnings: bets.reduce((sum, bet) => bet.status === 'won' ? sum + bet.payout : sum, 0),
            challenges: {
                created: challenges.filter(challenge => challenge.challenger.toString() === userId).length,
                accepted: challenges.filter(challenge => challenge.opponent.toString() === userId).length,
                won: challenges.filter(challenge => 
                    challenge.winner && challenge.winner._id.toString() === userId
                ).length,
                lost: challenges.filter(challenge => 
                    challenge.winner && challenge.winner._id.toString() !== userId && (challenge.challenger.toString() === userId || challenge.opponent.toString() === userId)
                ).length
            },
            tournamentsJoined: tournaments.length,
            tournamentsWon: tournaments.filter(tournament => tournament.winner && tournament.winner._id.toString() === userId).length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;