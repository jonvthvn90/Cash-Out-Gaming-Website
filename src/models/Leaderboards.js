const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    game: { type: String, required: true },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    points: { type: Number, default: 0 },
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);