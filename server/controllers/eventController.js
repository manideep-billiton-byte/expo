const pool = require('../db');
const { v4: uuidv4 } = require('uuid');

const getEvents = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
        return res.json(result.rows);
    } catch (dbErr) {
        console.error('Database error in getEvents:', dbErr);
        return res.status(500).json({ error: 'Failed to fetch events', details: dbErr.message });
    }
};

const createEvent = async (req, res) => {
    const payload = req.body || {};
    try {
        // generate QR token and registration link
        const token = uuidv4();
        const base = process.env.REGISTRATION_BASE || 'https://expo.example.com';
        const registration_link = `${base.replace(/\/$/, '')}/register/event/${token}`;

        // Note: 'name' column exists for legacy reasons with NOT NULL constraint
        const eventName = payload.eventName || payload.event_name || 'Untitled Event';

        const insertSql = `INSERT INTO events(
                name, event_name, description, event_type, event_mode, industry,
                organizer_name, contact_person, organizer_email, organizer_mobile,
                venue, city, state, country, start_date, end_date,
                registration, lead_capture, communication, qr_token, registration_link, status,
                enable_stalls, stall_config, stall_types, ground_layout_url
            ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26) RETURNING *`;

        const values = [
            eventName, // for legacy 'name' column (NOT NULL)
            eventName, // for 'event_name' column
            payload.description || null,
            payload.eventType || payload.event_type || null,
            payload.eventMode || payload.event_mode || null,
            payload.industry || null,
            payload.organizerName || payload.organizer_name || null,
            payload.contactPerson || payload.contact_person || null,
            payload.organizerEmail || payload.organizer_email || null,
            payload.organizerMobile || payload.organizer_mobile || null,
            payload.venue || null,
            payload.city || null,
            payload.state || null,
            payload.country || null,
            payload.startDate || payload.start_date || null,
            payload.endDate || payload.end_date || null,
            // JSONB columns - need JSON.stringify
            JSON.stringify(payload.registration || {}),
            JSON.stringify(payload.leadCapture || payload.lead_capture || {}),
            JSON.stringify(payload.communication || {}),
            token,
            registration_link,
            payload.status || 'Draft',
            // New stall configuration fields
            payload.enableStalls || payload.enable_stalls || false,
            JSON.stringify(payload.stallConfig || payload.stall_config || {}),
            JSON.stringify(payload.stallTypes || payload.stall_types || []),
            payload.groundLayoutUrl || payload.ground_layout_url || null
        ];

        const result = await pool.query(insertSql, values);
        const created = result.rows[0];
        console.log('Event created successfully:', created.id);
        return res.status(201).json(created);
    } catch (err) {
        console.error('createEvent error:', err);
        res.status(500).json({
            error: 'Failed to create event',
            details: err.message,
            code: err.code
        });
    }
};

module.exports = { getEvents, createEvent };