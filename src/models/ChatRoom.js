const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChatRoomSchema = new Schema({
    name: { type: String, required: true, unique: true },
    participants: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    lastMessage: { type: Schema.Types.ObjectId, ref: 'Message' },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ChatRoom', ChatRoomSchema);