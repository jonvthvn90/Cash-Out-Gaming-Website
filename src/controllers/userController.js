const User = require('../models/User');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens
const crypto = require('crypto'); // For generating tokens or random strings
require('dotenv').config(); // To use environment variables

module.exports = {
    /**
     * Creates a new user in the database.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async createUser(req, res) {
        try {
            if (!req.body.username || !req.body.email || !req.body.password) {
                throw new Error("Username, email, and password are required");
            }

            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
                username: req.body.username,
                email: req.body.email,
                password: hashedPassword,
                skillLevel: 1000 // Starting skill level as per the model
            });
            await newUser.save();
            res.status(201).json({ message: "User created successfully", userId: newUser._id });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Authenticates a user and issues a JWT.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });

            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const isPasswordValid = await bcrypt.compare(password, user.password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid password" });
            }

            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, userId: user._id, username: user.username, skillLevel: user.skillLevel });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * Logs out the user by invalidating the token.
     * Note: In a stateless JWT system, you might not need this function. 
     * Instead, manage token invalidation on the client side or via a blacklist on the server.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async logout(req, res) {
        // In a JWT system, logout can be client-side only
        res.json({ message: "Logged out successfully" });
    },

    /**
     * Updates user information.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ user, message: "User updated successfully" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    /**
     * Retrieves user profile information, excluding the password.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).select('-password');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },

    /**
     * Adds a friend to the user's friend list.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async addFriend(req, res) {
        try {
            const { userId, friendId } = req.body;
            const [user, friend] = await Promise.all([
                User.findById(userId),
                User.findById(friendId)
            ]);

            if (!user || !friend) {
                return res.status(404).json({ message: "User or friend not found" });
            }
            if (user.friends.includes(friendId)) {
                return res.status(400).json({ message: "Friend already added" });
            }

            user.friends.push(friendId);
            await user.save();
            res.status(200).json({ message: "Friend added successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Removes a friend from the user's friend list.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async removeFriend(req, res) {
        try {
            const { userId, friendId } = req.body;
            const user = await User.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            user.friends = user.friends.filter(f => f.toString() !== friendId);
            await user.save();
            res.status(200).json({ message: "Friend removed successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },

    /**
     * Gets the list of friends for a user.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     */
    async getFriends(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).populate('friends', 'username skillLevel');
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ friends: user.friends, message: "Friends list retrieved successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    },
};