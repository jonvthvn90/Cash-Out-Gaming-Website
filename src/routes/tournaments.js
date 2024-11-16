const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// Create a new tournament
router.post('/', async (req, res) => {
    try {
        const { name, game, entryFee, prizePool, startDate, endDate, rules } = req.body;
        const newTournament = new Tournament({
            name,
            game,
            entryFee,
            prizePool,
            startDate,
            endDate,
            rules,
            host: req.user._id
        });

        // Optionally, check if the host has enough balance to cover the prize pool if entryFee is 0
        if (entryFee === 0 && prizePool > 0) {
            const host = await User.findById(req.user._id);
            if (host.balance < prizePool) {
                return res.status(400).json({ message: 'Host does not have enough balance for the prize pool.' });
            }
        }

        await newTournament.save();
        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Join a tournament
router.post('/:tournamentId/join', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        if (tournament.status !== 'scheduled') {
            return res.status(400).json({ message: 'This tournament is not available for joining' });
        }

        const user = await User.findById(req.user._id);
        if (user.balance < tournament.entryFee) {
            return res.status(400).json({ message: 'Insufficient balance to join this tournament' });
        }

        // Deduct entry fee
        user.balance -= tournament.entryFee;
        await user.save();

        const isAlreadyRegistered = tournament.participants.some(participant => participant.user.equals(user._id));
        if (isAlreadyRegistered) {
            return res.status(400).json({ message: 'You are already registered for this tournament' });
        }

        tournament.participants.push({ user: user._id });
        await tournament.save();

        // Add entry fee to prize pool
        tournament.prizePool += tournament.entryFee;
        await tournament.save();

        res.json({ message: 'Successfully joined the tournament', tournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all tournaments
router.get('/', async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: 'scheduled' }).sort({ startDate: 1 });
        res.json(tournaments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update tournament status (e.g., from scheduled to in_progress)
router.put('/:tournamentId/status', async (req, res) => {
    try {
        const tournament = await Tournament.findByIdAndUpdate(req.params.tournamentId, { status: req.body.status }, { new: true });
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        res.json({ message: 'Tournament status updated', tournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Award prizes (this would be more complex in reality, involving bracket checks)
router.post('/:tournamentId/award', async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId).populate('participants.user');
        if (!tournament || tournament.status !== 'completed') {
            return res.status(400).json({ message: 'Tournament must be completed to award prizes' });
        }

        // Simplified prize distribution - in reality, this would be based on the bracket outcome
        const winner = tournament.participants.find(p => p.status === 'winner');
        if (!winner) return res.status(400).json({ message: 'No winner found for the tournament' });

        const winnerUser = await User.findById(winner.user);
        winnerUser.balance += tournament.prizePool;
        await winnerUser.save();

        res.json({ message: 'Prize awarded to the winner', winner: winnerUser.username });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;