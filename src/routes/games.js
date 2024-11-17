const express = require('express');
const router = express.Router();
const Game = require('../models/Game');

// Create a new game room
router.post('/create', async (req, res) => {
    try {
        const { player1, player2, gameType } = req.body;

        if (!player1 || !player2 || !gameType) {
            return res.status(400).json({ message: 'Player1, Player2, and GameType are required' });
        }

        const newGame = new Game({
            players: [player1, player2],
            status: 'waiting',
            gameType: gameType,
            createdAt: new Date()
        });

        const savedGame = await newGame.save();
        res.status(201).json({ message: 'Game created successfully', game: savedGame });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update game state
router.put('/:gameId', async (req, res) => {
    try {
        const { gameState, status, winner } = req.body;
        const gameId = req.params.gameId;

        const updateObject = {
            gameState,
            updatedAt: new Date()
        };

        if (status) {
            updateObject.status = status;
        }

        if (winner) {
            updateObject.winner = winner;
        }

        const updatedGame = await Game.findByIdAndUpdate(gameId, updateObject, { new: true, runValidators: true });
        if (!updatedGame) return res.status(404).json({ message: 'Game not found' });

        res.json({ message: 'Game updated successfully', game: updatedGame });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get game by ID
router.get('/:gameId', async (req, res) => {
    try {
        const game = await Game.findById(req.params.gameId);
        if (!game) return res.status(404).json({ message: 'Game not found' });
        res.json({ game });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// List all games (could be filtered or paginated)
router.get('/', async (req, res) => {
    try {
        const games = await Game.find().sort({ createdAt: -1 }).limit(20); // Limiting to 20 games for performance
        res.json({ games });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;