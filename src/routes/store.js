const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Purchase = require('../models/Purchase');
const User = require('../models/User');

// Middleware to verify user is authenticated
const authenticateUser = (req, res, next) => {
    if (!req.user || !req.user._id) {
        return res.status(401).json({ message: 'Authentication required' });
    }
    next();
};

// Fetch all available products
router.get('/', async (req, res) => {
    try {
        const products = await Product.find({ available: true }).select('name description price stock');
        res.json({ products });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Purchase a product
router.post('/purchase/:productId', authenticateUser, async (req, res) => {
    try {
        const product = await Product.findById(req.params.productId);
        if (!product || !product.available || (product.stock !== -1 && product.stock <= 0)) {
            return res.status(400).json({ message: 'Product not available or out of stock' });
        }

        const user = await User.findById(req.user._id);
        if (user.balance < product.price) {
            return res.status(400).json({ message: 'Insufficient funds to purchase this item' });
        }

        // Check if the product has limited stock
        if (product.stock > 0) {
            product.stock -= 1;
            await product.save();
        }

        // Deduct price from user's balance
        user.balance -= product.price;
        await user.save();

        // Create purchase record
        const purchase = new Purchase({
            user: user._id,
            product: product._id,
            priceAtPurchase: product.price,
            purchaseDate: Date.now()
        });
        
        await purchase.save();

        res.status(201).json({ 
            message: 'Purchase successful', 
            purchase: {
                _id: purchase._id,
                product: purchase.product,
                price: purchase.priceAtPurchase,
                purchaseDate: purchase.purchaseDate
            }
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// User's purchase history
router.get('/history', authenticateUser, async (req, res) => {
    try {
        const purchases = await Purchase.find({ user: req.user._id })
            .populate('product', 'name price')
            .sort({ purchaseDate: -1 }) // Sort by most recent first
            .select('product priceAtPurchase purchaseDate');
        
        res.json({ purchases });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;