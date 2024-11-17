const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Match title is required'],
        trim: true,
        index: true
    },
    streamId: {
        type: String,
        unique: true,
        required: [true, 'Twitch stream ID is required for the match'],
        index: true
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed', 'cancelled'],
        default: 'scheduled',
        index: true // Index for faster status-based queries
    },
    participants: [{
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Participants are required']
    }],
    startTime: {
        type: Date,
        required: [true, 'Start time for the match is required'],
        index: true // Index for sorting and querying by start time
    },
    endTime: {
        type: Date,
        index: true // Index for sorting by end time
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    // Additional fields for more match details
    game: {
        type: String,
        required: [true, 'Game name is required']
    },
    bettingOpen: {
        type: Boolean,
        default: true
    },
    bettingDeadline: {
        type: Date,
        default: function() {
            return new Date(this.startTime.getTime() - 10 * 60000); // 10 minutes before match start
        }
    }
}, {
    timestamps: true, // This adds createdAt and updatedAt fields to the document
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this match
matchSchema.virtual('url').get(function() {
    return `/api/matches/${this._id}`;
});

// Method to check if betting is open
matchSchema.methods.isBettingOpen = function() {
    return this.bettingOpen && Date.now() <= this.bettingDeadline;
};

// Method to check if the match is currently live
matchSchema.methods.isLive = function() {
    return this.status === 'live' && Date.now() >= this.startTime && (!this.endTime || Date.now() <= this.endTime);
};

// Pre 'save' middleware to manage match status
matchSchema.pre('save', async function(next) {
    if (this.isModified('status')) {
        if (this.status === 'completed' && !this.winner) {
            throw new Error('A winner must be specified for a completed match');
        }
        if (this.status === 'cancelled') {
            this.winner = undefined; // Clear winner if match is cancelled
        }
    }

    if (!this.isNew && this.status === 'live') {
        // If setting to live, ensure start time has passed
        if (Date.now() < this.startTime) {
            throw new Error('Cannot set match to live before start time');
        }
    }

    // Automatically close betting if start time has passed
    if (Date.now() > this.startTime) {
        this.bettingOpen = false;
    }

    next();
});

// Post 'save' middleware for logging or other side effects
matchSchema.post('save', function(doc, next) {
    console.log('Match updated or created with ID:', doc._id);
    next();
});

// Static method to find matches by status
matchSchema.statics.findByStatus = function(status) {
    return this.find({ status })
        .sort({ startTime: 1 }) // Sort by start time
        .populate('participants', 'username skillLevel');
};

// Static method to find upcoming matches
matchSchema.statics.upcomingMatches = function() {
    return this.find({
        status: 'scheduled',
        startTime: { $gt: new Date() }
    }).sort({ startTime: 1 });
};

// Instance method to update match status
matchSchema.methods.updateStatus = async function(newStatus) {
    this.status = newStatus;
    if (newStatus === 'live') {
        this.startTime = new Date(); // If going live now, set start time to now
    } else if (newStatus === 'completed') {
        this.endTime = new Date();
        this.bettingOpen = false;
    }
    return await this.save();
};

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;