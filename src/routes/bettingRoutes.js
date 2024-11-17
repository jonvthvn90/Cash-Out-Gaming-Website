const express = require('express');
const router = express.Router();
const Match = require('../models/Match');
const Bet = require('../models/Bet');
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All routes in this file require authentication

// Route to place a bet
router.post('/:matchId/bet', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'live') {
            return res.status(400).json({ message: 'Match is not available for betting' });
        }

        const { amount, predictedWinner } = req.body;
        const validAmounts = [1, 5, 10];
        if (!validAmounts.includes(amount) || !match.participants.includes(predictedWinner)) {
            return res.status(400).json({ message: 'Invalid bet amount or predicted winner' });
        }

        // Check if user has enough balance
        if (req.user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient balance' });
        }

        const session = await User.startSession();
        session.startTransaction();

        try {
            const bet = new Bet({
                user: req.user._id,
                match: match._id,
                amount,
                predictedWinner
            });

            const savedBet = await bet.save({ session });

            // Deduct from user's balance
            await User.findByIdAndUpdate(req.user._id, { $inc: { balance: -amount } }, { session });

            await session.commitTransaction();
            session.endSession();

            res.status(201).json({ message: 'Bet placed successfully', bet: savedBet });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
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

        const winningBets = bets.filter(bet => bet.predictedWinner === req.body.winner);
        const losingBets = bets.filter(bet => bet.predictedWinner !== req.body.winner);

        let totalPot = 0;
        for (let bet of bets) {
            totalPot += bet.amount;
        }

        const winningsPerBet = totalPot > 0 ? totalPot / winningBets.length : 0;

        // Use a transaction to ensure atomicity when resolving bets
        const session = await User.startSession();
        session.startTransaction();

        try {
            // Update winning bets and credit winnings
            for (const bet of winningBets) {
                await Bet.findByIdAndUpdate(bet._id, { status: 'won' }, { session });
                await User.findByIdAndUpdate(bet.user, { $inc: { balance: winningsPerBet } }, { session });
            }

            // Update losing bets status
            for (const bet of losingBets) {
                await Bet.findByIdAndUpdate(bet._id, { status: 'lost' }, { session });
            }

            await session.commitTransaction();
            session.endSession();

            res.json({ message: 'Bets resolved successfully', winningsPerBet: winningsPerBet.toFixed(2) });
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    } catch (error) {
        res.status(500).json({ message: 'An error occurred while resolving the bets', error: error.message });
    }
});

module.exports = router;