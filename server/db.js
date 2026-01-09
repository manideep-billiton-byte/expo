// Only load dotenv in development (EB sets env vars directly)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
const { Pool } = require('pg');

// Debug: log connection info (redacted password)
if (process.env.DATABASE_URL) {
    console.log('DB: Using DATABASE_URL connection string');
} else {
    console.log('DB: Using individual PG* environment variables');
}

const sslConfig = process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined;

const poolConfig = process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: sslConfig
    }
    : {
        host: process.env.PGHOST,
        port: process.env.PGPORT ? Number(process.env.PGPORT) : 5432,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD ?? '',
        database: process.env.PGDATABASE,
        ssl: sslConfig
    };

const pool = new Pool(poolConfig);

module.exports = pool;
