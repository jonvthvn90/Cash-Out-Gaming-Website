const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AdminSchema = new Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User reference is required for an admin']
    },
    role: {
        type: String,
        enum: ['superadmin', 'moderator'],
        default: 'moderator',
        required: true
    },
    permissions: {
        type: [String],
        validate: {
            validator: function(v) {
                return v && v.length > 0;
            },
            message: 'An admin must have at least one permission!'
        }
    },
    isActive: {
        type: Boolean,
        default: true
    },
    // Use timestamps option for automatic createdAt and updatedAt fields
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual for URL to this admin
AdminSchema.virtual('url').get(function() {
    return `/api/admins/${this._id}`;
});

// Virtual for full admin name from linked User model
AdminSchema.virtual('fullName').get(function() {
    return `${this.user.firstname} ${this.user.lastname}`;
});

// Pre 'save' middleware to populate permissions based on role
AdminSchema.pre('save', function(next) {
    if (this.isModified('role')) {
        const rolePermissions = {
            'superadmin': ['manage_users', 'manage_admins', 'manage_content', 'view_logs'],
            'moderator': ['manage_content', 'ban_users', 'view_reports']
        };
        this.permissions = rolePermissions[this.role] || [];
    }
    next();
});

// Post 'save' middleware for logging or other side effects
AdminSchema.post('save', function(doc, next) {
    console.log('Admin saved', doc);
    next();
});

// Index for faster querying by role and active status
AdminSchema.index({ role: 1, isActive: -1 });

// Static method to find active admins
AdminSchema.statics.getActiveAdmins = function() {
    return this.find({ isActive: true })
        .populate('user', 'firstname lastname email') // Populate with user details
        .sort({ createdAt: -1 });
};

// Static method to find admins by permission
AdminSchema.statics.findByPermission = function(permission) {
    return this.find({ permissions: permission, isActive: true })
        .populate('user', 'firstname lastname email');
};

// Instance method to check if admin has a specific permission
AdminSchema.methods.hasPermission = function(permission) {
    return this.permissions.includes(permission);
};

module.exports = mongoose.model('Admin', AdminSchema);