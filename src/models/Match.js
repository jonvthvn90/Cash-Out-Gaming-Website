const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const matchSchema = new Schema({
    title: {
        type: String,
        required: [true, 'Match title is required'],
        trim: true
    },
    streamId: {
        type: String,
        unique: true,
        required: [true, 'Twitch stream ID is required for the match']
    },
    status: {
        type: String,
        enum: ['scheduled', 'live', 'completed'],
        default: 'scheduled'
    },
    participants: [{
        type: String,
        required: [true, 'Participants are required']
    }],
    startTime: {
        type: Date,
        required: [true, 'Start time for the match is required']
    },
    endTime: {
        type: Date
    },
    winner: {
        type: String
    }
}, {
    timestamps: true // This adds createdAt and updatedAt fields to the document
});

// Define some virtual fields or methods here if needed
// For example, you might want to add a method to check if betting is open
matchSchema.methods.isBettingOpen = function() {
    return this.status === 'live' || (this.status === 'scheduled' && Date.now() <= this.startTime);
};

const Match = mongoose.model('Match', matchSchema);

module.exports = Match;