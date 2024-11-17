// Importing the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the schema for statistics
const StatisticSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    totalGames: {
        type: Number,
        default: 0
    },
    winRate: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
    },
    averageBetAmount: {
        type: Number,
        default: 0,
        min: 0
    },
    mostFrequentGame: {
        type: String
    },
    totalHoursPlayed: {
        type: Number,
        default: 0,
        min: 0
    },
    longestStreak: {
        type: Number,
        default: 0,
        min: 0
    },
    totalEarnings: {
        type: Number,
        default: 0
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
},
{
    // Adds createdAt and updatedAt timestamps to documents
    timestamps: true,
    // Includes virtual attributes when converting the document to JSON
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Method to update statistics
StatisticSchema.methods.updateStats = function(newStats) {
    // Assuming newStats object contains all necessary fields for update
    this.totalGames = newStats.totalGames || this.totalGames;
    this.winRate = Math.min(100, Math.max(0, newStats.winRate)) || this.winRate;
    this.averageBetAmount = Math.max(0, newStats.averageBetAmount) || this.averageBetAmount;
    this.mostFrequentGame = newStats.mostFrequentGame || this.mostFrequentGame;
    this.totalHoursPlayed = Math.max(0, newStats.totalHoursPlayed) || this.totalHoursPlayed;
    this.longestStreak = Math.max(0, newStats.longestStreak) || this.longestStreak;
    this.totalEarnings = newStats.totalEarnings || this.totalEarnings;
    this.lastUpdated = Date.now();
    return this.save();
};

// Static method to find or create user statistics
StatisticSchema.statics.findOrCreate = async function(userId) {
    let stats = await this.findOne({ user: userId });
    if (!stats) {
        stats = new this({ user: userId });
        await stats.save();
    }
    return stats;
};

// Virtual for formatting winRate as percentage
StatisticSchema.virtual('winRatePercent').get(function() {
    return this.winRate.toFixed(2) + "%";
});

// Creating the model
const Statistic = mongoose.model('Statistic', StatisticSchema);

// Exporting the model for use in other parts of the application
module.exports = Statistic;