const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this
const adminMiddleware = require('../middleware/adminMiddleware'); // New middleware to check admin status

router.use(authMiddleware);
router.use(adminMiddleware);

// User Management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('username email createdAt');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Match Management
router.post('/matches', async (req, res) => {
    try {
        const { teamA, teamB, game, scheduledAt } = req.body;
        const newMatch = new Match({ teamA, teamB, game, scheduledAt });
        await newMatch.save();
        res.status(201).json({ message: 'Match added successfully', match: newMatch });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/matches/:matchId', async (req, res) => {
    try {
        const { winner, status } = req.body;
        const match = await Match.findByIdAndUpdate(req.params.matchId, { winner, status }, { new: true });
        if (!match) return res.status(404).json({ message: 'Match not found' });
        res.json({ message: 'Match updated successfully', match });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Tournament Management
router.post('/tournaments', async (req, res) => {
    try {
        const { name, game, entryFee, prizePool, startDate, endDate } = req.body;
        const newTournament = new Tournament({
            name,
            game,
            entryFee,
            prizePool,
            startDate,
            endDate,
            host: req.user._id
        });
        await newTournament.save();
        res.status(201).json({ message: 'Tournament created successfully', tournament: newTournament });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Product Management
router.post('/products', async (req, res) => {
    try {
        const { name, description, price, type, stock } = req.body;
        const newProduct = new Product({ name, description, price, type, stock });
        await newProduct.save();
        res.status(201).json({ message: 'Product added to store', product: newProduct });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/products/:productId', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed from store', product });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;