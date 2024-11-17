// src/config/coinbaseConfig.js

// Assuming you have installed the 'coinbase-commerce-node' package
const CoinbaseCommerce = require('coinbase-commerce-node');

// Load environment variables from a .env file if it exists
require('dotenv').config();

// Configuration for Coinbase Commerce
const coinbaseConfig = {
  // Using environment variable for the API key, set it in your .env file
  apiKey: process.env.COINBASE_API_KEY,
  // Other configurations can be added here if needed by the Coinbase API
};

// Initialize Coinbase Commerce SDK
CoinbaseCommerce.config(coinbaseConfig);

// Export the configuration object, even though we've already configured Coinbase with it
// This could be useful if you need to access these configs elsewhere in your app
module.exports = coinbaseConfig;

// If you need to export the Coinbase Commerce SDK itself:
module.exports.CoinbaseCommerce = CoinbaseCommerce;

// Optional: Error handling for missing API key
if (!coinbaseConfig.apiKey) {
  console.error('Coinbase Commerce API Key is not set. Please check your environment variables.');
  // You might want to throw an error or exit the application here if this is critical for your setup
  // throw new Error('Missing Coinbase API Key');
}

// Optional: Logging successful initialization
console.log('Coinbase Commerce has been initialized with API key:', coinbaseConfig.apiKey.substring(0, 6) + '...');