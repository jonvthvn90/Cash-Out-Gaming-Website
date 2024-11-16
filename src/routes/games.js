const express = require('express');
const router = express.Router();
const Game = require('../models/Game'); // Assuming you have a Game model

// Create a new game room
router.post('/create', async (req, res) => {
    try {
        const { player1, player2, gameType } = req.body;
        const newGame = new Game({
            players: [player1, player2],
            status: 'waiting',
            gameType: gameType
        });

        await newGame.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update game state
router.put('/:gameId', async (req, res) => {
    try {
        const { gameState } = req.body;
        const updatedGame = await Game.findByIdAndUpdate(req.params.gameId, { gameState }, { new: true });
        if (!updatedGame) return res.status(404).send("Game not found");
        res.json(updatedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;