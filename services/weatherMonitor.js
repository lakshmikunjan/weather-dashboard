const axios = require('axios');
const { pool } = require('../db/database');
const { sendTemperatureAlert } = require('./emailService');

// Check weather for all users with alert preferences
async function checkAllAlerts() {
    console.log('\n--- Starting weather alert check ---');
    console.log('Time:', new Date().toISOString());

    try {
        // Get all alert preferences with user emails
        const query = `
            SELECT 
                ap.id, 
                ap.user_id, 
                ap.city_name, 
                ap.max_temp, 
                ap.min_temp, 
                ap.email_enabled,
                u.email as user_email,
                u.name as user_name
            FROM alert_preferences ap
            JOIN users u ON ap.user_id = u.id
            WHERE ap.email_enabled = true
        `;

        const result = await pool.query(query);
        const alertPreferences = result.rows;

        console.log(`Found ${alertPreferences.length} active alert preferences`);

        if (alertPreferences.length === 0) {
            console.log('No active alerts to check');
            return;
        }

        // Check each alert preference
        for (const pref of alertPreferences) {
            await checkWeatherForCity(pref);
            // Small delay to avoid rate limiting
            await sleep(1000);
        }

        console.log('--- Weather alert check complete ---\n');

    } catch (error) {
        console.error('Error checking alerts:', error);
    }
}

// Check weather for a specific city and send alerts if needed
async function checkWeatherForCity(alertPref) {
    try {
        const { city_name, max_temp, min_temp, user_email, user_name, user_id } = alertPref;

        console.log(`Checking weather for ${city_name} (${user_email})...`);

        // Fetch current weather
        const apiKey = process.env.OPENWEATHER_API_KEY;
        const response = await axios.get(
            `https://api.openweathermap.org/data/2.5/weather?q=${city_name}&appid=${apiKey}&units=imperial`
        );

        const currentTemp = response.data.main.temp;
        console.log(`  Current temperature: ${currentTemp}°F`);

        // Check if temperature exceeds thresholds
        let alertSent = false;

        // Check high temperature
        if (max_temp && currentTemp > max_temp) {
            console.log(`  ⚠️  Temperature exceeds max threshold (${max_temp}°F)`);
            
            // Check if we already sent an alert recently (within last hour)
            const recentAlert = await checkRecentAlert(user_id, city_name, 'high');
            
            if (!recentAlert) {
                const emailSent = await sendTemperatureAlert(
                    user_email,
                    city_name,
                    'high',
                    Math.round(currentTemp),
                    max_temp
                );

                if (emailSent) {
                    await logAlert(user_id, city_name, 'high', currentTemp, max_temp);
                    alertSent = true;
                    console.log(`  ✓ High temperature alert sent`);
                }
            } else {
                console.log(`  ⏭️  Alert already sent recently, skipping`);
            }
        }

        // Check low temperature
        if (min_temp && currentTemp < min_temp) {
            console.log(`  ⚠️  Temperature below min threshold (${min_temp}°F)`);
            
            const recentAlert = await checkRecentAlert(user_id, city_name, 'low');
            
            if (!recentAlert) {
                const emailSent = await sendTemperatureAlert(
                    user_email,
                    city_name,
                    'low',
                    Math.round(currentTemp),
                    min_temp
                );

                if (emailSent) {
                    await logAlert(user_id, city_name, 'low', currentTemp, min_temp);
                    alertSent = true;
                    console.log(`  ✓ Low temperature alert sent`);
                }
            } else {
                console.log(`  ⏭️  Alert already sent recently, skipping`);
            }
        }

        if (!alertSent && (max_temp || min_temp)) {
            console.log(`  ✓ Temperature within normal range`);
        }

    } catch (error) {
        console.error(`  ✗ Error checking weather for ${alertPref.city_name}:`, error.message);
    }
}

// Check if an alert was sent recently (within last hour)
async function checkRecentAlert(userId, cityName, alertType) {
    try {
        const result = await pool.query(
            `SELECT * FROM alert_history 
             WHERE user_id = $1 
             AND city_name = $2 
             AND alert_type = $3 
             AND sent_at > NOW() - INTERVAL '1 hour'
             ORDER BY sent_at DESC 
             LIMIT 1`,
            [userId, cityName, alertType]
        );

        return result.rows.length > 0;
    } catch (error) {
        console.error('Error checking recent alerts:', error);
        return false;
    }
}

// Log sent alert to database
async function logAlert(userId, cityName, alertType, temperature, threshold) {
    try {
        await pool.query(
            `INSERT INTO alert_history (user_id, city_name, alert_type, temperature, threshold) 
             VALUES ($1, $2, $3, $4, $5)`,
            [userId, cityName, alertType, temperature, threshold]
        );
    } catch (error) {
        console.error('Error logging alert:', error);
    }
}

// Utility function for delays
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    checkAllAlerts,
    checkWeatherForCity
};