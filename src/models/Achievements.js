const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AchievementSchema = new Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    criteria: { type: Schema.Types.Mixed, required: true }, // Can be an object with different conditions
    icon: { type: String } // URL to the achievement icon
}, { timestamps: true });

module.exports = mongoose.model('Achievement', AchievementSchema);