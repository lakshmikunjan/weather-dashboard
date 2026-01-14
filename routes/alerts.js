const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get all alert preferences for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, city_name, max_temp, min_temp, email_enabled, created_at, updated_at FROM alert_preferences WHERE user_id = $1 ORDER BY city_name',
            [req.user.id]
        );

        res.json({ alerts: result.rows });
    } catch (error) {
        console.error('Error fetching alerts:', error);
        res.status(500).json({ error: 'Server error fetching alerts' });
    }
});

// Get alert preferences for a specific city
router.get('/:city', authenticateToken, async (req, res) => {
    try {
        const { city } = req.params;

        const result = await pool.query(
            'SELECT id, city_name, max_temp, min_temp, email_enabled, created_at, updated_at FROM alert_preferences WHERE user_id = $1 AND city_name = $2',
            [req.user.id, city]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'No alert preferences found for this city' });
        }

        res.json({ alert: result.rows[0] });

    } catch (error) {
        console.error('Error fetching alert:', error);
        res.status(500).json({ error: 'Server error fetching alert' });
    }
});

// Set or update alert preferences for a city
router.post('/',
    authenticateToken,
    [
        body('city_name').trim().notEmpty().withMessage('City name is required'),
        body('max_temp').optional().isFloat().withMessage('Max temp must be a number'),
        body('min_temp').optional().isFloat().withMessage('Min temp must be a number'),
        body('email_enabled').optional().isBoolean().withMessage('Email enabled must be true or false')
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { city_name, max_temp, min_temp, email_enabled } = req.body;

            // Check if alert preference already exists
            const existing = await pool.query(
                'SELECT * FROM alert_preferences WHERE user_id = $1 AND city_name = $2',
                [req.user.id, city_name]
            );

            let result;

            if (existing.rows.length > 0) {
                // Update existing
                result = await pool.query(
                    `UPDATE alert_preferences 
                     SET max_temp = $1, min_temp = $2, email_enabled = $3, updated_at = CURRENT_TIMESTAMP 
                     WHERE user_id = $4 AND city_name = $5 
                     RETURNING id, city_name, max_temp, min_temp, email_enabled, created_at, updated_at`,
                    [
                        max_temp || null,
                        min_temp || null,
                        email_enabled !== undefined ? email_enabled : true,
                        req.user.id,
                        city_name
                    ]
                );

                res.json({
                    message: 'Alert preferences updated',
                    alert: result.rows[0]
                });
            } else {
                // Insert new
                result = await pool.query(
                    `INSERT INTO alert_preferences (user_id, city_name, max_temp, min_temp, email_enabled) 
                     VALUES ($1, $2, $3, $4, $5) 
                     RETURNING id, city_name, max_temp, min_temp, email_enabled, created_at, updated_at`,
                    [
                        req.user.id,
                        city_name,
                        max_temp || null,
                        min_temp || null,
                        email_enabled !== undefined ? email_enabled : true
                    ]
                );

                res.status(201).json({
                    message: 'Alert preferences created',
                    alert: result.rows[0]
                });
            }

        } catch (error) {
            console.error('Error setting alert:', error);
            res.status(500).json({ error: 'Server error setting alert' });
        }
    }
);

// Delete alert preferences for a city
router.delete('/:city', authenticateToken, async (req, res) => {
    try {
        const { city } = req.params;

        const result = await pool.query(
            'DELETE FROM alert_preferences WHERE user_id = $1 AND city_name = $2 RETURNING *',
            [req.user.id, city]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Alert preferences not found' });
        }

        res.json({ message: 'Alert preferences deleted successfully' });

    } catch (error) {
        console.error('Error deleting alert:', error);
        res.status(500).json({ error: 'Server error deleting alert' });
    }
});

module.exports = router;