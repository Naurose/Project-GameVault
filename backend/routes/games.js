const express = require('express');
const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../../.env') });

const router = express.Router();

// Create DB pool
const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'gamevault'
});

// Get All Games (with filtering)
router.get('/', async (req, res) => {
    const { genre, search, max_price } = req.query;
    let query = 'SELECT * FROM games WHERE 1=1';
    const params = [];

    if (genre) {
        query += ' AND genre LIKE ?';
        params.push(`%${genre}%`);
    }

    if (search) {
        query += ' AND title LIKE ?';
        params.push(`%${search}%`);
    }

    if (max_price) {
        query += ' AND price <= ?';
        params.push(max_price);
    }

    try {
        const [games] = await pool.query(query, params);
        res.json(games);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Single Game
router.get('/:id', async (req, res) => {
    try {
        const [games] = await pool.query('SELECT * FROM games WHERE game_id = ?', [req.params.id]);
        if (games.length === 0) {
            return res.status(404).json({ message: 'Game not found' });
        }
        res.json(games[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

// Search Route (Specific endpoint optional, but handled by root GET)
router.get('/search/query', async (req, res) => {
    const { q } = req.query;
    try {
        const [games] = await pool.query('SELECT * FROM games WHERE title LIKE ?', [`%${q}%`]);
        res.json(games);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
