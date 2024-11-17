const express = require('express');
const router = express.Router();
const paypal = require('paypal-rest-sdk');
const CoinbaseCommerce = require('coinbase-commerce-node');
const axios = require('axios'); // For CashApp Pay API
const User = require('../models/User');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

// PayPal configuration
paypal.configure({
    'mode': process.env.PAYPAL_MODE || 'sandbox', // 'sandbox' or 'live'
    'client_id': process.env.PAYPAL_CLIENT_ID,
    'client_secret': process.env.PAYPAL_CLIENT_SECRET
});

// Coinbase Commerce configuration
CoinbaseCommerce.config({
    apiKey: process.env.COINBASE_API_KEY,
});

// CashApp Pay configuration
const cashAppClientId = process.env.CASHAPP_CLIENT_ID;
const cashAppClientSecret = process.env.CASHAPP_CLIENT_SECRET;

// Route to initiate PayPal payment
router.post('/paypal/pay', async (req, res) => {
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": process.env.PAYPAL_RETURN_URL,
            "cancel_url": process.env.PAYPAL_CANCEL_URL
        },
        "transactions": [{
            "amount": {
                "total": req.body.amount,
                "currency": "USD"
            },
            "description": "Top up user balance."
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            console.error('PayPal Payment Creation Error:', error);
            return res.status(500).json({ message: 'Error creating PayPal payment' });
        }
        for(let i = 0; i < payment.links.length; i++) {
            if(payment.links[i].rel === 'approval_url') {
                return res.json({ approvalURL: payment.links[i].href });
            }
        }
        res.status(500).json({ message: 'No approval URL found' });
    });
});

// Route to execute PayPal payment after approval
router.get('/paypal/execute-payment', async (req, res) => {
    const paymentId = req.query.paymentId;
    const payerId = { payer_id: req.query.PayerID };

    paypal.payment.execute(paymentId, payerId, function (error, payment) {
        if (error) {
            console.error('PayPal Payment Execution Error:', error);
            return res.status(500).json({ message: 'Error executing PayPal payment' });
        }
        const amount = parseFloat(payment.transactions[0].amount.total);
        User.findByIdAndUpdate(req.user._id, { $inc: { balance: amount } }, { new: true })
            .then(updatedUser => res.json({ message: 'Payment successful', balance: updatedUser.balance }))
            .catch(err => res.status(500).json({ message: 'Failed to update user balance', error: err.message }));
    });
});

// Route to create a charge via Coinbase
router.post('/coinbase/charge', async (req, res) => {
    const chargeData = {
        name: 'Top Up Balance',
        description: 'User balance top up',
        local_price: {
            amount: req.body.amount,
            currency: 'USD'
        },
        pricing_type: 'fixed_price'
    };

    try {
        const charge = await CoinbaseCommerce.Charge.create(chargeData);
        res.json({ chargeURL: charge.createPaymentURL() });
    } catch (error) {
        console.error('Coinbase Charge Creation Error:', error);
        res.status(500).json({ message: 'Failed to create charge', error: error.message });
    }
});

// Endpoint to handle webhook for Coinbase payment success
router.post('/coinbase/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
    const event = req.body;
    const charge = JSON.parse(event.toString());
    
    if (charge.type === 'charge:confirmed') {
        const amount = charge.data.pricing.local.amount;
        User.findByIdAndUpdate(req.user._id, { $inc: { balance: amount } }, { new: true })
            .then(updatedUser => console.log('User balance updated:', updatedUser.balance))
            .catch(err => console.error('Failed to update user balance:', err));
    }
    
    res.sendStatus(200);
});

// Route to initiate CashApp Pay payment
router.post('/cashapp/pay', async (req, res) => {
    try {
        const tokenResponse = await axios.post('https://api.cash.app/oauth/token', 
            new URLSearchParams({
                'grant_type': 'client_credentials',
                'client_id': cashAppClientId,
                'client_secret': cashAppClientSecret,
            }), {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });

        if (tokenResponse.status !== 200) {
            throw new Error('Failed to get CashApp token');
        }

        const accessToken = tokenResponse.data.access_token;

        const paymentResponse = await axios.post('https://api.cash.app/v1/payments', {
            "amount": req.body.amount,
            "currency": "USD",
            "description": "Top up user balance",
            "reference_id": req.user._id // Assuming userID is unique for each transaction
        }, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (paymentResponse.status === 201) {
            res.json({ paymentId: paymentResponse.data.id, paymentURL: paymentResponse.data.redirect_url });
        } else {
            res.status(500).json({ message: 'Payment initiation failed with CashApp' });
        }
    } catch (error) {
        console.error('CashApp Payment Error:', error.message);
        res.status(500).json({ message: 'Error with CashApp payment process', error: error.message });
    }
});

// Route to handle CashApp payment confirmation (you would need to implement this with CashApp's webhook or redirect)
router.post('/cashapp/confirm', async (req, res) => {
    // This would depend on how you receive the confirmation from CashApp, possibly via webhook or redirect
    // Here's an example if CashApp sends a POST request with payment details:
    try {
        const { amount, paymentId } = req.body; // Assuming the payload includes these fields
        await User.findByIdAndUpdate(req.user._id, { $inc: { balance: amount } }, { new: true });
        res.sendStatus(200); // Acknowledge receipt
    } catch (error) {
        console.error('CashApp Confirmation Error:', error);
        res.sendStatus(500);
    }
});

// Error handling middleware
router.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = router;