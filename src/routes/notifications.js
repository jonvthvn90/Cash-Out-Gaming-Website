const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

/**
 * Get notifications for the authenticated user
 * @route GET /api/notifications
 * @returns {Array} notifications - Array of notification objects
 */
router.get('/', async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id })
            .sort({ createdAt: -1 })
            .limit(50) // Increased limit for better user experience
            .lean()
            .exec();

        res.json(notifications);
    } catch (error) {
        console.error('Error fetching notifications:', error);
        res.status(500).json({ message: 'Server error while fetching notifications' });
    }
});

/**
 * Mark all notifications as read for the authenticated user
 * @route PUT /api/notifications/read/all
 * @returns {Object} - Confirmation message
 */
router.put('/read/all', async (req, res) => {
    try {
        await Notification.updateMany({ user: req.user._id }, { $set: { read: true } }).exec();
        res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Error marking all notifications as read:', error);
        res.status(500).json({ message: 'Server error while marking notifications as read' });
    }
});

/**
 * Mark a specific notification as read
 * @route PUT /api/notifications/:notificationId/read
 * @param {String} notificationId - The ID of the notification to mark as read
 * @returns {Object} - Confirmation message and the updated notification
 */
router.put('/:notificationId/read', async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.notificationId, user: req.user._id },
            { read: true },
            { new: true, lean: true }
        ).exec();

        if (!notification) {
            return res.status(404).json({ message: 'Notification not found or unauthorized' });
        }

        res.json({ message: 'Notification marked as read', notification });
    } catch (error) {
        console.error('Error marking notification as read:', error);
        res.status(500).json({ message: 'Server error while marking notification as read' });
    }
});

/**
 * Create a new notification 
 * @route POST /api/notifications
 * @param {Object} req.body - Notification details including userId, type, content, and relatedObjectId
 * @returns {Object} - The newly created notification
 */
router.post('/', async (req, res) => {
    try {
        const { userId, type, content, relatedObjectId } = req.body;
        if (!userId || !type || !content) {
            return res.status(400).json({ message: 'Missing required fields: userId, type, or content' });
        }

        const notification = new Notification({
            user: userId,
            type: type,
            content: content,
            relatedObjectId: relatedObjectId || null
        });

        const savedNotification = await notification.save();
        res.status(201).json({ message: 'Notification created', notification: savedNotification });
    } catch (error) {
        console.error('Error creating notification:', error);
        res.status(400).json({ message: 'Error creating notification. Please check input' });
    }
});

module.exports = router;