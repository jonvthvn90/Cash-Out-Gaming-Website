// src/config/twitchConfig.js
const twitch = require('twitch');
const { StaticAuthProvider } = require('twitch-auth');
const { ApiClient } = require('twitch');

// Load environment variables
require('dotenv').config();

// Twitch API Client ID and Secret should be in your environment variables
const clientId = process.env.TWITCH_CLIENT_ID;
const clientSecret = process.env.TWITCH_CLIENT_SECRET;

if (!clientId || !clientSecret) {
    throw new Error('TWITCH_CLIENT_ID or TWITCH_CLIENT_SECRET is missing in .env');
}

// Create an auth provider
const authProvider = new StaticAuthProvider(clientId, clientSecret);

// Create the Twitch API client
const twitchClient = new ApiClient({ authProvider });

module.exports = {
    twitchClient,
    clientId,
    clientSecret
};