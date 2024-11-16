const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const PredictionSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    match: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
    predictedWinner: { type: String, enum: ['teamA', 'teamB', 'draw'], required: true },
    points: { type: Number, default: 0 }, // Points awarded if the prediction is correct
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Prediction', PredictionSchema);