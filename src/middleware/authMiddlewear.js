const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use environment variables in production

/**
 * Middleware to authenticate requests by validating JWT tokens.
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const authMiddleware = async (req, res, next) => {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
        return res.status(401).send({ message: 'No token, authorization denied' });
    }

    try {
        // Verify token
        const decoded = jwt.verify(token, JWT_SECRET);

        // Find user by id from token
        const user = await User.findById(decoded.userId).select('-password');

        if (!user) {
            return res.status(401).send({ message: 'User not found' });
        }

        // Check if token is still valid in the database (for scenarios where tokens might be revoked)
        if (user.tokens && !user.tokens.includes(token)) {
            return res.status(401).send({ message: 'Token has been revoked' });
        }

        // Attach user to request object
        req.user = user;
        req.token = token; // Attach token for potential use in subsequent middleware
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).send({ message: 'Token expired' });
        }
        console.error('Authentication Error:', error);
        res.status(401).send({ message: 'Token is not valid' });
    }
};

module.exports = authMiddleware;