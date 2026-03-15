const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');

const SALT_ROUNDS = 10;

async function register(req, res) {
    try {
        const { email, password, phoneNumber } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User with this email already exists' });
        }

        const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

        const user = new User({
            email,
            passwordHash,
            phoneNumber: phoneNumber || undefined,
            recoveryMethods: [{ method: 'email', identifier: email }],
        });

        await user.save();

        return res.status(201).json({
            message: 'User registered successfully',
            userId: user._id,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function login(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            await new AuditLog({
                userId: user._id,
                ipAddress: req.ip,
                userAgent: req.headers['user-agent'] || 'unknown',
                status: 'FAILED_LOGIN',
                details: 'Invalid password attempt',
            }).save();

            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { userId: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        await new AuditLog({
            userId: user._id,
            ipAddress: req.ip,
            userAgent: req.headers['user-agent'] || 'unknown',
            status: 'LOGIN',
            details: 'Successful login',
        }).save();

        return res.status(200).json({
            message: 'Login successful',
            token,
        });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

async function getProfile(req, res) {
    try {
        const user = await User.findById(req.user.userId).select('-passwordHash -backupCodes');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({ user });
    } catch (err) {
        return res.status(500).json({ message: 'Internal server error' });
    }
}

module.exports = { register, login, getProfile };
