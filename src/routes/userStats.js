const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Bet = require('../models/Bet');
const Challenge = require('../models/Challenge');
const Tournament = require('../models/Tournament');

// Get user stats
router.get('/:userId', async (req, res) => {
    try {
        const userId = req.params.userId || req.user._id; // Allow admin to view stats of other users

        const [bets, challenges, tournaments] = await Promise.all([
            Bet.find({ user: userId }),
            Challenge.find({ $or: [{ challenger: userId }, { opponent: userId }] }),
            Tournament.find({ players: userId })
        ]);

        const stats = {
            totalBets: bets.length,
            totalBetAmount: bets.reduce((sum, bet) => sum + bet.amount, 0),
            totalWins: bets.filter(bet => bet.status === 'won').length,
            totalLosses: bets.filter(bet => bet.status === 'lost').length,
            totalWinnings: bets.reduce((sum, bet) => bet.status === 'won' ? sum + bet.payout : sum, 0),
            challenges: {
                created: challenges.filter(challenge => challenge.challenger.toString() === userId).length,
                accepted: challenges.filter(challenge => challenge.opponent.toString() === userId).length,
                won: challenges.filter(challenge => 
                    (challenge.challenger.toString() === userId && challenge.winner.toString() === userId) ||
                    (challenge.opponent.toString() === userId && challenge.winner.toString() === userId)
                ).length,
                lost: challenges.filter(challenge => 
                    (challenge.challenger.toString() === userId && challenge.winner && challenge.winner.toString() !== userId) ||
                    (challenge.opponent.toString() === userId && challenge.winner && challenge.winner.toString() !== userId)
                ).length
            },
            tournamentsJoined: tournaments.length,
            tournamentsWon: tournaments.filter(tournament => tournament.winner && tournament.winner.toString() === userId).length
        };

        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;