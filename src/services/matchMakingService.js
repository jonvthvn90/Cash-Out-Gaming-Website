const User = require('../models/User');
const Match = require('../models/Match');
const { calculateElo } = require('../utils/eloCalculator');

module.exports = {
    /**
     * Matches a user with another user based on skill level and preferences.
     * @param {string} userId - The ID of the user looking for a match.
     * @param {number} skillLevel - Skill level of the user.
     * @param {Object} [preferences={}] - The user's game preferences.
     * @returns {Promise<Match|null>} - The created match or null if no match found.
     */
    async matchUser(userId, skillLevel, preferences = {}) {
        try {
            const potentialOpponents = await User.find({
                isOnline: true,
                _id: { $ne: userId },
                skillLevel: { $gte: skillLevel - 100, $lte: skillLevel + 100 }, // Skill level range for matching
                preferences: { $all: Object.keys(preferences) } // Match all preferences
            }).limit(100); // Limit search to avoid performance issues

            if (potentialOpponents.length === 0) {
                return null; // No match found
            }

            const opponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];

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

    /**
     * Updates the result of a match including Elo calculation.
     * @param {string} matchId - The ID of the match to update.
     * @param {string} winningUserId - The ID of the winning user.
     * @param {string} losingUserId - The ID of the losing user.
     * @returns {Promise<Match>} - The updated match document.
     */
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

            // Calculate new Elo ratings
            const winner = await User.findById(winningUserId);
            const loser = await User.findById(losingUserId);

            const [newWinnerElo, newLoserElo] = calculateElo(winner.skillLevel, loser.skillLevel, true);

            // Update both users' skill levels
            winner.skillLevel = newWinnerElo;
            loser.skillLevel = newLoserElo;

            await Promise.all([match.save(), winner.save(), loser.save()]);

            return match;
        } catch (error) {
            throw new Error("Error updating match result: " + error.message);
        }
    },

    /**
     * Retrieves the match history for a user.
     * @param {string} userId - The ID of the user whose history is to be fetched.
     * @param {number} [limit=10] - The number of matches to return.
     * @param {number} [skip=0] - The number of matches to skip for pagination.
     * @returns {Promise<Match[]>} - An array of Match objects.
     */
    async getMatchHistory(userId, limit = 10, skip = 0) {
        try {
            const matches = await Match.find({
                $or: [
                    { winner: userId },
                    { loser: userId },
                    { players: userId }
                ]
            })
            .populate('winner loser', 'username')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

            return matches;
        } catch (error) {
            throw new Error("Error fetching match history: " + error.message);
        }
    }
};