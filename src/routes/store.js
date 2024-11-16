const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

// Fetch all available products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ available: true });
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Purchase a product
router.post('/purchase/:productId', async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product || !product.available || (product.stock !== -1 && product.stock <= 0)) {
            return res.status(400).json({ message: 'Product not available or out of stock' });
        }

        const user = await User.findById(req.user._id);
        if (user.balance < product.price) {
            return res.status(400).json({ message: 'Insufficient funds to purchase this item' });
        }

        // If stock is limited, decrement it
        if (product.stock !== -1) {
            product.stock -= 1;
            await product.save();
        }

        user.balance -= product.price;
        const purchase = new Purchase({
            user: user._id,
            product: product._id,
            priceAtPurchase: product.price
        });

        await Promise.all([user.save(), purchase.save()]);

        res.status(201).json({ message: 'Purchase successful', purchase });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User's purchase history
router.get('/history', async (req, res) => {
    try {
        const purchases = await Purchase.find({ user: req.user._id }).populate('product', 'name price');
        res.json({ purchases });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;