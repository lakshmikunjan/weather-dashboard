const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();
const { testConnection, initializeDatabase } = require('./db/database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/api/weather/current/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=imperial`
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching current weather:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch weather data',
            message: error.response?.data?.message || 'City not found'
        });
    }
});

app.get('/api/weather/forecast/:city', async (req, res) => {
    try {
        const { city } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=imperial`
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching forecast:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch forecast data',
            message: error.response?.data?.message || 'City not found'
        });
    }
});
// API endpoint to get weather by coordinates
app.get('/api/weather/coordinates/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching weather by coordinates:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch weather data',
            message: error.response?.data?.message || 'Location not found'
        });
    }
});

// API endpoint to get forecast by coordinates
app.get('/api/weather/forecast-coordinates/:lat/:lon', async (req, res) => {
    try {
        const { lat, lon } = req.params;
        const apiKey = process.env.OPENWEATHER_API_KEY;
        
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=imperial`
        );
        
        res.json(response.data);
    } catch (error) {
        console.error('Error fetching forecast by coordinates:', error.message);
        res.status(error.response?.status || 500).json({ 
            error: 'Failed to fetch forecast data',
            message: error.response?.data?.message || 'Location not found'
        });
    }
});

// Initialize database and start server
async function startServer() {
    try {
        // Test database connection
        const dbConnected = await testConnection();
        if (!dbConnected) {
            throw new Error('Could not connect to database');
        }
        
        // Initialize database tables
        await initializeDatabase();
        
        // Start server
        app.listen(PORT, () => {
            console.log(`✓ Server running on http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();