const pool = require('../db');
const bcrypt = require('bcryptjs');

console.log('Loaded exhibitorController');

const getExhibitors = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                e.id,
                e.organization_id,
                e.event_id,
                e.company_name,
                e.gst_number,
                e.address,
                e.industry,
                e.logo_url,
                e.contact_person,
                e.email,
                e.mobile,
                e.stall_number,
                e.stall_category,
                e.access_status,
                e.lead_capture,
                e.communication,
                e.created_at,
                e.updated_at,
                ev.event_name
            FROM exhibitors e
            LEFT JOIN events ev ON ev.id = e.event_id
            ORDER BY e.created_at DESC
        `);
        return res.json(result.rows);
    } catch (dbErr) {
        console.error('Database error in getExhibitors:', dbErr);
        return res.status(500).json({ error: 'Failed to fetch exhibitors', details: dbErr.message });
    }
};

const createExhibitor = async (req, res) => {
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

        const insertSql = `INSERT INTO exhibitors(
            company_name, gst_number, address, industry, contact_person, email, mobile,
            password_hash,
            event_id, stall_number, stall_category, access_status, lead_capture, communication
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING *`;

        const values = [
            p.companyName || p.company_name || null,
            p.gstNumber || p.gst_number || null,
            p.address || null,
            p.industry || null,
            p.contactPerson || p.contact_person || null,
            email,
            p.mobile || null,
            passwordHash,
            p.eventId || null,
            p.stallNumber || p.stall_number || null,
            p.stallCategory || p.stall_category || null,
            p.accessStatus || p.access_status || 'Active',
            p.leadCapture || {},
            p.communication || {}
        ];

        const result = await pool.query(insertSql, values);
        console.log('Exhibitor created successfully:', result.rows[0].id);

        const response = {
            success: true,
            exhibitor: result.rows[0]
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
        console.error('createExhibitor error:', err);
        res.status(500).json({
            error: 'Failed to create exhibitor',
            details: err.message,
            code: err.code
        });
    }
};

const loginExhibitor = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
        const result = await pool.query(
            `SELECT id, company_name, email, password_hash, access_status
             FROM exhibitors
             WHERE email = $1 AND (access_status IS NULL OR access_status = 'Active')`,
            [email]
        );

        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const exhibitor = result.rows[0];
        if (!exhibitor.password_hash) {
            return res.status(401).json({ error: 'No password set for this exhibitor. Please contact administrator.' });
        }

        const isValid = bcrypt.compareSync(password, exhibitor.password_hash);
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        return res.json({
            success: true,
            userType: 'exhibitor',
            user: {
                id: exhibitor.id,
                name: exhibitor.company_name,
                email: exhibitor.email
            }
        });
    } catch (err) {
        console.error('Error during exhibitor login:', err);
        return res.status(500).json({ error: 'Failed to authenticate exhibitor', details: err.message });
    }
};

module.exports = { getExhibitors, createExhibitor, loginExhibitor };
