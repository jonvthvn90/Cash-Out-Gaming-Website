const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a sender']
    },
    content: {
        type: String,
        required: [true, 'Message content is required'],
        trim: true,
        maxlength: [1000, 'Message content cannot exceed 1000 characters']
    },
    chatRoom: {
        type: Schema.Types.ObjectId,
        ref: 'ChatRoom',
        required: [true, 'Message must belong to a chat room']
    },
    // Additional fields for message types
    type: {
        type: String,
        enum: ['text', 'image', 'file', 'system'],
        default: 'text'
    },
    // For non-text messages
    attachment: {
        url: String,
        name: String,
        type: String // MIME type
    },
    // For messages that have been edited
    edited: {
        type: Boolean,
        default: false
    },
    // For messages that have been deleted
    deleted: {
        type: Boolean,
        default: false
    },
    // For system messages
    systemMessage: {
        type: String,
        enum: ['joined', 'left', 'moderated']
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this message
MessageSchema.virtual('url').get(function() {
    return `/api/messages/${this._id}`;
});

// Virtual for displaying the sender's username
MessageSchema.virtual('senderUsername').get(function() {
    return this.sender.username; // Assuming User model has a username field
});

// Pre 'save' middleware to handle content sanitization or formatting
MessageSchema.pre('save', function(next) {
    // Example: Replace sensitive content with placeholders
    this.content = this.content.replace(/password|secret|token/gi, '[REDACTED]');
    next();
});

// Post 'save' middleware for logging or updating related models
MessageSchema.post('save', async function(doc, next) {
    console.log('Message saved:', doc._id);
    // Example: Update the ChatRoom's last message
    const ChatRoom = mongoose.model('ChatRoom');
    await ChatRoom.findByIdAndUpdate(doc.chatRoom, { lastMessage: doc._id });
    next();
});

// Static method to fetch messages by room with pagination
MessageSchema.statics.fetchMessagesByRoom = function(chatRoomId, limit = 50, skip = 0) {
    return this.find({ chatRoom: chatRoomId, deleted: false })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('sender', 'username avatar'); // Assuming User model has an avatar field
};

// Instance method to mark a message as edited
MessageSchema.methods.markAsEdited = async function() {
    this.edited = true;
    return await this.save();
};

// Instance method to mark a message as deleted (soft delete)
MessageSchema.methods.markAsDeleted = async function() {
    this.deleted = true;
    return await this.save();
};

const Message = mongoose.model('Message', MessageSchema);

module.exports = Message;