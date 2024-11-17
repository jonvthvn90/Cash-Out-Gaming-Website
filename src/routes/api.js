const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const matchController = require('../controllers/matchController');
const authMiddleware = require('../middleware/authMiddleware'); // Assuming you have this for authentication

// Authentication Middleware
router.use(authMiddleware);

// User-related routes
router.post('/users/register', userController.createUser);
router.post('/users/login', userController.login);
router.post('/users/logout', userController.logout);

// Routes requiring user authentication
router.put('/users/:userId/update', (req, res, next) => {
    if (req.params.userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this user.' });
    }
    next();
}, userController.updateUser);

router.get('/users/:userId', userController.getUserProfile);
router.post('/users/:userId/addFriend', userController.addFriend);
router.post('/users/:userId/removeFriend', userController.removeFriend);
router.get('/users/:userId/friends', userController.getFriends);

// Match-related routes
router.post('/matches/find', matchController.findMatch);
router.post('/matches/updateResult', (req, res, next) => {
    // Assuming match results are updated by players involved or an admin
    if (req.body.userId !== req.user._id.toString()) {
        return res.status(403).json({ message: 'You are not authorized to update this match result.' });
    }
    next();
}, matchController.updateMatchResult);

router.get('/matches/history/:userId', (req, res, next) => {
    // Ensure the user can only see their own or friends' match history
    if (req.params.userId !== req.user._id.toString() && !req.user.friends.includes(req.params.userId)) {
        return res.status(403).json({ message: 'You are not authorized to view this match history.' });
    }
    next();
}, matchController.getMatchHistory);

module.exports = router;