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
        required: [true, 'Bet amount must be 1, 5, or 10']
    },
    predictedWinner: {
        type: String,
        required: [true, 'Predicted winner is required'],
        validate: {
            validator: async function(v) {
                const match = await mongoose.model('Match').findById(this.match);
                return match && (match.player1 === v || match.player2 === v);
            },
            message: props => `${props.value} is not a valid player in the match`
        }
    },
    status: {
        type: String,
        enum: ['pending', 'won', 'lost', 'invalid'],
        default: 'pending'
    },
    // Additional fields for more detailed bet tracking
    odds: {
        type: Number,
        required: [true, 'Odds for the bet are required']
    },
    potentialWinnings: {
        type: Number,
        // Calculate potential winnings based on amount and odds
        default: function() {
            return this.amount * this.odds;
        }
    },
    isSettled: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this bet
betSchema.virtual('url').get(function() {
    return `/api/bets/${this._id}`;
});

// Method to check if the bet is still valid
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
        // Validate predictedWinner if the match exists
        const match = await mongoose.model('Match').findById(this.match);
        if (!match) {
            return next(new Error('Match does not exist'));
        }
    }
    next();
});

// Post-save hook for logging purposes
betSchema.post('save', function(doc, next) {
    console.log(`Bet saved with ID: ${doc._id}`);
    next();
});

// Static method to fetch all bets for a specific match
betSchema.statics.getBetsByMatch = function(matchId) {
    return this.find({ match: matchId })
        .populate('user', 'username') // Populate user's username
        .sort({ createdAt: -1 });
};

// Static method to fetch all bets for a user
betSchema.statics.getBetsByUser = function(userId, status) {
    const query = status ? { user: userId, status } : { user: userId };
    return this.find(query)
        .populate('match', 'player1 player2') // Populate match details
        .sort({ createdAt: -1 });
};

// Method to settle a bet
betSchema.methods.settleBet = async function(result) {
    if (this.isSettled) {
        throw new Error('This bet has already been settled');
    }
    this.isSettled = true;
    this.status = result === this.predictedWinner ? 'won' : 'lost';
    await this.save();
    return this.status === 'won' ? this.potentialWinnings : -this.amount;
};

const Bet = mongoose.model('Bet', betSchema);

module.exports = Bet;