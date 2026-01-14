const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const { pool } = require('../db/database');
const { authenticateToken } = require('../middleware/auth');

// Get all favorite cities for logged-in user
router.get('/', authenticateToken, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, city_name, country_code, created_at FROM favorite_cities WHERE user_id = $1 ORDER BY created_at DESC',
            [req.user.id]
        );

        res.json({ favorites: result.rows });
    } catch (error) {
        console.error('Error fetching favorites:', error);
        res.status(500).json({ error: 'Server error fetching favorites' });
    }
});

// Add a favorite city
router.post('/',
    authenticateToken,
    [
        body('city_name').trim().notEmpty().withMessage('City name is required'),
        body('country_code').optional().trim()
    ],
    async (req, res) => {
        try {
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({ errors: errors.array() });
            }

            const { city_name, country_code } = req.body;

            // Check if already exists
            const existing = await pool.query(
                'SELECT * FROM favorite_cities WHERE user_id = $1 AND city_name = $2',
                [req.user.id, city_name]
            );

            if (existing.rows.length > 0) {
                return res.status(400).json({ error: 'City is already in favorites' });
            }

            // Add to favorites
            const result = await pool.query(
                'INSERT INTO favorite_cities (user_id, city_name, country_code) VALUES ($1, $2, $3) RETURNING id, city_name, country_code, created_at',
                [req.user.id, city_name, country_code || null]
            );

            res.status(201).json({
                message: 'City added to favorites',
                favorite: result.rows[0]
            });

        } catch (error) {
            console.error('Error adding favorite:', error);
            res.status(500).json({ error: 'Server error adding favorite' });
        }
    }
);

// Delete a favorite city
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            'DELETE FROM favorite_cities WHERE id = $1 AND user_id = $2 RETURNING *',
            [id, req.user.id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Favorite not found' });
        }

        res.json({ message: 'Favorite removed successfully' });

    } catch (error) {
        console.error('Error deleting favorite:', error);
        res.status(500).json({ error: 'Server error deleting favorite' });
    }
});

module.exports = router;