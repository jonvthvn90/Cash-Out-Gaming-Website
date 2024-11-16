const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const matchController = require('../controllers/matchController');

// User-related routes
router.post('/users/register', userController.createUser);
router.post('/users/login', userController.login);
router.post('/users/logout', userController.logout);
router.put('/users/:userId/update', userController.updateUser);
router.get('/users/:userId', userController.getUserProfile);
router.post('/users/:userId/addFriend', userController.addFriend);
router.post('/users/:userId/removeFriend', userController.removeFriend);
router.get('/users/:userId/friends', userController.getFriends);

// Match-related routes
router.post('/matches/find', matchController.findMatch);
router.post('/matches/updateResult', matchController.updateMatchResult);
router.get('/matches/history/:userId', matchController.getMatchHistory);

module.exports = router;