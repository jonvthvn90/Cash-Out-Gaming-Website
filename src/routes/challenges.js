const express = require('express');
const router = express.Router();
const Challenge = require('../models/Challenge');
const User = require('../models/User');
const Leaderboard = require('../models/Leaderboard');
// Create a new challenge
router.post('/', async (req, res) => {
    const { challengerId, opponentId, game } = req.body;
    if (!challengerId || !opponentId || !game) {
        return res.status(400).send({ message: 'Missing challenge information' });
    }

    try {
        const challenge = new Challenge({
            challenger: challengerId,
            opponent: opponentId,
            game: game,
        });
        await challenge.save();
        io.to(opponentId).emit('challengeIssued', challenge); // Emit event to opponent
        res.status(201).send(challenge);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Accept or reject a challenge
router.put('/:id', async (req, res) => {
    const { status } = req.body;
    if (status !== 'accepted' && status !== 'rejected') {
        return res.status(400).send({ message: 'Invalid status' });
    }

    try {
        const challenge = await Challenge.findById(req.params.id);
        if (!challenge) {
            return res.status(404).send({ message: 'Challenge not found' });
        }

        challenge.status = status;
        await challenge.save();
        io.to(challenge.challenger).emit('challengeResponse', challenge); // Emit event to challenger
        res.status(200).send(challenge);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Update result of a challenge (when completed)
router.post('/:id/result', async (req, res) => {
    const { result } = req.body;
    try {
        const challenge = await Challenge.findByIdAndUpdate(
            req.params.id,
            { result: result, status: 'completed' },
            { new: true }
        );
        if (!challenge) {
            return res.status(404).send({ message: 'Challenge not found' });
        }

        io.to(challenge.challenger).to(challenge.opponent).emit('challengeResult', challenge); // Emit event to both participants
        res.status(200).send(challenge);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;

// ... existing code ...

// Report the result of a challenge
router.post('/:id/report', async (req, res) => {
    const challengeId = req.params.id;
    const { winnerId, loserId, scores } = req.body; // Assuming scores is an object with scores for each player

    try {
        const challenge = await Challenge.findById(challengeId);
        if (!challenge) {
            return res.status(404).send({ message: 'Challenge not found' });
        }

        if (challenge.status !== 'accepted') {
            return res.status(400).send({ message: 'Challenge must be accepted before reporting results' });
        }

        challenge.result = {
            winner: winnerId,
            loser: loserId,
            scores: scores,
        };
        challenge.status = 'completed';
        await challenge.save();

        // Update scores for leaderboard
        await updateLeaderboard(challenge.game, winnerId, scores[winnerId], loserId, scores[loserId]);

        io.to(challenge.challenger).to(challenge.opponent).emit('challengeResult', challenge); // Emit event to both participants
        res.status(200).send(challenge);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Helper function to update leaderboard
async function updateLeaderboard(game, winnerId, winnerScore, loserId, loserScore) {
    // Assuming you have a Leaderboard model that tracks wins, losses, and points for each game
    const Leaderboard = require('../models/Leaderboard');
    
    // Update winner's stats
    await Leaderboard.findOneAndUpdate(
        { user: winnerId, game: game },
        { $inc: { wins: 1, points: winnerScore } },
        { upsert: true }
    );

    // Update loser's stats
    await Leaderboard.findOneAndUpdate(
        { user: loserId, game: game },
        { $inc: { losses: 1, points: loserScore } },
        { upsert: true }
    );
}

module.exports = router;

exports.getPaginatedLeaderboard = async (req, res) => {
    const { game, page = 1, limit = 10 } = req.query;
    try {
        const leaderboard = await Leaderboard.find({ game: game })
            .sort({ points: -1, wins: -1 }) // Sort by points descending, then wins
            .skip((page - 1) * limit)
            .limit(limit * 1)
            .exec();

        const count = await Leaderboard.countDocuments({ game: game });

        res.status(200).send({
            total: count,
            page: page,
            totalPages: Math.ceil(count / limit),
            leaderboard: leaderboard,
        });
    } catch (error) {
        res.status(500).send(error);
    }
};

// Fetch all challenges for a user (assuming you have a way to identify the user, like JWT or session)
router.get('/', async (req, res) => {
    try {
        const challenges = await Challenge.find({ $or: [{ challenger: req.user._id }, { opponent: req.user._id }] });
        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;

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

module.exports = router;

// Assuming in your server routes
app.post('/api/challenges', async (req, res) => {
    try {
        const newChallenge = new Challenge({ 
            challenger: req.body.challenger, 
            opponent: req.body.opponent, 
            game: req.body.game, 
            status: 'pending' 
        });
        await newChallenge.save();
        res.status(201).json(newChallenge);
    } catch (error) {
        res.status(400).send(error);
    }
});

router.post('/create', async (req, res) => {
    try {
        const { challengeeId, game, betAmount } = req.body;
        const challenger = await User.findById(req.user._id);
        const challengee = await User.findById(challengeeId);

        if (!challengee) {
            return res.status(404).json({ message: 'Challengee not found' });
        }

        // Check if the challenger has enough balance for the bet
        if (betAmount > challenger.balance) {
            return res.status(400).json({ message: 'Insufficient balance for the bet' });
        }

        const challenge = new Challenge({
            challenger: challenger._id,
            challengee: challengeeId,
            game,
            betAmount
        });

        await challenge.save();
        res.status(201).json({ message: 'Challenge created successfully', challenge });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Accept, reject, or complete a challenge
router.put('/:challengeId/:action', async (req, res) => {
    try {
        const { challengeId, action } = req.params;
        const challenge = await Challenge.findById(challengeId);

        if (!challenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        if (req.user._id.toString() !== challenge.challengee.toString()) {
            return res.status(403).json({ message: 'Only the challengee can accept or reject this challenge' });
        }

        if (action === 'accept') {
            challenge.status = 'accepted';
        } else if (action === 'reject') {
            challenge.status = 'rejected';
        } else if (action === 'complete') {
            challenge.status = 'completed';
            challenge.winner = req.body.winner; // Assuming the winner's ID is sent in the request body
        } else {
            return res.status(400).json({ message: 'Invalid action' });
        }

        await challenge.save();
        res.json({ message: `Challenge ${action}ed`, challenge });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get challenges for a user (as challenger or challengee)
router.get('/user', async (req, res) => {
    try {
        const challenges = await Challenge.find({
            $or: [
                { challenger: req.user._id },
                { challengee: req.user._id }
            ]
        }).populate('challenger', 'username').populate('challengee', 'username').sort({ createdAt: -1 });

        res.json(challenges);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;