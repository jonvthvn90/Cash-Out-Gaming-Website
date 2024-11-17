const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const User = require('../models/User');

// Make a prediction
router.post('/make/:matchId', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'upcoming') {
            return res.status(400).json({ message: 'Match not found or already started' });
        }

        // Check if user has already made a prediction for this match
        const existingPrediction = await Prediction.findOne({ user: req.user._id, match: req.params.matchId });
        if (existingPrediction) {
            return res.status(400).json({ message: 'You have already made a prediction for this match' });
        }

        const prediction = new Prediction({
            user: req.user._id,
            match: req.params.matchId,
            predictedWinner: req.body.predictedWinner
        });

        await prediction.save();
        res.status(201).json({ message: 'Prediction made successfully', prediction });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's predictions
router.get('/user', async (req, res) => {
    try {
        const predictions = await Prediction.find({ user: req.user._id }).populate('match', 'teamA teamB status');
        res.json({ predictions });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Update predictions after a match concludes
router.post('/update-results/:matchId', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId);
        if (!match || match.status !== 'completed') {
            return res.status(400).json({ message: 'Match not found or not completed' });
        }

        const predictions = await Prediction.find({ match: req.params.matchId });
        const correctPredictions = predictions.filter(prediction => {
            if (match.result === 'draw') return prediction.predictedWinner === 'draw';
            return match.winner === (prediction.predictedWinner === 'teamA' ? match.teamA : match.teamB);
        });

        // Points for correct predictions (this would need proper configuration)
        const pointsForCorrectPrediction = 10;

        await Promise.all(correctPredictions.map(async (prediction) => {
            prediction.points = pointsForCorrectPrediction;
            const user = await User.findById(prediction.user);
            user.points += pointsForCorrectPrediction;
            await Promise.all([prediction.save(), user.save()]);
        }));

        res.json({ message: `Results updated for match ${req.params.matchId}`, correctPredictionsCount: correctPredictions.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Leaderboard for prediction accuracy
router.get('/leaderboard', async (req, res) => {
    try {
        const leaderboard = await Prediction.aggregate([
            { $group: {
                _id: "$user",
                totalPredictions: { $sum: 1 },
                correctPredictions: { $sum: { $cond: [{ $gt: ["$points", 0] }, 1, 0] } },
                accuracy: { $avg: { $cond: [{ $gt: ["$points", 0] }, 1, 0] } }
            }},
            { $sort: { accuracy: -1, totalPredictions: -1 } },
            { $limit: 10 } // Top 10
        ]);

        const users = await User.find({ _id: { $in: leaderboard.map(l => l._id) } }).lean();
        const userMap = new Map(users.map(user => [user._id.toString(), user]));

        const formattedLeaderboard = leaderboard.map(entry => ({
            ...entry,
            username: userMap.get(entry._id.toString())?.username || 'Unknown User'
        }));

        res.json({ leaderboard: formattedLeaderboard });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;