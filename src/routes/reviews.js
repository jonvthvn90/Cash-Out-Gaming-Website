const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Post a new review
router.post('/', authenticateUser, async (req, res) => {
    try {
        const { revieweeId, rating, comment } = req.body;
        const reviewer = await User.findById(req.user._id);
        const reviewee = await User.findById(revieweeId);

        if (!reviewee) {
            return res.status(404).json({ message: 'User to review not found' });
        }

        // Validate rating
        if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
            return res.status(400).json({ message: 'Rating must be an integer between 1 and 5' });
        }

        const review = new Review({
            reviewer: reviewer._id,
            reviewee: reviewee._id,
            rating: rating,
            comment: comment
        });

        await review.save();

        // Update reviewee's rating statistics
        reviewee.totalRatings += 1;
        reviewee.ratingSum = (reviewee.ratingSum || 0) + rating; // Assuming ratingSum exists in User model
        reviewee.averageRating = reviewee.ratingSum / reviewee.totalRatings;

        await reviewee.save();

        res.status(201).json({ message: 'Review posted successfully', review });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get reviews for a user
router.get('/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.params.userId)
            .populate({
                path: 'reviews',
                populate: {
                    path: 'reviewer',
                    select: 'username'  // Only select the username to keep the response lean
                },
                options: { sort: { createdAt: -1 } }  // Sort reviews by creation date, newest first
            });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            averageRating: user.averageRating || 0,
            totalRatings: user.totalRatings || 0,
            reviews: user.reviews.map(review => ({
                _id: review._id,
                rating: review.rating,
                comment: review.comment,
                reviewer: review.reviewer.username,
                createdAt: review.createdAt
            }))
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;