const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const { pool } = require('../db/database');
const { hashPassword, comparePassword } = require('../utils/password');
const { authenticateToken } = require('../middleware/auth');

// Register new user
router.post('/register',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('name').optional().trim()
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password, name } = req.body;

            // Check if user already exists
            const existingUser = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (existingUser.rows.length > 0) {
                return res.status(400).json({ error: 'User already exists with this email' });
            }

            // Hash password
            const hashedPassword = await hashPassword(password);

            // Insert new user
            const result = await pool.query(
                'INSERT INTO users (email, password, name) VALUES ($1, $2, $3) RETURNING id, email, name, created_at',
                [email, hashedPassword, name || null]
            );

            const user = result.rows[0];

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    created_at: user.created_at
                }
            });

        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error during registration' });
        }
    }
);

// Login user
router.post('/login',
    [
        body('email').isEmail().withMessage('Invalid email address'),
        body('password').exists().withMessage('Password is required')
    ],
    async (req, res) => {
        try {
            // Validate input
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { email, password } = req.body;

            // Find user
            const result = await pool.query(
                'SELECT * FROM users WHERE email = $1',
                [email]
            );

            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            const user = result.rows[0];

            // Check password
            const isValidPassword = await comparePassword(password, user.password);
            if (!isValidPassword) {
                return res.status(401).json({ error: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                { id: user.id, email: user.email },
                process.env.JWT_SECRET,
                { expiresIn: '7d' }
            );

            res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    created_at: user.created_at
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error during login' });
        }
    }
);

// Get current user profile (protected route)
router.get('/me', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, email, name, created_at FROM users WHERE id = $1',
            [req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ user: result.rows[0] });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ error: 'Server error fetching profile' });
    }
});

module.exports = router;