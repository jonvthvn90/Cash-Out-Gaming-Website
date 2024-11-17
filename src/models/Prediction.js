const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User ID is required for the prediction']
    },
    match: {
        type: Schema.Types.ObjectId,
        ref: 'Match',
        required: [true, 'Match ID is required for the prediction']
    },
    predictedWinner: {
        type: String,
        enum: ['teamA', 'teamB', 'draw'],
        required: [true, 'A prediction must be made']
    },
    // Additional fields for score prediction
    predictedScore: {
        teamA: { type: Number, default: 0, min: 0 },
        teamB: { type: Number, default: 0, min: 0 }
    },
    points: {
        type: Number,
        default: 0,
        min: 0 // Points should not be negative
    },
    createdAt: {
        type: Date,
        default: Date.now,
        index: true // Index for sorting predictions by creation time
    },
    // Field to track if the prediction has been evaluated
    evaluated: {
        type: Boolean,
        default: false,
        index: true // Index for faster querying of unevaluated predictions
    },
    // Field to store if the prediction was correct
    correct: {
        type: Boolean
    },
}, {
    timestamps: true, // This adds updatedAt field automatically
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this prediction
PredictionSchema.virtual('url').get(function() {
    return `/api/predictions/${this._id}`;
});

// Pre 'save' middleware to validate the prediction against the match (if needed)
PredictionSchema.pre('save', async function(next) {
    if (this.isNew) {
        const Match = mongoose.model('Match');
        const match = await Match.findById(this.match);
        if (!match) {
            throw new Error('Match does not exist');
        }
        if (match.status === 'completed' || match.status === 'cancelled') {
            throw new Error('Cannot make a prediction for a completed or cancelled match');
        }
        next();
    } else {
        next();
    }
});

// Post 'save' middleware for logging or other side effects
PredictionSchema.post('save', function(doc, next) {
    console.log('Prediction saved:', doc._id);
    next();
});

// Static method to find predictions by match
PredictionSchema.statics.findByMatch = function(matchId) {
    return this.find({ match: matchId })
        .populate('user', 'username')
        .sort({ createdAt: 1 }); // Sort by creation time, oldest first
};

// Static method to evaluate predictions
PredictionSchema.statics.evaluate = async function(matchId, result) {
    const predictions = await this.find({ match: matchId, evaluated: false });
    const promises = predictions.map(async prediction => {
        prediction.evaluated = true;
        let awardedPoints = 0;

        if (prediction.predictedWinner === result.winner) {
            awardedPoints += 10; // Example: 10 points for correct winner
            if (prediction.predictedWinner !== 'draw') {
                if (prediction.predictedScore.teamA === result.score.teamA && 
                    prediction.predictedScore.teamB === result.score.teamB) {
                    awardedPoints += 5; // Example: 5 extra points for exact score prediction
                }
            }
        }

        prediction.points = awardedPoints;
        prediction.correct = awardedPoints > 0; // If awarded any points, it's correct
        return prediction.save();
    });

    return Promise.all(promises);
};

// Instance method to check if the prediction is for a future match
PredictionSchema.methods.isForFutureMatch = async function() {
    const Match = mongoose.model('Match');
    const match = await Match.findById(this.match);
    if (!match) {
        return false; // Match doesn't exist, so not for a future event
    }
    return match.startTime > new Date();
};

const Prediction = mongoose.model('Prediction', PredictionSchema);

module.exports = Prediction;