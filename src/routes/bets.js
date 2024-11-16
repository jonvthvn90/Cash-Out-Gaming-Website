const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const User = require('../models/User');
const Match = require('../models/Match'); // Assuming you have a Match model

// Place a bet
router.post('/', async (req, res) => {
    try {
        const { matchId, amount, winnerId } = req.body;
        const match = await Match.findById(matchId);
        if (!match || match.status !== 'scheduled') {
            return res.status(400).json({ message: 'Match is not available for betting.' });
        }

        const user = await User.findById(req.user._id);
        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds.' });
        }

        // Odds logic would go here, for simplicity, we'll use a fixed odds
        const odds = 2; // Example odds

        const bet = new Bet({
            user: user._id,
            match: matchId,
            amount,
            odds,
            winner: winnerId
        });

        // Deduct bet amount from user's balance
        user.balance -= amount;
        await user.save();

        await bet.save();

        res.status(201).json({ message: 'Bet placed successfully', bet });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Resolve bets after match ends
router.post('/resolve/:matchId', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).populate('winner');
        if (!match || match.status !== 'completed') {
            return res.status(400).json({ message: 'Match not completed or not found.' });
        }

        const bets = await Bet.find({ match: req.params.matchId });

        for (let bet of bets) {
            const user = await User.findById(bet.user);
            if (bet.winner.toString() === match.winner._id.toString()) {
                // Bet won
                const winnings = bet.amount * bet.odds;
                bet.status = 'won';
                bet.payout = winnings;
                user.balance += winnings;
            } else {
                // Bet lost
                bet.status = 'lost';
                bet.payout = 0;
            }
            await bet.save();
            await user.save();
        }

        res.json({ message: 'Bets resolved', resolvedBets: bets });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch user's betting history
router.get('/history', async (req, res) => {
    try {
        const bets = await Bet.find({ user: req.user._id })
            .populate('match', 'game status') // Populate match data, select fields for performance
            .populate('winner', 'username') // Populate winner data if available
            .sort({ createdAt: -1 }); // Sort by most recent first

        res.json(bets);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;