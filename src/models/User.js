const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // Note: Always hash passwords before storing
    skillLevel: { type: Number, default: 1000, min: 0, max: 3000 }, // Elo rating system
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    currentMatch: { type: Schema.Types.ObjectId, ref: 'Match', default: null },
    lastLogin: { type: Date, default: Date.now },
    lastLogout: { type: Date, default: null },
    isOnline: { type: Boolean, default: false },
    friends: [{ type: Schema.Types.ObjectId, ref: 'User' }], // References to other User documents
    achievements: [{ type: Schema.Types.ObjectId, ref: 'Achievement' }], // References to achievements earned by user
    avatar: { type: String, default: 'default_avatar.jpg' }, // URL or path to user's avatar
    preferences: {
        colorScheme: { type: String, default: 'dark' },
        language: { type: String, default: 'en' },
        notifications: { type: Boolean, default: true }
    }
}, {
    timestamps: true // Automatically adds fields for when a document was created and last modified
});

// Pre-save middleware to hash the password before saving it to the database
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    // Assuming you have a utility to hash passwords
    this.password = await hashPassword(this.password);
    next();
});

// Method to check the password on login
UserSchema.methods.comparePassword = function(candidatePassword) {
    return comparePassword(candidatePassword, this.password);
};

// Method to update user's skill level after a match
UserSchema.methods.updateSkillLevel = function(result) {
    // This is a placeholder. You'd implement the Elo rating algorithm here.
    if (result === 'win') {
        this.skillLevel += 30; // Example: Increase by arbitrary amount for win
    } else if (result === 'loss') {
        this.skillLevel -= 30; // Example: Decrease for loss
    }
    // Ensure skillLevel does not exceed limits
    this.skillLevel = Math.min(3000, Math.max(0, this.skillLevel));
};

// Create the model class
const User = mongoose.model('User', UserSchema);

module.exports = User;