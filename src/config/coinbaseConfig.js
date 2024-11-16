// src/config/coinbaseConfig.js
const CoinbaseCommerce = require('coinbase-commerce-node');

// Configuration for Coinbase Commerce
const coinbaseConfig = {
  apiKey: process.env.COINBASE_API_KEY,
  // Other configurations can be added here if needed by the Coinbase API
};

// Initialize Coinbase Commerce SDK
CoinbaseCommerce.config(coinbaseConfig);

// Export the configuration object, even though we've already configured Coinbase with it
// This could be useful if you need to access these configs elsewhere in your app
module.exports = coinbaseConfig;

// If you need to export the Coinbase Commerce SDK itself:
module.exports.coinbaseCommerce = CoinbaseCommerce;