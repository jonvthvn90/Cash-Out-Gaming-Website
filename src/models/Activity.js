const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['achievement', 'bet', 'tournament', 'friend', 'follow'],
        required: true
    },
    content: {
        type: String,
        required: true
    },
    relatedObject: { 
        type: Schema.Types.ObjectId,
        refPath: 'type' // This will reference the model based on the type
    }
}, { timestamps: true });

module.exports = mongoose.model('Activity', ActivitySchema);