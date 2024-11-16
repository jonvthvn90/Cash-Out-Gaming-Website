const express = require('express');
const router = express.Router();
const Referral = require('../models/Referral');
const User = require('../models/User');

// Generate referral code for a user
router.post('/code', async (req, res) => {
    try {
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Generate a unique referral code
        const referralCode = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        const referral = new Referral({ referrer: user._id, referralCode });
        await referral.save();

        res.json({ referralCode });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Use referral code
router.post('/use', async (req, res) => {
    try {
        const { code } = req.body;
        const referral = await Referral.findOne({ referralCode: code, used: false });
        if (!referral) {
            return res.status(404).json({ message: 'Invalid or already used referral code' });
        }

        // Assuming you want to give some points or credits to both users
        const bonus = 100; // 100 points or credits for example

        // Update referee's account with bonus
        const referee = await User.findById(req.user._id);
        referee.points += bonus;
        await referee.save();

        // Update referrer's account with bonus
        const referrer = await User.findById(referral.referrer);
        referrer.points += bonus;
        await referrer.save();

        // Mark the referral as used
        referral.referee = referee._id;
        referral.used = true;
        await referral.save();

        res.json({ message: 'Referral code successfully used', bonus });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;