const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');

// Generate a referral code
function generateReferralCode() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

// Create a referral link
router.post('/generate', async (req, res) => {
    try {
        const referrer = req.user._id;
        const referralCode = generateReferralCode();

        const referral = new Referral({
            referrer: referrer,
            referralCode: referralCode, // This was missing in the original code
            reward: 50, // Example reward amount
            status: 'pending' // Set initial status to pending
        });

        await referral.save();
        res.status(201).json({ referralCode: referralCode, message: 'Referral code generated successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Use a referral link
router.post('/use/:code', async (req, res) => {
    try {
        const { code } = req.params;
        const referral = await Referral.findOne({ referralCode: code, status: 'pending' });

        if (!referral) {
            return res.status(404).json({ message: 'Invalid or already used referral code' });
        }

        referral.referee = req.user._id;
        referral.status = 'approved';

        // Assign rewards
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
        const stats = {
            totalReferrals: referrals.length,
            successfulReferrals: referrals.filter(r => r.status === 'approved').length,
            pendingReferrals: referrals.filter(r => r.status === 'pending').length,
            referrals: referrals.map(r => ({
                code: r.referralCode,
                status: r.status,
                refereeUsername: r.referee ? r.referee.username : 'Pending',
                reward: r.reward
            }))
        };
        res.json(stats);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;