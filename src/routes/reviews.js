const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Post a new review
router.post('/', async (req, res) => {
    try {
        const { revieweeId, rating, comment } = req.body;
        const reviewer = await User.findById(req.user._id);
        const reviewee = await User.findById(revieweeId);

        if (!reviewee) {
            return res.status(404).json({ message: 'User to review not found' });
        }

        const review = new Review({
            reviewer: reviewer._id,
            reviewee: revieweeId,
            rating: rating,
            comment: comment
        });

        await review.save();
        await reviewee.updateRating(rating); // Update reviewee's average rating

        res.status(201).json({ message: 'Review posted successfully', review });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get reviews for a user
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId).populate('reviews');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({
            averageRating: user.averageRating,
            totalRatings: user.totalRatings,
            reviews: user.reviews
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;