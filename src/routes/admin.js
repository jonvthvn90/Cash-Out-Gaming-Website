const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Admin = require('../models/Admin');
const Match = require('../models/Match');
const Tournament = require('../models/Tournament');
const Product = require('../models/Product');
const authMiddleware = require('../middleware/authMiddleware'); // Authentication middleware
const adminMiddleware = require('../middleware/adminMiddleware'); // Admin authorization middleware

// Ensure both authentication and admin checks are applied to all routes
router.use([authMiddleware, adminMiddleware]);

// User Management
router.get('/users', async (req, res) => {
    try {
        const users = await User.find().select('username email createdAt');
        res.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users', error: error.message });
    }
});

// Match Management
router.post('/matches', async (req, res) => {
    const { teamA, teamB, game, scheduledAt } = req.body;
    
    if (!teamA || !teamB || !game || !scheduledAt) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newMatch = new Match({ teamA, teamB, game, scheduledAt });
        await newMatch.save();
        res.status(201).json({ message: 'Match added successfully', match: newMatch });
    } catch (error) {
        console.error('Error creating match:', error);
        res.status(400).json({ message: 'Failed to create match', error: error.message });
    }
});

router.put('/matches/:matchId', async (req, res) => {
    const { winner, status } = req.body;
    
    if (!winner || !status) {
        return res.status(400).json({ message: 'Winner and status are required' });
    }

    try {
        const updatedMatch = await Match.findByIdAndUpdate(
            req.params.matchId, 
            { winner, status }, 
            { new: true, runValidators: true }
        );
        if (!updatedMatch) return res.status(404).json({ message: 'Match not found' });
        res.json({ message: 'Match updated successfully', match: updatedMatch });
    } catch (error) {
        console.error('Error updating match:', error);
        res.status(400).json({ message: 'Failed to update match', error: error.message });
    }
});

// Tournament Management
router.post('/tournaments', async (req, res) => {
    const { name, game, entryFee, prizePool, startDate, endDate } = req.body;
    
    if (!name || !game || !startDate || !endDate) {
        return res.status(400).json({ message: 'Name, game, start date, and end date are required' });
    }

    try {
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
        console.error('Error creating tournament:', error);
        res.status(400).json({ message: 'Failed to create tournament', error: error.message });
    }
});

// Product Management
router.post('/products', async (req, res) => {
    const { name, description, price, type, stock } = req.body;
    
    if (!name || !description || !price || !type || stock === undefined) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const newProduct = new Product({ name, description, price, type, stock });
        await newProduct.save();
        res.status(201).json({ message: 'Product added to store', product: newProduct });
    } catch (error) {
        console.error('Error adding product:', error);
        res.status(400).json({ message: 'Failed to add product', error: error.message });
    }
});

router.delete('/products/:productId', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ message: 'Product removed from store', product });
    } catch (error) {
        console.error('Error removing product:', error);
        res.status(500).json({ message: 'Failed to remove product', error: error.message });
    }
});

module.exports = router;