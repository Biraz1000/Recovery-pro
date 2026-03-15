const crypto = require('crypto');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const RecoveryToken = require('../models/RecoveryToken');
const AuditLog = require('../models/AuditLog');

const SALT_ROUNDS = 10;

async function requestPasswordReset(req, res) {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'Email is required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            // Return success even if user not found to prevent email enumeration
            return res.status(200).json({ message: 'If the email exists, a reset link has been sent' });
        }

        // Remove any existing password reset tokens for this user
        await RecoveryToken.deleteMany({ userId: user._id, purpose: 'password_reset' });

        const token = crypto.randomBytes(32).toString('hex');

        await new RecoveryToken({
            userId: user._id,
            token,
            purpose: 'password_reset',
        }).save();

        // In production, send this token via email using nodemailer
        // For now, return the token in development mode
        const response = { message: 'If the email exists, a reset link has been sent' };
        if (process.env.NODE_ENV === 'development') {
            response.token = token;
        }

        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function resetPassword(req, res) {
    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ message: 'Token and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Password must be at least 8 characters long' });
        }

        const recoveryToken = await RecoveryToken.findOne({
            token,
            purpose: 'password_reset',
        });

        if (!recoveryToken) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

        await User.findByIdAndUpdate(recoveryToken.userId, { passwordHash });

        await RecoveryToken.deleteOne({ _id: recoveryToken._id });

        await new AuditLog({
            userId: recoveryToken.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            status: 'PASSWORD_RESET',
            details: 'Password reset via recovery token',
        }).save();

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function requestEmailVerification(req, res) {
    try {
        const userId = req.user.userId;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Remove any existing email verification tokens for this user
        await RecoveryToken.deleteMany({ userId: user._id, purpose: 'email_verification' });

        const token = crypto.randomBytes(32).toString('hex');

        await new RecoveryToken({
            userId: user._id,
            token,
            purpose: 'email_verification',
        }).save();

        // In production, send this token via email
        const response = { message: 'Verification email has been sent' };
        if (process.env.NODE_ENV === 'development') {
            response.token = token;
        }

        return res.status(200).json(response);
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function verifyEmail(req, res) {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: 'Verification token is required' });
        }

        const recoveryToken = await RecoveryToken.findOne({
            token,
            purpose: 'email_verification',
        });

        if (!recoveryToken) {
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        await RecoveryToken.deleteOne({ _id: recoveryToken._id });

        await new AuditLog({
            userId: recoveryToken.userId,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            status: 'EMAIL_VERIFIED',
            details: 'Email verified via token',
        }).save();

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function changePassword(req, res) {
    try {
        const userId = req.user.userId;
        const { currentPassword, newPassword } = req.body;

        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: 'Current password and new password are required' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'New password must be at least 8 characters long' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
        user.passwordHash = passwordHash;
        await user.save();

        await new AuditLog({
            userId: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            status: 'PASSWORD_CHANGE',
            details: 'Password changed by user',
        }).save();

        return res.status(200).json({ message: 'Password changed successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = {
    requestPasswordReset,
    resetPassword,
    requestEmailVerification,
    verifyEmail,
    changePassword,
};
