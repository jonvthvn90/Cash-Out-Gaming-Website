// src/config/paypalConfig.js
const paypal = require('paypal-rest-sdk');

// Configuration for PayPal
const paypalConfig = {
    mode: process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' for dev, 'live' for production
    client_id: process.env.PAYPAL_CLIENT_ID,
    client_secret: process.env.PAYPAL_CLIENT_SECRET
};

// Initialize PayPal SDK
paypal.configure(paypalConfig);

// Export the configuration object, even though we've already configured paypal with it
// This could be useful if you need to access these configs elsewhere in your app
module.exports = paypalConfig;

// If you need to export the PayPal SDK itself:
module.exports.paypal = paypal;