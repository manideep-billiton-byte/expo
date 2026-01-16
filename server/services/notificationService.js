const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { SNSClient, PublishCommand } = require('@aws-sdk/client-sns');

// Create AWS SES client lazily
let sesClient = null;

const getSESClient = () => {
    if (!sesClient && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        sesClient = new SESClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return sesClient;
};

// Create AWS SNS client lazily
let snsClient = null;

const getSNSClient = () => {
    if (!snsClient && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        snsClient = new SNSClient({
            region: process.env.AWS_REGION || 'ap-south-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
            }
        });
    }
    return snsClient;
};

// Send email using AWS SES
const sendEmail = async ({ to, subject, text, html }) => {
    const client = getSESClient();

    if (!client) {
        // Mock sending in development / when AWS not configured
        console.log('Mock sending email to:', to);
        console.log('Subject:', subject);
        console.log('Text:', text);
        if (html) console.log('HTML content available');
        return { success: true, message: 'Email would be sent in production (AWS SES not configured)' };
    }

    try {
        const fromEmail = process.env.SES_FROM_EMAIL || 'no-reply@example.com';

        const params = {
            Source: fromEmail,
            Destination: {
                ToAddresses: [to]
            },
            Message: {
                Subject: {
                    Data: subject,
                    Charset: 'UTF-8'
                },
                Body: {}
            }
        };

        // Add text body if provided
        if (text) {
            params.Message.Body.Text = {
                Data: text,
                Charset: 'UTF-8'
            };
        }

        // Add HTML body if provided
        if (html) {
            params.Message.Body.Html = {
                Data: html,
                Charset: 'UTF-8'
            };
        }

        const command = new SendEmailCommand(params);
        const response = await client.send(command);

        console.log('Email sent via AWS SES:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending email via AWS SES:', error.message);
        // Return error instead of throwing - prevents server crash
        return { success: false, error: error.message };
    }
};

// Send SMS using AWS SNS
const sendSMS = async ({ to, body }) => {
    const client = getSNSClient();

    if (!client) {
        // Mock sending in development / when AWS not configured
        console.log('Mock sending SMS to:', to);
        console.log('Message:', body);
        return { success: true, message: 'SMS would be sent in production (AWS SNS not configured)' };
    }

    try {
        // Format phone number for SNS (must include country code with +)
        let phoneNumber = to;
        if (!phoneNumber.startsWith('+')) {
            // Assume India (+91) if no country code provided
            phoneNumber = '+91' + phoneNumber.replace(/^0+/, '');
        }

        const params = {
            Message: body,
            PhoneNumber: phoneNumber,
            MessageAttributes: {
                'AWS.SNS.SMS.SenderID': {
                    DataType: 'String',
                    StringValue: process.env.SNS_SENDER_ID || 'EXPO'
                },
                'AWS.SNS.SMS.SMSType': {
                    DataType: 'String',
                    StringValue: 'Transactional'
                }
            }
        };

        const command = new PublishCommand(params);
        const response = await client.send(command);

        console.log('SMS sent via AWS SNS:', response.MessageId);
        return { success: true, messageId: response.MessageId };
    } catch (error) {
        console.error('Error sending SMS via AWS SNS:', error.message);
        // Return error instead of throwing - prevents server crash
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    sendSMS
};
