const express = require('express');
const router = express.Router();
const ChatRoom = require('../models/ChatRoom');
const Message = require('../models/Message');
const User = require('../models/User');

// Create a new chat room
router.post('/rooms', async (req, res) => {
    try {
        const { name, participants } = req.body;
        if (!Array.isArray(participants) || participants.length === 0) {
            return res.status(400).json({ message: 'Invalid participants list' });
        }

        const newRoom = new ChatRoom({
            name,
            participants: [req.user._id, ...participants]
        });
        
        const createdRoom = await newRoom.save();
        res.status(201).json({ message: 'Chat room created successfully', room: createdRoom });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get all chat rooms for a user
router.get('/rooms', async (req, res) => {
    try {
        const rooms = await ChatRoom.find({ participants: req.user._id })
            .populate('participants', 'username avatar')
            .populate({
                path: 'lastMessage',
                populate: {
                    path: 'sender',
                    select: 'username avatar'
                }
            })
            .sort({ updatedAt: -1 }); // Sort by most recently updated
        res.json({ rooms });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Send a message to a chat room
router.post('/rooms/:roomId/messages', async (req, res) => {
    try {
        const { content } = req.body;
        if (!content || typeof content !== 'string') {
            return res.status(400).json({ message: 'Message content is required' });
        }

        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        if (!room.participants.includes(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to send messages in this room' });
        }

        const message = new Message({
            sender: req.user._id,
            content,
            chatRoom: room._id
        });
        const savedMessage = await message.save();

        room.lastMessage = savedMessage._id;
        room.updatedAt = new Date();  // Update the room's last update time
        await room.save();

        // Broadcast message (You would implement WebSocket here)
        // Example:
        // io.to(room._id).emit('newMessage', savedMessage);

        res.status(201).json({ message: 'Message sent successfully', message: savedMessage });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Fetch messages from a specific chat room
router.get('/rooms/:roomId/messages', async (req, res) => {
    try {
        const messages = await Message.find({ chatRoom: req.params.roomId })
            .sort({ createdAt: 1 })
            .populate('sender', 'username avatar')
            .limit(50); // Limit to last 50 messages for performance

        const room = await ChatRoom.findById(req.params.roomId);
        if (!room) {
            return res.status(404).json({ message: 'Chat room not found' });
        }

        res.json({
            messages,
            room: {
                _id: room._id,
                name: room.name,
                participants: room.participants.map(p => p.toString())
            }
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;