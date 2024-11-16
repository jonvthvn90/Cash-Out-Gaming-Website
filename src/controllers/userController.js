const User = require('../models/User');
const bcrypt = require('bcrypt'); // For hashing passwords
const jwt = require('jsonwebtoken'); // For generating JWT tokens

module.exports = {
    async createUser(req, res) {
        try {
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

    async login(req, res) {
        try {
            const { username, password } = req.body;
            const user = await User.findOne({ username });
            if (!user) {
                return res.status(400).json({ message: "User not found" });
            }
            const isPasswordValid = await user.comparePassword(password);
            if (!isPasswordValid) {
                return res.status(400).json({ message: "Invalid password" });
            }
            const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
            res.json({ token, userId: user._id });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },

    async logout(req, res) {
        try {
            // Invalidate the token or remove it from the client-side
            const token = req.headers['authorization'].split(' ')[1];
            // Here you could add token to a blacklist or remove it from a session store
            res.json({ message: "Logged out successfully" });
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },

    async updateUser(req, res) {
        try {
            const { userId } = req.params;
            const updates = req.body;
            const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true });
            res.json({ user, message: "User updated successfully" });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getUserProfile(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).select('-password'); // Exclude password for security
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } catch (error) {
            res.status(500).json({ message: "Server error" });
        }
    },

    async addFriend(req, res) {
        try {
            const { userId, friendId } = req.body;
            const user = await User.findById(userId);
            const friend = await User.findById(friendId);
            if (!user || !friend) {
                return res.status(                return res.status(404).json({ message: "User or friend not found" });
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

    async getFriends(req, res) {
        try {
            const { userId } = req.params;
            const user = await User.findById(userId).populate('friends', 'username skillLevel'); // Populate with username and skillLevel of friends
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json({ friends: user.friends, message: "Friends list retrieved successfully" });
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
};