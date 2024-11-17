const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for the leaderboard, which will be populated from User data
const LeaderboardSchema = new Schema({
    user: { 
        type: Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    username: String,
    points: {
        type: Number,
        default: 0,
        min: 0 // Points should not be negative
    },
    wins: {
        type: Number,
        default: 0,
        min: 0 // Wins should not be negative
    },
    reputation: {
        type: Number,
        default: 0,
        min: 0 // Reputation should not be negative
    },
    tournamentsWon: {
        type: Number,
        default: 0,
        min: 0 // Tournaments won should not be negative
    },
    rank: {
        type: Number,
        default: 0,
        min: 0 // Rank should start at 0 or 1 depending on your ranking system
    }
}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this user in the leaderboard
LeaderboardSchema.virtual('url').get(function() {
    return `/api/leaderboard/${this.user}`;
});

// Static method to generate the leaderboard from User data
LeaderboardSchema.statics.generateLeaderboard = async function(options = {}) {
    const { limit = 10, offset = 0, sortBy = 'points', sortOrder = -1 } = options;
    const sortOptions = { [sortBy]: sortOrder };

    return mongoose.model('User').aggregate([
        {
            $project: {
                _id: 1,
                username: 1,
                points: 1,
                wins: 1,
                reputation: 1,
                tournamentsWon: 1
            }
        },
        { $sort: sortOptions },
        { $skip: offset },
        { $limit: limit },
        {
            $addFields: {
                rank: { $add: [{ $indexOfArray: ["$all_ranks", "$_id"] }, 1] }
            }
        }
    ]).exec();
};

// Static method to get a user's position in the leaderboard
LeaderboardSchema.statics.getUserPosition = async function(userId) {
    const userStats = await mongoose.model('User').findById(userId, 'points wins reputation tournamentsWon').lean();
    
    if (!userStats) {
        throw new Error('User not found');
    }

    return mongoose.model('User').aggregate([
        {
            $project: {
                _id: 1,
                points: 1,
                wins: 1,
                reputation: 1,
                tournamentsWon: 1
            }
        },
        { 
            $match: {
                $or: [
                    { points: { $gt: userStats.points } },
                    { 
                        points: userStats.points,
                        $or: [
                            { wins: { $gt: userStats.wins } },
                            { 
                                wins: userStats.wins,
                                $or: [
                                    { reputation: { $gt: userStats.reputation } },
                                    { 
                                        reputation: userStats.reputation,
                                        tournamentsWon: { $gt: userStats.tournamentsWon } 
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        { $count: "aboveUsers" }
    ]).exec().then(result => {
        if (result.length > 0) {
            return result[0].aboveUsers + 1; // +1 because array indices start at 0
        } else {
            return 1; // If no users are above, the user is in first place
        }
    });
};

module.exports = mongoose.model('Leaderboard', LeaderboardSchema);