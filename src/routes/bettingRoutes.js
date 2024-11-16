const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Bet = require('../models/Bet');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // Ensure all routes in this file require authentication

// Route to place a bet
router.post('/:matchId/bet', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'live') {
            return res.status(400).json({ message: 'Match is not available for betting' });
        }

        const { amount, predictedWinner } = req.body;
        if (![1, 5, 10].includes(amount) || !match.participants.includes(predictedWinner)) {
            return res.status(400).json({ message: 'Invalid bet amount or predicted winner' });
        }

        // Check if user has enough balance
        if (req.user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const bet = new Bet({
            user: req.user._id,
            match: match._id,
            amount,
            predictedWinner
        });

        const savedBet = await bet.save();

        // Deduct from user's balance
        await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount } });

        res.status(201).json({ message: 'Bet placed successfully', bet: savedBet });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while placing the bet', error: error.message });
    }
});

// Route to resolve bets after a match ends
router.post('/:matchId/resolve', async (req, res) => {
    try {
        const match = await Match.findByIdAndUpdate(req.params.matchId, { winner: req.body.winner, status: 'completed' }, { new: true });
        if (!match) {
            return res.status(404).json({ message: 'Match not found' });
        }

        const bets = await Bet.find({ match: match._id, status: 'pending' });

        if (bets.length === 0) {
            return res.json({ message: 'No bets to resolve' });
        }

        const winningBets = bets.filter(bet => bet.predictedWinner === match.winner);
        const losingBets = bets.filter(bet => bet.predictedWinner !== match.winner);

        const totalPot = bets.reduce((sum, bet) => sum + bet.amount, 0);
        const winningsPerBet = totalPot / winningBets.length || 0;

        // Update winning bets status to 'won' and credit winnings
        for (const bet of winningBets) {
            await Bet.findByIdAndUpdate(bet._id, { status: 'won' });
            await User.findByIdAndUpdate(bet.user, { $inc: { balance: winningsPerBet } });
        }

        // Update losing bets status to 'lost'
        for (const bet of losingBets) {
            await Bet.findByIdAndUpdate(bet._id, { status: 'lost' });
        }

        res.json({ message: 'Bets resolved successfully' });
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while resolving the bets', error: error.message });
    }
});

module.exports = router;