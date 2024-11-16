const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, enum: ['superadmin', 'moderator'], default: 'moderator' },
    permissions: [String],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Admin', AdminSchema);