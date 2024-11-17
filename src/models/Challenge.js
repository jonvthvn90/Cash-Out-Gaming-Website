const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
    challenger: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A challenger must be specified']
    },
    challengee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'A challengee must be specified']
    },
    game: {
        type: String,
        required: [true, 'A game must be specified for the challenge'],
        trim: true,
        enum: ['chess', 'checkers', 'backgammon', 'poker', 'tic-tac-toe', 'go'] // Assuming a set of supported games
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending',
        index: true // Index for faster status-based queries
    },
    betAmount: {
        type: Number,
        default: 0,
        validate: {
            validator: function(v) {
                return v >= 0 && Number.isInteger(v);
            },
            message: '{VALUE} is not a valid bet amount'
        }
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    result: {
        type: String,
        enum: ['win', 'loss', 'draw'],
        required: function() {
            return this.status === 'completed';
        }
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting by creation time
    }
}, {
    timestamps: true, // Automatically adds updatedAt field
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this challenge
ChallengeSchema.virtual('url').get(function() {
    return `/api/challenges/${this._id}`;
});

// Middleware to handle challenge acceptance
ChallengeSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.status === 'accepted') {
        const challenge = await this.model.findOne(this.getQuery());
        if (challenge && challenge.betAmount > 0) {
            const [challenger, challengee] = await Promise.all([
                mongoose.model('User').findById(challenge.challenger),
                mongoose.model('User').findById(challenge.challengee)
            ]);

            if (!challenger || !challengee || challenger.balance < challenge.betAmount || challengee.balance < challenge.betAmount) {
                throw new Error('Insufficient funds for challenge acceptance or user not found');
            }

            // Hold the bet amount for both challenger and challengee
            challenger.balance -= challenge.betAmount;
            challengee.balance -= challenge.betAmount;
            await Promise.all([challenger.save(), challengee.save()]);
        }
    }
    next();
});

// Middleware to handle challenge completion
ChallengeSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.status === 'completed' && update.$set.winner) {
        const challenge = await this.model.findOne(this.getQuery());
        if (challenge && challenge.betAmount > 0) {
            const winner = await mongoose.model('User').findById(update.$set.winner);
            const loser = await mongoose.model('User').findById(challenge.challenger.equals(update.$set.winner) ? challenge.challengee : challenge.challenger);

            if (winner && loser) {
                // Return the bet amount to the winner and add the loser's bet
                winner.balance += challenge.betAmount * 2;
                // Remove the bet amount from the loser
                loser.balance += challenge.betAmount; // This line assumes the bet was already deducted upon acceptance

                await Promise.all([winner.save(), loser.save()]);
            } else {
                throw new Error('Winner or loser not found');
            }
        }
    }
    next();
});

// Static method to find challenges by user
ChallengeSchema.statics.findByUser = function(userId) {
    return this.find({
        $or: [{ challenger: userId }, { challengee: userId }]
    }).populate('challenger challengee', 'username skillLevel');
};

// Static method to find pending challenges
ChallengeSchema.statics.findPending = function() {
    return this.find({ status: 'pending' })
        .populate('challenger challengee', 'username skillLevel');
};

// Instance method to accept a challenge
ChallengeSchema.methods.accept = async function() {
    if (this.status !== 'pending') {
        throw new Error('Challenge is not in pending state');
    }
    this.status = 'accepted';
    await this.save();
};

// Instance method to reject a challenge
ChallengeSchema.methods.reject = async function() {
    if (this.status !== 'pending') {
        throw new Error('Challenge is not in pending state');
    }
    this.status = 'rejected';
    await this.save();
};

const Challenge = mongoose.model('Challenge', ChallengeSchema);

module.exports = Challenge;