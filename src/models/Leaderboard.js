const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LeaderboardSchema = new Schema({
    // This schema is not intended to be saved directly, but rather to define a structure
    // for the leaderboard data we'll query from the User model.
    user: { type: Schema.Types.ObjectId, ref: 'User' },
    points: Number,
    wins: Number,
    reputation: Number,
    tournamentsWon: Number
}, { timestamps: false });

module.exports = LeaderboardSchema;