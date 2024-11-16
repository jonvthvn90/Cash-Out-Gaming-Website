const matchmakingService = require('../services/matchmakingService');

module.exports = {
    async findMatch(req, res) {
        try {
            const { userId, skillLevel } = req.body;
            const match = await matchmakingService.matchUser(userId, skillLevel, req.body.preferences);
            if (match) {
                res.status(200).json({ message: "Match found", match: match });
            } else {
                res.status(404).json({ message: "No match found currently" });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async updateMatchResult(req, res) {
        try {
            const { matchId, userId, result } = req.body;
            const updatedMatch = await matchmakingService.updateMatchResult(matchId, userId, result);
            if (updatedMatch) {
                res.status(200).json({ message: "Match result updated", match: updatedMatch });
            } else {
                res.status(404).json({ message: "Match not found" });
            }
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    },

    async getMatchHistory(req, res) {
        try {
            const { userId } = req.params;
            const matches = await matchmakingService.getMatchHistory(userId);
            res.status(200).json({ matches });
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
};