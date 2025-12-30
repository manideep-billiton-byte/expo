const pool = require('../db');
const bcrypt = require('bcryptjs');

console.log('Loaded visitorController');

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

        const insertSql = `INSERT INTO visitors(
            first_name, last_name, email, mobile, gender, age_group, organization, designation,
            password_hash,
            event_id, visitor_category, valid_dates, communication
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`;

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
            p.eventId || p.event_id || null,
            p.visitorCategory || p.visitor_category || null,
            p.validDates || p.valid_dates || null,
            p.communication || {}
        ];

        const result = await pool.query(insertSql, values);
        console.log('Visitor created successfully:', result.rows[0].id);

        const response = {
            success: true,
            visitor: result.rows[0]
        };
        if (defaultPassword) {
            response.credentials = {
                email,
                password: defaultPassword,
                note: 'Please save these credentials. Password can be changed after first login.'
            };
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

module.exports = { getVisitors, createVisitor, loginVisitor };
