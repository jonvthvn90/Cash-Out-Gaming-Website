const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatisticSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    totalGames: { type: Number, default: 0 },
    winRate: { type: Number, default: 0 },
    averageBetAmount: { type: Number, default: 0 },
    mostFrequentGame: { type: String },
    totalHoursPlayed: { type: Number, default: 0 },
    longestStreak: { type: Number, default: 0 },
    totalEarnings: { type: Number, default: 0 },
    lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Statistic', StatisticSchema);