const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
const { io } = require('../socket'); // Assuming you've exported io from your socket setup

// Create a new challenge
router.post('/', async (req, res) => {
    const { challengerId, opponentId, game } = req.body;
    if (!challengerId || !opponentId || !game) {
        return res.status(400).json({ message: 'Missing challenge information' });
    }

    try {
        const challenge = new Challenge({
            challenger: challengerId,
            opponent: opponentId,
            game: game,
            status: 'pending'
        });
        await challenge.save();
        io.to(opponentId).emit('challengeIssued', challenge);
        res.status(201).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Accept or reject a challenge
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    const validStatuses = ['accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    try {
        const challenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            { status: status },
            { new: true, runValidators: true }
        );
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }
        io.to(challenge.challenger).emit('challengeResponse', challenge);
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update result of a challenge (when completed)
router.post('/:id/result', async (req, res) => {
    const { result } = req.body;
    try {
        const challenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            { result: result, status: 'completed' },
            { new: true, runValidators: true }
        );
        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        io.emit('challengeResult', challenge); // Changed to emit to all connected clients for simplicity
        await updateLeaderboard(challenge.game, result.winner, result.scores[result.winner], result.loser, result.scores[result.loser]);
        res.status(200).json(challenge);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Helper function to update leaderboard
async function updateLeaderboard(game, winnerId, winnerScore, loserId, loserScore) {
    const updateStats = async (userId, wins = 0, losses = 0, points = 0) => {
        await Leaderboard.findOneAndUpdate(
            { user: userId, game: game },
            { $inc: { wins: wins, losses: losses, points: points } },
            { upsert: true, new: true }
        );
    };

    await updateStats(winnerId, 1, 0, winnerScore);
    await updateStats(loserId, 0, 1, loserScore);
}

// Export the router
module.exports = router;

// ... continue with the existing router ...

// Fetch all challenges for a user (assuming you have a way to identify the user, like JWT or session)
router.get('/', async (req, res) => {
    try {
        // Ensure middleware adds user ID to req.user
        const challenges = await Challenge.find({ $or: [{ challenger: req.user._id }, { opponent: req.user._id }] });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Fetch ongoing challenges
router.get('/ongoing', async (req, res) => {
    try {
        const ongoingChallenges = await Challenge.find({
            $or: [{ challenger: req.user._id }, { opponent: req.user._id }],
            status: { $in: ['pending', 'accepted'] }
        }).populate('challenger', 'username').populate('opponent', 'username');

        res.json(ongoingChallenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Assume this function is in your app setup or another file
exports.getPaginatedLeaderboard = async (req, res) => {
    const { game, page = 1, limit = 10 } = req.query;
    try {
        const leaderboard = await Leaderboard.find({ game: game })
            .sort({ points: -1, wins: -1 }) // Sort by points descending, then wins
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec();

        const count = await Leaderboard.countDocuments({ game: game });

        res.status(200).json({
            total: count,
            page: parseInt(page),
            totalPages: Math.ceil(count / limit),
            leaderboard: leaderboard,
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = router;