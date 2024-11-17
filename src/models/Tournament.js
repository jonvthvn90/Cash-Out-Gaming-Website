// Importing the mongoose module
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Defining the schema for tournaments
const TournamentSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 2,
        maxlength: 100
    },
    game: {
        type: String,
        required: true,
        trim: true
    },
    participants: [{
        user: { type: Schema.Types.ObjectId, ref: 'User' },
        status: { 
            type: String, 
            enum: ['registered', 'eliminated', 'winner'], 
            default: 'registered',
            required: true
        }
    }],
    entryFee: {
        type: Number,
        default: 0,
        min: 0
    },
    prizePool: {
        type: Number,
        default: 0,
        min: 0
    },
    startDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v > Date.now();
            },
            message: 'Start date must be in the future'
        }
    },
    endDate: {
        type: Date,
        required: true,
        validate: {
            validator: function(v) {
                return v > this.startDate;
            },
            message: 'End date must be after start date'
        }
    },
    status: {
        type: String,
        enum: ['scheduled', 'in_progress', 'completed', 'cancelled'],
        default: 'scheduled',
        required: true
    },
    bracket: Schema.Types.Mixed, // This could be an array of matches or a tree structure for visualization
    rules: {
        type: String,
        default: ''
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for tournament duration
TournamentSchema.virtual('duration').get(function() {
    return Math.round((this.endDate - this.startDate) / 36e5); // duration in hours
});

// Method to add a participant
TournamentSchema.methods.addParticipant = function(userId) {
    if (this.status === 'scheduled') {
        this.participants.push({ user: userId });
        return this.save();
    }
    throw new Error('Participants can only be added when the tournament is scheduled.');
};

// Method to update participant status
TournamentSchema.methods.updateParticipantStatus = function(userId, newStatus) {
    const participant = this.participants.id(userId);
    if (participant) {
        participant.status = newStatus;
        return this.save();
    }
    throw new Error('Participant not found.');
};

// Static method to get all active tournaments
TournamentSchema.statics.getActiveTournaments = function() {
    return this.find({ status: { $in: ['scheduled', 'in_progress'] } });
};

// Middleware to check if tournament can be started
TournamentSchema.pre('updateOne', function(next) {
    if (this._update.$set && this._update.$set.status === 'in_progress') {
        if (Date.now() < this.startDate) {
            const error = new Error("Tournament cannot start before its start date.");
            return next(error);
        }
    }
    next();
});

// Creating the model
const Tournament = mongoose.model('Tournament', TournamentSchema);

// Exporting the model for use in other parts of the application
module.exports = Tournament;