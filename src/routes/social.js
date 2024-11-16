const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Add a friend
router.post('/add-friend/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const friend = await User.findById(req.params.userId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.addFriend(friend._id);
        res.json({ message: 'Friend added successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remove a friend
router.delete('/remove-friend/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        await user.removeFriend(req.params.userId);
        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Follow a user
router.post('/follow/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        await user.followUser(req.params.userId);
        res.json({ message: 'You are now following this user' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Unfollow a user
router.post('/unfollow/:userId', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        await user.unfollowUser(req.params.userId);
        res.json({ message: 'You have unfollowed this user' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's friends
router.get('/friends', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'username avatar');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get users that this user is following
router.get('/following', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'username avatar');
        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get followers of this user
router.get('/followers', async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('followers', 'username avatar');
        res.json(user.followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;