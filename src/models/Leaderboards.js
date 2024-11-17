const mongoose = require('mongoose');

const LeaderboardSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for leaderboard entry']
    },
    game: {
        type: String,
        required: [true, 'Game name is required for leaderboard entry'],
        enum: ['chess', 'checkers', 'backgammon', 'poker', 'tic-tac-toe', 'go'] // Assuming these are the supported games
    },
    wins: {
        type: Number,
        default: 0,
        min: [0, 'Wins cannot be negative']
    },
    losses: {
        type: Number,
        default: 0,
        min: [0, 'Losses cannot be negative']
    },
    points: {
        type: Number,
        default: 0,
        min: [0, 'Points cannot be negative']
    },
    // Additional fields for more comprehensive leaderboard tracking
    draws: {
        type: Number,
        default: 0,
        min: [0, 'Draws cannot be negative']
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    },
    rank: {
        type: Number,
        // This will be populated dynamically in queries
    }
}, {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this leaderboard entry
LeaderboardSchema.virtual('url').get(function() {
    return `/api/leaderboard/${this.game}/${this.user}`;
});

// Virtual for win percentage
LeaderboardSchema.virtual('winPercentage').get(function() {
    if (this.wins + this.losses + this.draws === 0) {
        return 0;
    }
    return ((this.wins * 100) / (this.wins + this.losses + this.draws)).toFixed(2);
});

// Virtual for total games played
LeaderboardSchema.virtual('totalGames').get(function() {
    return this.wins + this.losses + this.draws;
});

// Pre 'save' middleware to update lastUpdated
LeaderboardSchema.pre('save', function(next) {
    this.lastUpdated = new Date();
    next();
});

// Static method to find top players for a specific game
LeaderboardSchema.statics.topPlayers = function(game, limit = 10) {
    return this.find({ game })
        .sort({ points: -1, wins: -1, losses: 1 }) // Sort by points, then wins, then losses
        .limit(limit)
        .populate('user', 'username profilePic') // Populate user data
        .exec();
};

// Static method to update user stats on the leaderboard
LeaderboardSchema.statics.updateUserStats = async function(userId, game, win = false, loss = false, draw = false) {
    const leaderboardEntry = await this.findOne({ user: userId, game });
    
    if (!leaderboardEntry) {
        // If the user does not exist in the leaderboard for this game, create a new entry
        return this.create({
            user: userId,
            game,
            wins: win ? 1 : 0,
            losses: loss ? 1 : 0,
            draws: draw ? 1 : 0,
            points: win ? 10 : (draw ? 5 : 0) // Points for win, less for draw, none for loss (example scoring)
        });
    } else {
        // Update existing entry
        if (win) leaderboardEntry.wins += 1;
        if (loss) leaderboardEntry.losses += 1;
        if (draw) leaderboardEntry.draws += 1;
        leaderboardEntry.points += win ? 10 : (draw ? 5 : 0); // Example scoring
        return leaderboardEntry.save();
    }
};

// Post 'save' middleware for logging
LeaderboardSchema.post('save', function(doc, next) {
    console.log('Leaderboard entry saved:', doc._id);
    next();
});

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);