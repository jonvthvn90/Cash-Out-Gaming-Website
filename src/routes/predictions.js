const express = require('express');
const router = express.Router();
const Prediction = require('../models/Prediction');
const Match = require('../models/Match');
const User = require('../models/User');

// Make a prediction
router.post('/', async (req, res) => {
    try {
        const { matchId, predictedWinner, predictedScore } = req.body;
        const match = await Match.findById(matchId);
        if (!match || match.status !== 'scheduled') {
            return res.status(400).json({ message: 'Match is not available for predictions.' });
        }

        const prediction = new Prediction({
            user: req.user._id,
            match: matchId,
            predictedWinner,
            predictedScore
        });

        await prediction.save();
        res.status(201).json({ message: 'Prediction made successfully', prediction });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Resolve predictions after match ends
router.post('/resolve/:matchId', async (req, res) => {
    try {
        const match = await Match.findById(req.params.matchId).populate('winner');
        if (!match || match.status !== 'completed') {
            return res.status(400).json({ message: 'Match not completed or not found.' });
        }

        const predictions = await Prediction.find({ match: req.params.matchId });

        for (let prediction of predictions) {
            let points = 0;
            
            // Check if the prediction for the winner is correct
            if (prediction.predictedWinner.toString() === match.winner._id.toString()) {
                points += 10; // Points for correctly predicting the winner
            }

            // Check if the score prediction is correct
            if (prediction.predictedScore && 
                prediction.predictedScore.player1 === match.score.player1 && 
                prediction.predictedScore.player2 === match.score.player2) {
                points += 20; // Additional points for exact score prediction
            }

            // Update prediction with points and status
            prediction.points = points;
            prediction.status = points > 0 ? 'correct' : 'incorrect';
            await prediction.save();

            // Update user's points
            const user = await User.findById(prediction.user);
            user.points += points;
            await user.save();
        }

        res.json({ message: 'Predictions resolved', resolvedPredictions: predictions.length });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;