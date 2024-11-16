const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');

// Create a referral link
router.post('/generate', async (req, res) => {
    try {
        // Assuming you want to generate a unique code for each referral
        const referrer = req.user._id;
        const referralCode = generateReferralCode(); // You need to implement this function

        const referral = new Referral({
            referrer: referrer,
            reward: 50 // Example reward amount
        });

        await referral.save();
        res.status(201).json({ referralCode: referralCode, message: 'Referral code generated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Function to generate a referral code (needs to be implemented)
function generateReferralCode() {
    // Implement logic to create a unique code
    return 'RANDOMCODE';
}

// Use a referral link
router.post('/use/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const referral = await Referral.findOne({ referralCode: code, status: 'pending' });

        if (!referral) {
            return res.status(404).json({ message: 'Invalid or already used referral code' });
        }

        // Assuming the referee is the currently logged in user
        referral.referee = req.user._id;
        referral.status = 'approved';

        // Assign rewards (implement reward logic)
        await assignReferralRewards(referral);

        await referral.save();
        res.json({ message: 'Referral successfully used', referral });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

async function assignReferralRewards(referral) {
    const referrer = await User.findById(referral.referrer);
    const referee = await User.findById(referral.referee);

    if (referrer && referee) {
        referrer.balance += referral.reward / 2; // Example: split reward between referrer and referee
        referee.balance += referral.reward / 2;
        await Promise.all([referrer.save(), referee.save()]);
    }
}

// Get referral stats for a user
router.get('/stats', async (req, res) => {
    try {
        const referrals = await Referral.find({ referrer: req.user._id }).populate('referee', 'username');
        res.json({ 
            totalReferrals: referrals.length,
            successfulReferrals: referrals.filter(r => r.status === 'approved').length,
            referrals
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;