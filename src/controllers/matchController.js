const matchmakingService = require('../services/matchmakingService');

/**
 * Controller for handling matchmaking operations.
 * @module MatchmakingController
 */

module.exports = {
    /**
     * Attempts to find a match for a user based on their skill level and preferences.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async findMatch(req, res) {
        try {
            const { userId, skillLevel, preferences } = req.body;
            if (!userId || !skillLevel) {
                throw new Error("userId and skillLevel are required");
            }
            const match = await matchmakingService.matchUser(userId, skillLevel, preferences);
            if (match) {
                res.status(200).json({ 
                    message: "Match found", 
                    match: match 
                });
            } else {
                res.status(404).json({ 
                    message: "No match found currently" 
                });
            }
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    },

    /**
     * Updates the result of a match for a specific user.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async updateMatchResult(req, res) {
        try {
            const { matchId, userId, result } = req.body;
            if (!matchId || !userId || !result) {
                throw new Error("matchId, userId, and result are required");
            }
            const updatedMatch = await matchmakingService.updateMatchResult(matchId, userId, result);
            if (updatedMatch) {
                res.status(200).json({ 
                    message: "Match result updated", 
                    match: updatedMatch 
                });
            } else {
                res.status(404).json({ 
                    message: "Match not found or could not be updated" 
                });
            }
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    },

    /**
     * Retrieves the match history for a user.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async getMatchHistory(req, res) {
        try {
            const { userId } = req.params;
            if (!userId) {
                throw new Error("userId parameter is required");
            }
            const matches = await matchmakingService.getMatchHistory(userId);
            res.status(200).json({ 
                matches 
            });
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    },

    /**
     * Cancels a matchmaking session for a user.
     * @param {Object} req - Express request object
     * @param {Object} res - Express response object
     * @returns {Promise<void>}
     */
    async cancelMatchmaking(req, res) {
        try {
            const { userId } = req.body;
            if (!userId) {
                throw new Error("userId is required");
            }
            const result = await matchmakingService.cancelMatchmaking(userId);
            if (result) {
                res.status(200).json({ 
                    message: "Matchmaking session canceled" 
                });
            } else {
                res.status(400).json({ 
                    message: "Failed to cancel matchmaking session or user not found in matchmaking" 
                });
            }
        } catch (error) {
            res.status(400).json({ 
                message: error.message 
            });
        }
    }
};