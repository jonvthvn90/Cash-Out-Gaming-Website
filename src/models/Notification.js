const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const NotificationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { 
        type: String, 
        enum: ['challenge', 'tournament', 'match', 'chat', 'promotion'], 
        required: true 
    },
    content: { type: String, required: true },
    relatedObjectId: { type: Schema.Types.ObjectId, refPath: 'type' }, // Polymorphic relationship
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', NotificationSchema);