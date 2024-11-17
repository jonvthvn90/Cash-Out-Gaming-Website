const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const User = require('../models/User');
const Match = require('../models/Match');

// Place a bet
router.post('/place', async (req, res) => {
    try {
        const { matchId, amount, choice, odds } = req.body;
        const user = await User.findById(req.user._id);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.balance < amount) {
            return res.status(400).json({ message: 'Insufficient funds to place this bet' });
        }

        const match = await Match.findById(matchId);
        if (!match || match.status !== 'upcoming') {
            return res.status(400).json({ message: 'Invalid match or match not available for betting' });
        }

        const bet = new Bet({
            user: user._id,
            match: matchId,
            amount,
            choice,
            odds,
            status: 'pending'  // Set initial status to 'pending'
        });

        // Transactional operation to ensure atomicity
        const session = await Bet.startSession();
        session.startTransaction();
        try {
            await bet.save({ session });
            user.balance -= amount;
            await user.save({ session });
            await session.commitTransaction();
            session.endSession();
        } catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error; // Re-throw the error to be caught by the outer try-catch
        }

        res.status(201).json({ message: 'Bet placed successfully', bet });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Check bet results when a match concludes
router.post('/results/:matchId', async (req, res) => {
    try {
        const { result } = req.body; 
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'completed') {
            return res.status(400).json({ message: 'Match not completed or invalid' });
        }

        // Determine the winner
        let winner;
        if (result.winner === 'draw') {
            winner = 'draw';
        } else {
            winner = match.teamA._id.toString() === result.winner ? 'teamA' : 'teamB';
        }

        const bets = await Bet.find({ match: req.params.matchId });
        const updates = bets.map(async (bet) => {
            const user = await User.findById(bet.user);
            if (bet.choice === winner) {
                user.balance += bet.amount * bet.odds;
                bet.status = 'won';
            } else {
                bet.status = 'lost';
            }
            bet.result = winner;
            await Promise.all([user.save(), bet.save()]);
        });

        await Promise.all(updates);

        res.json({ message: 'Bets results processed', winningBetsCount: bets.filter(bet => bet.status === 'won').length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's betting history
router.get('/history', async (req, res) => {
    try {
        const bets = await Bet.find({ user: req.user._id })
            .populate('match', 'teamA teamB status')
            .sort({ createdAt: -1 });
        res.json({ bets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;