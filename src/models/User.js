const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
    },
    password: {
        type: String,
        required: true,
        select: false
    },
    skillLevel: {
        type: Number,
        default: 1000,
        min: 0,
        max: 3000
    },
    matchesPlayed: {
        type: Number,
        default: 0,
        min: 0
    },
    wins: {
        type: Number,
        default: 0,
        min: 0
    },
    losses: {
        type: Number,
        default: 0,
        min: 0
    },
    currentMatch: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        default: null
    },
    lastLogin: {
        type: Date,
        default: Date.now
    },
    lastLogout: {
        type: Date,
        default: null
    },
    isOnline: {
        type: Boolean,
        default: false
    },
    friends: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    achievements: [{
        type: Schema.Types.ObjectId,
        ref: 'Achievement'
    }],
    avatar: {
        type: String,
        default: 'default_avatar.jpg'
    },
    preferences: {
        colorScheme: {
            type: String,
            enum: ['dark', 'light'],
            default: 'dark'
        },
        language: {
            type: String,
            default: 'en'
        },
        notifications: {
            type: Boolean,
            default: true
        }
    }
}, {
    timestamps: true
});

// Pre-save middleware to hash the password before saving
UserSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// Method to check password on login
UserSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Method to update user's skill level after a match
UserSchema.methods.updateSkillLevel = function(result) {
    const K = 30; // K-factor in Elo rating

    if (result === 'win') {
        this.skillLevel = Math.min(3000, this.skillLevel + K);
    } else if (result === 'loss') {
        this.skillLevel = Math.max(0, this.skillLevel - K);
    }
    this.matchesPlayed++;

    if (result === 'win') {
        this.wins++;
    } else if (result === 'loss') {
        this.losses++;
    }

    return this.save();
};

// Static method to find users by some criteria
UserSchema.statics.findByUsername = function(username) {
    return this.findOne({ username: new RegExp(username, 'i') });
};

// Create the model class
const User = mongoose.model('User', UserSchema);

module.exports = User;