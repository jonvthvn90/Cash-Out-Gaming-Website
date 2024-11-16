const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a new chat room
router.post('/rooms', async (req, res) => {
    try {
        const { name, participants } = req.body;
        const newRoom = new ChatRoom({
            name,
            participants: [req.user._id, ...participants]
        });
        await newRoom.save();
        res.status(201).json({ message: 'Chat room created', room: newRoom });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all chat rooms for a user
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await ChatRoom.find({ participants: req.user._id }).populate('participants', 'username avatar').populate('lastMessage');
        res.json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send a message to a chat room
router.post('/rooms/:roomId/messages', async (req, res) => {
    try {
        const { content } = req.body;
        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        const message = new Message({
            sender: req.user._id,
            content,
            chatRoom: room._id
        });
        await message.save();

        room.lastMessage = message._id;
        await room.save();

        // Broadcast message (Implement WebSocket here)
        
        res.status(201).json({ message: 'Message sent', message });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch messages from a specific chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
    try {
        const messages = await Message.find({ chatRoom: req.params.roomId }).sort({ createdAt: 1 }).populate('sender', 'username avatar');
        res.json({ messages });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;