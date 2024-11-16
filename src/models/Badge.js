const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BadgeSchema = new Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    conditions: { type: Schema.Types.Mixed, required: true },
    icon: { type: String, required: true } // URL to the badge icon
}, { timestamps: true });

module.exports = mongoose.model('Badge', BadgeSchema);