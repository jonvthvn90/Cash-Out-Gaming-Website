const User = require('../models/User');
const Match = require('../models/Match');
const { calculateElo } = require('../utils/eloCalculator'); // Assuming you have an Elo calculator utility

module.exports = {
    async matchUser(userId, skillLevel, preferences = {}) {
        try {
            // Find other users that are looking for a match and match the criteria
            const potentialOpponents = await User.find({
                isOnline: true,
                _id: { $ne: userId },
                skillLevel: { $gte: skillLevel - 100, $lte: skillLevel + 100 } // Example range for matching skill
            }).where('preferences').in(Object.keys(preferences));

            if (potentialOpponents.length === 0) {
                return null; // No match found
            }

            // Randomly select an opponent from those available
            const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];

            // Create a new match
            const newMatch = new Match({
                players: [userId, opponent._id],
                status: 'active'
            });

            await newMatch.save();

            return newMatch;
        } catch (error) {
            throw new Error("Error in matching user: " + error.message);
        }
    },

    async updateMatchResult(matchId, winningUserId, losingUserId) {
        try {
            const match = await Match.findById(matchId);
            if (!match) {
                throw new Error("Match not found");
            }

            // Update match status and result
            match.status = 'completed';
            match.winner = winningUserId;
            match.loser = losingUserId;

            // Update Elo for both players
            await match.save();

            // Calculate new Elo ratings
            const winner = await User.findById(winningUserId);
            const loser = await User.findById(losingUserId);

            const [newWinnerElo, newLoserElo] = calculateElo(winner.skillLevel, loser.skillLevel, true);

            // Update both users' skill levels
            winner.skillLevel = newWinnerElo;
            loser.skillLevel = newLoserElo;

            await winner.save();
            await loser.save();

            return match;
        } catch (error) {
            throw new Error("Error updating match result: " + error.message);
        }
    },

    async getMatchHistory(userId) {
        try {
            // Fetch all matches where the user was involved, either as winner or loser
            const matches = await Match.find({
                $or: [
                    { winner: userId },
                    { loser: userId },
                    { players: userId } // For ongoing or matches where the user played but didn't win or lose yet
                ]
            }).sort({ createdAt: -1 }); // Sort by most recent

            // Optionally you can populate with user information if needed
            // .populate('winner loser', 'username skillLevel')

            return matches;
        } catch (error) {
            throw new Error("Error fetching match history: " + error.message);
        }
    }
};