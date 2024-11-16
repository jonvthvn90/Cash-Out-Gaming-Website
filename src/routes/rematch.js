const express = require('express');
const router = express.Router();
const Challenge = require('../../models/Challenge');

// Request a rematch
router.post('/:challengeId/request', async (req, res) => {
    try {
        const originalChallenge = await Challenge.findById(req.params.challengeId).populate('challenger opponent');
        if (!originalChallenge) {
            return res.status(404).send({ message: 'Challenge not found' });
        }

        const rematch = new Challenge({
            challenger: originalChallenge.opponent._id,
            opponent: originalChallenge.challenger._id,
            game: originalChallenge.game,
            isRematch: true,
            originalChallenge: originalChallenge._id,
            status: 'pending',
        });

        await rematch.save();
        res.status(201).send(rematch);
    } catch (error) {
        res.status(500).send(error);
    }
});

// Accept or reject a rematch
router.post('/:rematchId/:action', async (req, res) => {
    try {
        const rematch = await Challenge.findById(req.params.rematchId);
        if (!rematch) {
            return res.status(404).send({ message: 'Rematch not found' });
        }

        rematch.status = req.params.action === 'accept' ? 'accepted' : 'rejected';
        await rematch.save();

        res.status(200).send(rematch);
    } catch (error) {
        res.status(500).send(error);
    }
});

module.exports = router;