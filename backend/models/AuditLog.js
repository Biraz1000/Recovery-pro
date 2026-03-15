const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    ipAddress: { type: String, required: true },
    userAgent: { type: String, required: true },
    status: { type: String, enum: ['LOGIN', 'LOGOUT', 'PASSWORD_CHANGE', 'PASSWORD_RESET', 'EMAIL_CHANGE', 'PHONE_CHANGE', '2FA_ENABLED', '2FA_DISABLED', 'BACKUP_CODES_GENERATED', 'EMAIL_VERIFIED', 'PHONE_VERIFIED', 'FAILED_LOGIN', 'SUSPICIOUS_ACTIVITY'], required: true },
    details: { type: String },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now, index: true }
}, { timestamps: true });

AuditLogSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('AuditLog', AuditLogSchema);