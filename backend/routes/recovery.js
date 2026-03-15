const express = require('express');
const router = express.Router();
const {
    requestPasswordReset,
    resetPassword,
    requestEmailVerification,
    verifyEmail,
    changePassword,
} = require('../controllers/recoveryController');
const { authenticateToken } = require('../middleware/auth');

// Public routes (no auth required)
router.post('/password-reset/request', requestPasswordReset);
router.post('/password-reset/confirm', resetPassword);
router.post('/email/verify', verifyEmail);

// Protected routes (auth required)
router.post('/email/request-verification', authenticateToken, requestEmailVerification);
router.post('/change-password', authenticateToken, changePassword);

module.exports = router;
