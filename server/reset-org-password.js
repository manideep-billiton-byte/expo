/**
 * Reset organization password
 * Usage: node reset-org-password.js <email> <new-password>
 */

require('dotenv').config();
const pool = require('./db');
const bcrypt = require('bcryptjs');

const resetPassword = async (email, newPassword) => {
    try {
        console.log('\n🔐 RESETTING ORGANIZATION PASSWORD\n');
        console.log('Email:', email);
        console.log('New Password:', newPassword);
        console.log('');

        // Check if organization exists
        const checkResult = await pool.query(
            'SELECT id, org_name, primary_email FROM organizations WHERE primary_email = $1',
            [email]
        );

        if (checkResult.rows.length === 0) {
            console.log('❌ Organization not found with email:', email);
            process.exit(1);
        }

        const org = checkResult.rows[0];
        console.log('✅ Organization found:');
        console.log('   ID:', org.id);
        console.log('   Name:', org.org_name);
        console.log('   Email:', org.primary_email);
        console.log('');

        // Hash the new password
        console.log('🔒 Hashing new password...');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('✅ Password hashed');
        console.log('');

        // Update the password
        console.log('💾 Updating password in database...');
        await pool.query(
            'UPDATE organizations SET password_hash = $1, updated_at = NOW() WHERE primary_email = $2',
            [hashedPassword, email]
        );
        console.log('✅ Password updated successfully!');
        console.log('');

        console.log('========================================');
        console.log('✅ PASSWORD RESET COMPLETE!');
        console.log('========================================');
        console.log('');
        console.log('Login Credentials:');
        console.log('  Email:', email);
        console.log('  Password:', newPassword);
        console.log('');
        console.log('Login at: https://d2ux36xl31uki3.cloudfront.net');
        console.log('');

    } catch (error) {
        console.error('❌ Error:', error.message);
        console.error(error.stack);
    } finally {
        await pool.end();
    }
};

// Get command line arguments
const email = process.argv[2];
const newPassword = process.argv[3];

if (!email || !newPassword) {
    console.log('Usage: node reset-org-password.js <email> <new-password>');
    console.log('Example: node reset-org-password.js karnakata@gmail.com NewPassword123');
    process.exit(1);
}

resetPassword(email, newPassword);
