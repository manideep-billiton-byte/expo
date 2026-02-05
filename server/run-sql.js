const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.PGSSLMODE === 'require' ? { rejectUnauthorized: false } : undefined
});

async function runSql() {
    try {
        console.log('Connecting to database...');
        const client = await pool.connect();
        console.log('Connected successfully.');

        const sqlPath = path.join(__dirname, 'migrations', '002_create_scanned_visitors.sql');
        const sql = fs.readFileSync(sqlPath, 'utf8');

        console.log('Executing SQL from:', sqlPath);
        await client.query(sql);
        console.log('✅ SQL executed successfully!');

        client.release();
        pool.end();
    } catch (err) {
        console.error('❌ Error executing SQL:', err);
        process.exit(1);
    }
}

runSql();
