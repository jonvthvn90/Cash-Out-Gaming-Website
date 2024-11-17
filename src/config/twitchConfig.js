// src/config/twitchConfig.js

// Import the necessary modules from the twitch library
const twitch = require('twitch');
const { StaticAuthProvider } = require('twitch-auth');
const { ApiClient } = require('twitch');

// Load environment variables
require('dotenv').config();

// Twitch API Client ID and Secret should be in your environment variables
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

// Error checking for required environment variables
const missingEnvVars = [];
if (!clientId) missingEnvVars.push('TWITCH_CLIENT_ID');
if (!clientSecret) missingEnvVars.push('TWITCH_CLIENT_SECRET');

if (missingEnvVars.length > 0) {
    throw new Error(`The following Twitch environment variables are missing: ${missingEnvVars.join(', ')}. Please ensure they are set in your .env file.`);
}

// Create an auth provider with the client ID and secret
const authProvider = new StaticAuthProvider(clientId, clientSecret);

// Create the Twitch API client
const twitchClient = new ApiClient({ authProvider });

// Log successful initialization (you might want to remove this from production code)
console.log('Twitch API client initialized successfully.');

// Export the Twitch client and credentials for use in other parts of the application
module.exports = {
    twitchClient,
    clientId,
    clientSecret
};