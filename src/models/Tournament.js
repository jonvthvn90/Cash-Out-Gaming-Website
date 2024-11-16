const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TournamentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    game: {
        type: String,
        required: true,
        trim: true
    },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { type: String, enum: ['registered', 'eliminated', 'winner'], default: 'registered' }
    }],
    entryFee: {
        type: Number,
        default: 0
    },
    prizePool: {
        type: Number,
        default: 0
    },
    startDate: {
        type: Date,
        required: true
    },
    endDate: {
        type: Date,
        required: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled'
    },
    bracket: Schema.Types.Mixed, // This could be an array of matches or a tree structure for visualization
    rules: String,
    host: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Tournament', TournamentSchema);