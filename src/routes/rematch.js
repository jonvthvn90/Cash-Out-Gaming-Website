const express = require('express');
const router = express.Router();
const Challenge = require('../../models/Challenge');

// Request a rematch
router.post('/:challengeId/request', async (req, res) => {
    try {
        // Find the original challenge
        const originalChallenge = await Challenge.findById(req.params.challengeId)
            .populate('challenger opponent');
        
        if (!originalChallenge) {
            return res.status(404).json({ message: 'Challenge not found' });
        }

        // Create a new rematch challenge
        const rematch = new Challenge({
            challenger: originalChallenge.opponent._id,
            opponent: originalChallenge.challenger._id,
            game: originalChallenge.game,
            isRematch: true,
            originalChallenge: originalChallenge._id,
            status: 'pending',
        });

        await rematch.save();
        res.status(201).json(rematch);
    } catch (error) {
        res.status(500).json({ message: 'Error requesting rematch', error: error.message });
    }
});

// Accept or reject a rematch
router.post('/:rematchId/:action', async (req, res) => {
    try {
        // Find the rematch challenge
        const rematch = await Challenge.findById(req.params.rematchId);
        
        if (!rematch) {
            return res.status(404).json({ message: 'Rematch not found' });
        }

        // Validate action
        if (req.params.action !== 'accept' && req.params.action !== 'reject') {
            return res.status(400).json({ message: 'Invalid action. Use "accept" or "reject".' });
        }

        // Update the status based on the action
        rematch.status = req.params.action === 'accept' ? 'accepted' : 'rejected';
        await rematch.save();

        res.status(200).json({
            message: `Rematch ${req.params.action}ed successfully`,
            challenge: rematch
        });
    } catch (error) {
        res.status(500).json({ message: 'Error processing rematch request', error: error.message });
    }
});

module.exports = router;