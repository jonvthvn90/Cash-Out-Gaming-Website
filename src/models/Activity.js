const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ActivitySchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required for an activity']
    },
    type: {
        type: String,
        enum: ['achievement', 'bet', 'tournament', 'friend', 'follow'],
        required: [true, 'Activity type must be specified']
    },
    content: {
        type: String,
        required: [true, 'Content of the activity must be provided']
    },
    relatedObject: { 
        type: Schema.Types.ObjectId,
        required: function() {
            // 'friend' and 'follow' activities do not need a relatedObject
            return ['achievement', 'bet', 'tournament'].includes(this.type);
        },
        refPath: 'type' // This will reference the model based on the 'type'
    },
    metadata: {
        type: Schema.Types.Mixed // For any additional data that might be needed
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this activity
ActivitySchema.virtual('url').get(function() {
    return `/api/activities/${this._id}`;
});

// Pre 'save' middleware for additional validation or data manipulation
ActivitySchema.pre('save', async function(next) {
    // Example: If the type is 'achievement', ensure the content does not exceed a certain length
    if (this.type === 'achievement' && this.content.length > 150) {
        this.content = this.content.substr(0, 150) + '...';
    }
    next();
});

// Post 'save' middleware for logging or other side effects
ActivitySchema.post('save', function(doc, next) {
    console.log('Activity saved', doc);
    next();
});

// Index for faster querying
ActivitySchema.index({ user: 1, type: 1, createdAt: -1 });

// Static method to fetch activities by user
ActivitySchema.statics.findByUser = function(userId, limit = 20) {
    return this.find({ user: userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate('user', 'username') // Populate with username from the User model
        .populate('relatedObject'); // Populate relatedObject based on the type
};

// Instance method to format the activity for frontend display
ActivitySchema.methods.formatForDisplay = function() {
    let activityText = this.content;
    switch (this.type) {
        case 'achievement':
            activityText = `Earned achievement: ${this.content}`;
            break;
        case 'bet':
            activityText = `Placed a bet: ${this.content}`;
            break;
        case 'tournament':
            activityText = `Joined a tournament: ${this.content}`;
            break;
        case 'friend':
            activityText = this.content.includes('added') ? 
                `${this.content.split(' ')[0]} added you as a friend` : 
                `You added ${this.content.split(' ')[2]} as a friend`;
            break;
        case 'follow':
            activityText = this.content.includes('started') ? 
                `${this.content.split(' ')[0]} started following you` : 
                `You started following ${this.content.split(' ')[2]}`;
            break;
    }
    return {
        id: this._id,
        type: this.type,
        text: activityText,
        timestamp: this.createdAt.toISOString(),
        relatedObjectId: this.relatedObject ? this.relatedObject._id : null,
        relatedObjectType: this.type
    };
};

module.exports = mongoose.model('Activity', ActivitySchema);