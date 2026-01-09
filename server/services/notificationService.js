const nodemailer = require('nodemailer');

// Create transporter lazily to avoid startup errors
let transporter = null;

const getTransporter = () => {
    if (!transporter && process.env.SMTP_HOST) {
        transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: parseInt(process.env.SMTP_PORT || '587'),
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS
            },
            logger: true,
            debug: true
        });
    }
    return transporter;
};

// Send email
const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.SMTP_HOST) {
        // Mock sending in development
        console.log('Mock sending email to:', to);
        console.log('Subject:', subject);
        console.log('Text:', text);
        if (html) console.log('HTML content available');
        return { success: true, message: 'Email would be sent in production (SMTP not configured)' };
    }

    try {
        const transport = getTransporter();
        if (!transport) {
            console.error('SMTP transporter not available');
            return { success: false, error: 'SMTP not configured' };
        }

        const info = await transport.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@example.com',
            to,
            subject,
            text,
            html
        });

        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error.message);
        // Return error instead of throwing - prevents server crash
        return { success: false, error: error.message };
    }
};

// Send SMS
const sendSMS = async ({ to, body }) => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        // Mock sending in development
        console.log('Mock sending SMS to:', to);
        console.log('Message:', body);
        return { success: true, message: 'SMS would be sent in production (Twilio not configured)' };
    }

    try {
        const twilio = require('twilio')(
            process.env.TWILIO_ACCOUNT_SID,
            process.env.TWILIO_AUTH_TOKEN
        );

        const message = await twilio.messages.create({
            body,
            from: process.env.TWILIO_FROM,
            to
        });

        console.log('SMS sent:', message.sid);
        return { success: true, sid: message.sid };
    } catch (error) {
        console.error('Error sending SMS:', error.message);
        // Return error instead of throwing - prevents server crash
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendSMS
};
