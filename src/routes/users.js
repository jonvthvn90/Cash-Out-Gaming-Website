const express = require('express');
const router = express.Router();
const Tournament = require('../models/Tournament');
const User = require('../models/User');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Create a new tournament
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { name, game, entryFee, prizePool, startDate, endDate, rules } = req.body;
        const host = req.user._id;

        if (entryFee === 0 && prizePool > 0) {
            const hostUser = await User.findById(host);
            if (hostUser.balance < prizePool) {
                return res.status(400).json({ message: 'Host does not have enough balance for the prize pool.' });
            }
            hostUser.balance -= prizePool;
            await hostUser.save();
        }

        const newTournament = new Tournament({
            name,
            game,
            entryFee,
            prizePool,
            startDate,
            endDate,
            rules,
            host,
            status: 'scheduled'
        });

        await newTournament.save();
        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Join a tournament
router.post('/:tournamentId/join', authenticateUser, async (req, res) => {
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

        if (tournament.participants.some(participant => participant.user.equals(user._id))) {
            return res.status(400).json({ message: 'You are already registered for this tournament' });
        }

        // Deduct entry fee
        user.balance -= tournament.entryFee;
        await user.save();

        // Add user to participants
        tournament.participants.push({ user: user._id });
        tournament.prizePool += tournament.entryFee; // Increase prize pool by entry fee
        await tournament.save();

        res.json({ message: 'Successfully joined the tournament', tournament: tournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// List all scheduled tournaments
router.get('/', async (req, res) => {
    try {
        const tournaments = await Tournament.find({ status: 'scheduled' })
            .sort({ startDate: 1 })
            .select('name game entryFee prizePool startDate endDate');
        res.json({ tournaments });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update tournament status
router.put('/:tournamentId/status', authenticateUser, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId);
        if (!tournament) return res.status(404).json({ message: 'Tournament not found' });

        // Only allow the host to change the status
        if (!req.user._id.equals(tournament.host)) {
            return res.status(403).json({ message: 'Only the host can update the tournament status' });
        }

        const validStatuses = ['scheduled', 'in_progress', 'completed', 'cancelled'];
        if (!validStatuses.includes(req.body.status)) {
            return res.status(400).json({ message: 'Invalid status provided' });
        }

        if (tournament.status === 'scheduled' && req.body.status === 'cancelled') {
            // Refund entry fees if tournament is cancelled
            for (const participant of tournament.participants) {
                const user = await User.findById(participant.user);
                if (user) {
                    user.balance += tournament.entryFee;
                    await user.save();
                }
            }
        }

        tournament.status = req.body.status;
        await tournament.save();

        res.json({ message: 'Tournament status updated', tournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Award prizes
router.post('/:tournamentId/award', authenticateUser, async (req, res) => {
    try {
        const tournament = await Tournament.findById(req.params.tournamentId)
            .populate('participants.user', 'username balance')
            .populate('host', 'username');

        if (!tournament || tournament.status !== 'completed') {
            return res.status(400).json({ message: 'Tournament must be completed to award prizes' });
        }

        const winner = tournament.participants.find(p => p.status === 'winner');
        if (!winner) {
            return res.status(400).json({ message: 'No winner found for the tournament' });
        }

        const winnerUser = await User.findById(winner.user);
        if (!winnerUser) {
            return res.status(404).json({ message: 'Winner user not found' });
        }

        winnerUser.balance += tournament.prizePool;
        await winnerUser.save();

        res.json({ 
            message: 'Prize awarded to the winner', 
            winner: winner.user.username, 
            prize: tournament.prizePool,
            host: tournament.host.username
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;