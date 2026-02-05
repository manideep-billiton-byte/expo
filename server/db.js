const { Pool } = require('pg');
require('dotenv').config();

/*
 * ============================================================================
 * DATABASE CONFIGURATION
 * ============================================================================
 * 
 * Uses DATABASE_URL environment variable for connection.
 * This allows different databases for staging vs production.
 * 
 * ============================================================================
 */

// Get database URL from environment
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL environment variable is not set!');
    console.log('Please set DATABASE_URL in your environment or .env file');
    process.exit(1);
}

// Determine environment
const nodeEnv = process.env.NODE_ENV || 'development';

// Configure the pool
const dbConfig = {
    connectionString: databaseUrl,
    ssl: nodeEnv === 'production' || nodeEnv === 'staging'
        ? { rejectUnauthorized: false }
        : false
};

console.log(`DB: Connected to ${nodeEnv.toUpperCase()} database`);
console.log(`DB: Host: ${databaseUrl.includes('prod') ? 'PRODUCTION' : nodeEnv.toUpperCase()}`);

const pool = new Pool(dbConfig);

module.exports = pool;
