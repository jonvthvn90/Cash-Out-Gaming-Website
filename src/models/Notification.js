const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for the notification']
    },
    type: {
        type: String,
        enum: ['challenge', 'tournament', 'match', 'chat', 'promotion', 'friendRequest', 'system'],
        required: [true, 'Notification type is required']
    },
    content: {
        type: String,
        required: [true, 'Notification content is required']
    },
    relatedObjectId: {
        type: Schema.Types.ObjectId,
        refPath: 'type', // Polymorphic relationship
        required: function() {
            return ['challenge', 'tournament', 'match', 'chat'].includes(this.type);
        }
    },
    read: {
        type: Boolean,
        default: false,
        index: true // Index for faster querying of unread notifications
    },
    // Additional fields for more granular control
    priority: {
        type: Number,
        default: 0,
        min: 0,
        max: 3 // 0 = low, 1 = medium, 2 = high, 3 = urgent
    },
    expiresAt: {
        type: Date
    },
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this notification
NotificationSchema.virtual('url').get(function() {
    return `/api/notifications/${this._id}`;
});

// Pre 'save' middleware to manage expiration
NotificationSchema.pre('save', function(next) {
    if (this.isModified('type')) {
        // Set an expiration time based on the notification type
        switch (this.type) {
            case 'challenge':
                this.expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
                break;
            case 'tournament':
            case 'match':
                this.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours
                break;
            // Other types can be left to expire or not as per your design
        }
    }
    next();
});

// Post 'save' middleware for logging
NotificationSchema.post('save', function(doc, next) {
    console.log(`Notification saved with type ${doc.type} for user ${doc.user}`);
    next();
});

// Static method to fetch unread notifications for a user
NotificationSchema.statics.getUnreadNotifications = function(userId, limit = 10) {
    return this.find({ user: userId, read: false })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('relatedObjectId'); // Assuming you want to populate related objects
};

// Static method to mark notifications as read
NotificationSchema.statics.markAsRead = async function(userId, notificationIds) {
    const bulkOps = notificationIds.map(id => ({
        updateOne: {
            filter: { _id: id, user: userId, read: false },
            update: { $set: { read: true } },
            upsert: false
        }
    }));
    return this.bulkWrite(bulkOps);
};

// Instance method to mark a single notification as read
NotificationSchema.methods.markAsRead = async function() {
    this.read = true;
    return await this.save();
};

// Instance method to check if the notification has expired
NotificationSchema.methods.isExpired = function() {
    return this.expiresAt && this.expiresAt < Date.now();
};

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;