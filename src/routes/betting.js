const express = require('express');
const router = express.Router();
const Bet = require('../models/Bet');
const User = require('../models/User');
const Match = require('../models/Match'); // Assuming there's a Match model

// Place a bet
router.post('/place', async (req, res) => {
    try {
        const { matchId, amount, choice, odds } = req.body;
        const user = await User.findById(req.user._id);

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
            odds
        });

        user.balance -= amount;
        await Promise.all([bet.save(), user.save()]);

        res.status(201).json({ message: 'Bet placed successfully', bet });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Check bet results when a match concludes
router.post('/results/:matchId', async (req, res) => {
    try {
        const { result } = req.body; // result should contain the match outcome
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'completed') {
            return res.status(400).json({ message: 'Match not completed or invalid' });
        }

        const bets = await Bet.find({ match: req.params.matchId });
        const winningBets = bets.filter(bet => {
            if (result.winner === 'draw') return bet.choice === 'draw';
            return bet.choice === (match.teamA._id.toString() === result.winner ? 'teamA' : 'teamB');
        });

        await Promise.all(winningBets.map(async (bet) => {
            const user = await User.findById(bet.user);
            user.balance += bet.amount * bet.odds;
            await user.save();
            bet.status = 'won';
            await bet.save();
        }));

        await Promise.all(bets.filter(bet => !winningBets.includes(bet)).map(async (bet) => {
            bet.status = 'lost';
            await bet.save();
        }));

        res.json({ message: 'Bets results processed', winningBets: winningBets.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get user's betting history
router.get('/history', async (req, res) => {
    try {
        const bets = await Bet.find({ user: req.user._id }).populate('match', 'teamA teamB status');
        res.json({ bets });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;