const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const betSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for the bet']
    },
    match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: [true, 'Match ID is required for the bet']
    },
    amount: {
        type: Number,
        enum: [1, 5, 10],
        required: [true, 'Bet amount is required']
    },
    predictedWinner: {
        type: String,
        required: [true, 'Predicted winner is required']
    },
    status: {
        type: String,
        enum: ['pending', 'won', 'lost'],
        default: 'pending'
    }
}, {
    timestamps: true // This adds createdAt and updatedAt fields to the document
});

// Virtuals or methods for the Bet model
// For example, a method to check if the bet is still valid
betSchema.methods.isValid = async function() {
    const match = await mongoose.model('Match').findById(this.match);
    if (!match || !match.isBettingOpen()) {
        this.status = 'invalid';
        await this.save();
        return false;
    }
    return true;
};

// Pre-save hook to validate if the match is still open for betting
betSchema.pre('save', async function(next) {
    if (this.isNew) {
        const isValid = await this.isValid();
        if (!isValid) {
            return next(new Error('Betting is not open for this match or match does not exist'));
        }
    }
    next();
});

const Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;