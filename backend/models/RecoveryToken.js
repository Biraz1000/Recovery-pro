const mongoose = require('mongoose');

// RecoveryToken Schema for password reset, email verification, phone verification, and 2FA setup
const recoveryTokenSchema = new mongoose.Schema({
    userId: { // Reference to the user
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    token: {
        type: String,
        required: true,
        unique: true
    },
    purpose: {
        type: String,
        enum: ['password_reset', 'email_verification', 'phone_verification', '2FA_setup'],
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
        expires: '1h'  // Token expires in 1 hour
    }
});

const RecoveryToken = mongoose.model('RecoveryToken', recoveryTokenSchema);

module.exports = RecoveryToken;