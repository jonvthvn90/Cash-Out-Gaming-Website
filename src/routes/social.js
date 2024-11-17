const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Add a friend
router.post('/add-friend/:userId', authenticateUser, async (req, res) => {
    try {
        if (req.user._id.toString() === req.params.userId) {
            return res.status(400).json({ message: 'You cannot add yourself as a friend' });
        }
        
        const user = await User.findById(req.user._id);
        const friend = await User.findById(req.params.userId);

        if (!friend) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.addFriend(friend._id);
        await friend.addFriend(user._id); // Ensure both users add each other as friends
        res.json({ message: 'Friend added successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Remove a friend
router.delete('/remove-friend/:userId', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const friend = await User.findById(req.params.userId);

        if (!friend) {
            return res.status(404).json({ message: 'Friend not found' });
        }

        await user.removeFriend(friend._id);
        await friend.removeFriend(user._id); // Ensure the friendship is removed from both sides
        res.json({ message: 'Friend removed successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Follow a user
router.post('/follow/:userId', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const toFollow = await User.findById(req.params.userId);

        if (!toFollow) {
            return res.status(404).json({ message: 'User to follow not found' });
        }

        if (user._id.toString() === req.params.userId) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        await user.followUser(toFollow._id);
        await toFollow.addFollower(user._id); // Add the user as a follower to the followed user

        res.json({ message: 'You are now following this user' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Unfollow a user
router.post('/unfollow/:userId', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        const toUnfollow = await User.findById(req.params.userId);

        if (!toUnfollow) {
            return res.status(404).json({ message: 'User to unfollow not found' });
        }

        await user.unfollowUser(toUnfollow._id);
        await toUnfollow.removeFollower(user._id); // Remove the user from the followers

        res.json({ message: 'You have unfollowed this user' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get user's friends
router.get('/friends', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('friends', 'username avatar');
        res.json(user.friends);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get users that this user is following
router.get('/following', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('following', 'username avatar');
        res.json(user.following);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get followers of this user
router.get('/followers', authenticateUser, async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate('followers', 'username avatar');
        res.json(user.followers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;