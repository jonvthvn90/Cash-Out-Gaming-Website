const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

// Define the schema
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'Please provide a username'],
        unique: true,
        trim: true,
        minlength: [3, 'Username must be at least 3 characters long'],
        maxlength: [32, 'Username must not exceed 32 characters']
    },
    email: {
        type: String,
        required: [true, 'Please provide an email'],
        unique: true,
        lowercase: true,
        match: [/\S+@\S+\.\S+/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: [8, 'Password must be at least 8 characters long'],
        select: false // This ensures the password is not returned when querying documents
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    balance: {
        type: Number,
        default: 0
    },
    role: {
        type: String,
        enum: ['user', 'admin'],
        default: 'user'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    // Add other fields like profile picture, location, etc. as needed
});

// Virtual fields for sensitive data
userSchema.virtual('passwordConfirmation')
    .set(function(passwordConfirmation) {
        this._passwordConfirmation = passwordConfirmation;
    });

// Middleware to hash password before saving
userSchema.pre('save', async function(next) {
    // Only run this function if password was modified
    if (!this.isModified('password')) return next();

    // Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    // Password confirmation validation
    if (this._passwordConfirmation !== this.password) {
        this.invalidate('passwordConfirmation', 'Passwords do not match');
    }

    // Delete password confirmation field
    delete this._passwordConfirmation;
    next();
});

// Method to check if the provided password is correct
userSchema.methods.checkPassword = async function(candidatePassword, userPassword) {
    return await bcrypt.compare(candidatePassword, userPassword);
};

// Generate and hash password reset token
userSchema.methods.createPasswordResetToken = function() {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Token expires in 10 minutes
    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

// Create and export the model
const User = mongoose.model('User', userSchema);

module.exports = User;