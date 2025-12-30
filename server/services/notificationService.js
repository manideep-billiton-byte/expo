const nodemailer = require('nodemailer');

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Send email
const sendEmail = async ({ to, subject, text, html }) => {
    if (!process.env.SMTP_HOST) {
        // Mock sending in development
        console.log('Mock sending email to:', to);
        console.log('Subject:', subject);
        console.log('Text:', text);
        if (html) console.log('HTML content available');
        return { success: true, message: 'Email would be sent in production' };
    }

    try {
        const info = await transporter.sendMail({
            from: process.env.SMTP_FROM || 'no-reply@example.com',
            to,
            subject,
            text,
            html
        });
        
        console.log('Email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

// Send SMS
const sendSMS = async ({ to, body }) => {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
        // Mock sending in development
        console.log('Mock sending SMS to:', to);
        console.log('Message:', body);
        return { success: true, message: 'SMS would be sent in production' };
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
        console.error('Error sending SMS:', error);
        throw new Error('Failed to send SMS');
    }
};

module.exports = {
    sendEmail,
    sendSMS
};
