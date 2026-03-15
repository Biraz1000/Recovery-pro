const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        match: /.+\@.+\..+/, // Simple email validation
    },
    passwordHash: {
        type: String,
        required: true,
    },
    phoneNumber: {
        type: String,
        required: false,
        unique: true,
    },
    recoveryMethods: [{
        method: {
            type: String,
            required: true,
        },
        identifier: {
            type: String,
            required: true,
        }
    }],
    twoFactorEnabled: {
        type: Boolean,
        default: false,
    },
    backupCodes: {
        type: [String],
        default: [],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);