const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // For development
    ssl: false
});

// Initialize database tables
async function initializeDatabase() {
    try {
        // Read and execute schema
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schema = fs.readFileSync(schemaPath, 'utf8');
        
        await pool.query(schema);
        console.log('✓ Database tables initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    }
}

// Test database connection
async function testConnection() {
    try {
        const result = await pool.query('SELECT NOW()');
        console.log('✓ Database connected successfully at:', result.rows[0].now);
        return true;
    } catch (error) {
        console.error('✗ Database connection failed:', error.message);
        return false;
    }
}

module.exports = {
    pool,
    initializeDatabase,
    testConnection
};