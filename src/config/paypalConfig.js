// src/config/paypalConfig.js

// Import required modules
const paypal = require('paypal-rest-sdk');
require('dotenv').config();

// Configuration for PayPal
const paypalConfig = {
    // Use environment variables for sensitive information
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' for dev, 'live' for production
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET,
    // Optional: Set other configuration options if needed
};

// Error checking for required environment variables
const requiredEnvVars = ['PAYPAL_CLIENT_ID', 'PAYPAL_CLIENT_SECRET'];
requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
        console.error(`Required environment variable ${envVar} is not set.`);
        // Optionally throw an error or exit the process if these are critical
        // throw new Error(`Missing environment variable: ${envVar}`);
    }
});

// Initialize PayPal SDK
paypal.configure(paypalConfig);

// Logging successful initialization
console.log(`PayPal SDK initialized in ${paypalConfig.mode} mode.`);

// Export the configuration object
module.exports = paypalConfig;

// Export the PayPal SDK itself for use in other parts of the application
module.exports.paypal = paypal;