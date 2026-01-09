const pool = require('../db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { sendEmail, sendSMS } = require('../services/notificationService');

console.log('Loaded visitorController');

// Helper function to generate unique code
const generateUniqueCode = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Removed ambiguous characters
    let code = 'VIS-';
    for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

const getVisitors = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                v.id,
                v.event_id,
                v.first_name,
                v.last_name,
                v.email,
                v.mobile,
                v.gender,
                v.age_group,
                v.organization,
                v.designation,
                v.visitor_category,
                v.valid_dates,
                v.communication,
                v.created_at,
                v.updated_at,
                ev.event_name
            FROM visitors v
            LEFT JOIN events ev ON ev.id = v.event_id
            ORDER BY v.created_at DESC
        `);
        return res.json(result.rows);
    } catch (dbErr) {
        console.error('Database error in getVisitors:', dbErr);
        return res.status(500).json({ error: 'Failed to fetch visitors', details: dbErr.message });
    }
};

const createVisitor = async (req, res) => {
    const p = req.body || {};
    console.log('createVisitor received body:', JSON.stringify(p, null, 2));
    try {
        const email = p.email || null;
        const password = p.password || null;

        let defaultPassword = null;
        let passwordHash = null;
        if (password) {
            passwordHash = bcrypt.hashSync(password, 10);
        } else if (email) {
            defaultPassword = `${email.split('@')[0]}@123`;
            passwordHash = bcrypt.hashSync(defaultPassword, 10);
        }

        // Generate unique code
        let uniqueCode;
        let codeExists = true;
        let attempts = 0;

        // Ensure unique code doesn't already exist
        while (codeExists && attempts < 10) {
            uniqueCode = generateUniqueCode();
            const checkResult = await pool.query('SELECT id FROM visitors WHERE unique_code = $1', [uniqueCode]);
            codeExists = checkResult.rows.length > 0;
            attempts++;
        }

        if (codeExists) {
            throw new Error('Failed to generate unique code after multiple attempts');
        }

        const insertSql = `INSERT INTO visitors(
            first_name, last_name, email, mobile, gender, age_group, organization, designation,
            password_hash, unique_code,
            event_id, visitor_category, valid_dates, communication
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`;

        const values = [
            p.firstName || p.first_name || null,
            p.lastName || p.last_name || null,
            email,
            p.mobile || null,
            p.gender || null,
            p.age || p.age_group || null,
            p.organization || null,
            p.designation || null,
            passwordHash,
            uniqueCode,
            p.eventId || p.event_id || null,
            p.visitorCategory || p.visitor_category || null,
            p.validDates || p.valid_dates || null,
            p.communication || {}
        ];

        const result = await pool.query(insertSql, values);
        console.log('Visitor created successfully:', result.rows[0].id, 'with unique code:', uniqueCode);

        const response = {
            success: true,
            visitor: result.rows[0],
            uniqueCode: uniqueCode
        };
        if (defaultPassword) {
            response.credentials = {
                email,
                password: defaultPassword,
                note: 'Please save these credentials. Password can be changed after first login.'
            };
        }

        // Send registration confirmation email
        if (email) {
            try {
                const emailResult = await sendEmail({
                    to: email,
                    subject: 'Welcome! Your Visitor Registration is Confirmed',
                    text: `Dear ${p.firstName || 'Visitor'},\n\nYour registration has been confirmed!\n\nYour Unique Code: ${uniqueCode}\n\nPlease keep this code safe - you will need it for event check-in.\n\n${defaultPassword ? `Your login credentials:\nEmail: ${email}\nPassword: ${defaultPassword}\n\n` : ''}Thank you for registering!\n\nBest regards,\nEvent Team`,
                    html: `
                        <h2>Welcome! Your Visitor Registration is Confirmed</h2>
                        <p>Dear ${p.firstName || 'Visitor'},</p>
                        <p>Your registration has been confirmed!</p>
                        <p><strong>Your Unique Code: ${uniqueCode}</strong></p>
                        <p>Please keep this code safe - you will need it for event check-in.</p>
                        ${defaultPassword ? `<p><strong>Login Credentials:</strong><br>Email: ${email}<br>Password: ${defaultPassword}</p>` : ''}
                        <p>Thank you for registering!</p>
                        <p>Best regards,<br>Event Team</p>
                    `
                });

                if (emailResult && emailResult.success) {
                    console.log('Visitor confirmation email sent to:', email);
                } else {
                    console.error('Failed to send visitor email:', emailResult ? emailResult.error : 'Unknown error');
                }
            } catch (emailErr) {
                console.error('Failed to send visitor email:', emailErr.message);
            }
        }

        // Send SMS if mobile provided and SMS enabled
        if (p.mobile && p.communication?.sms) {
            try {
                const smsResult = await sendSMS({
                    to: p.mobile,
                    body: `Your visitor registration is confirmed! Unique Code: ${uniqueCode}. Use this code for event check-in.`
                });

                if (smsResult && smsResult.success) {
                    console.log('Visitor confirmation SMS sent to:', p.mobile);
                } else {
                    console.error('Failed to send visitor SMS:', smsResult ? smsResult.error : 'Unknown error');
                }
            } catch (smsErr) {
                console.error('Failed to send visitor SMS:', smsErr.message);
            }
        }

        return res.status(201).json(response);
    } catch (err) {
        console.error('createVisitor error:', err);
        res.status(500).json({
            error: 'Failed to create visitor',
            details: err.message,
            code: err.code
        });
    }
};

const loginVisitor = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            'SELECT id, first_name, last_name, email, password_hash FROM visitors WHERE email = $1',
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const visitor = result.rows[0];

        if (!visitor.password_hash) {
            return res.status(401).json({ error: 'No password set for this visitor. Please contact administrator.' });
        }

        const isValid = bcrypt.compareSync(password, visitor.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.json({
            success: true,
            userType: 'visitor',
            user: {
                id: visitor.id,
                name: `${visitor.first_name} ${visitor.last_name}`.trim(),
                email: visitor.email
            }
        });
    } catch (err) {
        console.error('Error during visitor login:', err);
        return res.status(500).json({ error: 'Failed to authenticate visitor', details: err.message });
    }
};

// Get visitor by unique code (for QR scanning)
const getVisitorByCode = async (req, res) => {
    const { uniqueCode } = req.params;

    if (!uniqueCode) {
        return res.status(400).json({ error: 'Unique code is required' });
    }

    try {
        const result = await pool.query(`
            SELECT
                v.id,
                v.first_name,
                v.last_name,
                v.email,
                v.mobile,
                v.gender,
                v.age_group,
                v.organization,
                v.designation,
                v.visitor_category,
                v.event_id,
                v.unique_code,
                v.created_at,
                ev.event_name
            FROM visitors v
            LEFT JOIN events ev ON ev.id = v.event_id
            WHERE v.unique_code = $1
        `, [uniqueCode]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Visitor not found', message: 'Invalid QR code' });
        }

        return res.json({
            success: true,
            visitor: result.rows[0]
        });
    } catch (err) {
        console.error('Error fetching visitor by code:', err);
        return res.status(500).json({ error: 'Failed to fetch visitor', details: err.message });
    }
};

module.exports = { getVisitors, createVisitor, loginVisitor, getVisitorByCode };
