const pool = require('./db');

async function checkConnection() {
    try {
        console.log('Testing database connection...');
        const res = await pool.query('SELECT current_database(), inet_server_addr()');
        console.log('✅ Connected successfully!');
        console.log('Database:', res.rows[0].current_database);
        console.log('Server IP:', res.rows[0].inet_server_addr);

        // Also print masking to confirm it's production
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl.includes('prod-db')) {
            console.log('✅ Verified: URL contains "prod-db"');
        } else {
            console.log('⚠️ Warning: URL does not contain "prod-db"');
        }

        process.exit(0);
    } catch (err) {
        console.error('❌ Connection failed:', err.message);
        process.exit(1);
    }
}

checkConnection();
