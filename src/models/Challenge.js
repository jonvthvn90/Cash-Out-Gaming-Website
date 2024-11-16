const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ChallengeSchema = new Schema({
    challenger: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challengee: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    game: {
        type: String,
        required: true,
        trim: true
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'completed'],
        default: 'pending'
    },
    betAmount: {
        type: Number,
        default: 0,
        validate: {
            validator: Number.isInteger,
            message: '{VALUE} is not an integer value'
        }
    },
    winner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to handle challenge acceptance
ChallengeSchema.pre('findOneAndUpdate', async function(next) {
    const update = this.getUpdate();
    if (update.$set && update.$set.status === 'accepted') {
        // Assuming you want to transfer betAmount to a hold or escrow
        const challenge = await this.model.findOne(this.getQuery());
        if (challenge && challenge.betAmount > 0) {
            const challenger = await User.findById(challenge.challenger);
            const challengee = await User.findById(challenge.challengee);

            if (challenger.balance < challenge.betAmount || challengee.balance < challenge.betAmount) {
                throw new Error('Insufficient funds for challenge acceptance');
            }

            // Here you would implement logic to hold the bet amount until the match is concluded
            // For simplicity, let's assume we just have the logic to check if funds are available
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
            const winner = await User.findById(update.$set.winner);
            const loser = await User.findById(challenge.challenger._id === update.$set.winner ? challenge.challengee : challenge.challenger);

            // Transfer bet amount from the loser to the winner
            winner.balance += challenge.betAmount * 2; // Winner gets back their bet plus the loser's
            loser.balance -= challenge.betAmount;

            // Update balances
            await Promise.all([winner.save(), loser.save()]);
        }
    }
    next();
});

module.exports = mongoose.model('Challenge', ChallengeSchema);