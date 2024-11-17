const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
    name: {
        type: String,
        required: [true, 'A chat room name is required'],
        unique: true,
        trim: true,
        index: true
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    lastMessage: {
        type: Schema.Types.ObjectId,
        ref: 'Message'
    },
    isPrivate: {
        type: Boolean,
        default: false
    },
    admin: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Assuming you might want to store metadata about the room
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this chat room
ChatRoomSchema.virtual('url').get(function() {
    return `/api/chatrooms/${this._id}`;
});

// Virtual to get the count of participants
ChatRoomSchema.virtual('participantCount').get(function() {
    return this.participants.length;
});

// Pre-save hook to manage admin assignment
ChatRoomSchema.pre('save', function(next) {
    if (this.isNew && !this.admin && this.participants.length > 0) {
        // If no admin is set, assign the first participant as admin by default
        this.admin = this.participants[0];
    }
    next();
});

// Post 'save' middleware for logging or other side effects
ChatRoomSchema.post('save', function(doc, next) {
    console.log('Chat room saved:', doc.name);
    next();
});

// Static method to find chat rooms by participant
ChatRoomSchema.statics.findByParticipant = function(userId) {
    return this.find({ participants: userId })
        .populate('participants', 'username')
        .populate('lastMessage', 'content sender');
};

// Static method to create a private chat room between two users
ChatRoomSchema.statics.createPrivateRoom = async function(user1, user2) {
    if (user1.equals(user2)) throw new Error('Cannot create a chat room with oneself');

    // Check if a room already exists between these two users
    const existingRoom = await this.findOne({
        participants: { $all: [user1, user2] },
        isPrivate: true
    });

    if (existingRoom) {
        return existingRoom;
    }

    // If no room exists, create one
    const roomName = [user1.toString(), user2.toString()].sort().join('_');
    const newRoom = new this({
        name: `Private_${roomName}`,
        participants: [user1, user2],
        isPrivate: true
    });

    return await newRoom.save();
};

// Instance method to add a participant to the room
ChatRoomSchema.methods.addParticipant = async function(userId) {
    if (!this.participants.includes(userId)) {
        this.participants.push(userId);
        await this.save();
        return true;
    }
    return false;
};

// Instance method to remove a participant from the room
ChatRoomSchema.methods.removeParticipant = async function(userId) {
    const index = this.participants.indexOf(userId);
    if (index !== -1) {
        this.participants.splice(index, 1);
        await this.save();
        return true;
    }
    return false;
};

const ChatRoom = mongoose.model('ChatRoom', ChatRoomSchema);

module.exports = ChatRoom;