/**
 * QR Code Email Diagnostic Script
 * Tests QR code generation, S3 upload, and email sending
 */

require('dotenv').config();
const { generateAndStoreQR } = require('./services/qrStorageService');
const { sendEmail } = require('./services/notificationService');

const testQREmail = async () => {
    console.log('\n🔍 QR CODE EMAIL DIAGNOSTIC TEST\n');
    console.log('='.repeat(60));

    // 1. Check environment variables
    console.log('\n1️⃣ ENVIRONMENT CONFIGURATION:');
    console.log('   NODE_ENV:', process.env.NODE_ENV);
    console.log('   CLOUDFRONT_DOMAIN:', process.env.CLOUDFRONT_DOMAIN || '❌ NOT SET (using default)');
    console.log('   S3_QR_BUCKET:', process.env.S3_QR_BUCKET || '❌ NOT SET (using default)');
    console.log('   AWS_REGION:', process.env.AWS_REGION);
    console.log('   AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✅ SET' : '❌ NOT SET');
    console.log('   AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✅ SET' : '❌ NOT SET');
    console.log('   SES_FROM_EMAIL:', process.env.SES_FROM_EMAIL);

    // 2. Generate test QR code
    console.log('\n2️⃣ GENERATING TEST QR CODE:');
    const testUrl = 'https://d2ux36xl31uki3.cloudfront.net/register?eventId=test&token=test123';
    const testEventId = 999999; // Use a test ID

    try {
        const qrResult = await generateAndStoreQR(testUrl, testEventId);
        console.log('   ✅ QR Code Generated Successfully!');
        console.log('   Path:', qrResult.path);
        console.log('   Full URL:', qrResult.fullUrl);
        console.log('   Base64 Length:', qrResult.base64 ? qrResult.base64.length : 0, 'characters');

        // 3. Test email sending
        console.log('\n3️⃣ SENDING TEST EMAIL:');
        const testEmail = process.env.SES_FROM_EMAIL; // Send to yourself

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; padding: 30px; }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 30px; text-align: center; border-radius: 12px; }
        .qr-section { background: #f0fdf4; border: 2px solid #10b981; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
        .qr-code-img { background: white; padding: 20px; border-radius: 12px; display: inline-block; }
        .info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🧪 QR Code Email Test</h1>
            <p>Diagnostic Test - ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="info">
            <h2>Test Information</h2>
            <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
            <p><strong>CloudFront Domain:</strong> ${process.env.CLOUDFRONT_DOMAIN || 'default'}</p>
            <p><strong>S3 Bucket:</strong> ${process.env.S3_QR_BUCKET || 'default'}</p>
        </div>
        
        <div class="qr-section">
            <h3>📱 QR Code Test (Base64 Embedded)</h3>
            <p>If you can see the QR code below, base64 embedding is working!</p>
            <div class="qr-code-img">
                <img src="data:image/png;base64,${qrResult.base64}" alt="Test QR Code" width="200" style="display: block;">
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #047857;">
                ✅ QR Code embedded as base64 data URI
            </p>
        </div>
        
        <div class="qr-section">
            <h3>🌐 QR Code Test (External URL)</h3>
            <p>If you can see the QR code below, S3/CloudFront URL is working!</p>
            <div class="qr-code-img">
                <img src="${qrResult.fullUrl}" alt="Test QR Code" width="200" style="display: block;">
            </div>
            <p style="margin-top: 15px; font-size: 12px; color: #047857;">
                URL: ${qrResult.fullUrl}
            </p>
        </div>
        
        <div class="info">
            <h3>✅ What This Test Verifies:</h3>
            <ul>
                <li>QR code generation is working</li>
                <li>S3 upload is successful (if in production)</li>
                <li>Base64 embedding works in emails</li>
                <li>External URL is accessible</li>
                <li>Email HTML rendering is correct</li>
            </ul>
        </div>
    </div>
</body>
</html>
        `;

        const textContent = `
QR Code Email Test
==================

Environment: ${process.env.NODE_ENV}
CloudFront Domain: ${process.env.CLOUDFRONT_DOMAIN || 'default'}
S3 Bucket: ${process.env.S3_QR_BUCKET || 'default'}

QR Code URL: ${qrResult.fullUrl}

This is a test email to verify QR code generation and email sending.
        `;

        const emailResult = await sendEmail({
            to: testEmail,
            subject: '🧪 QR Code Email Test - ' + new Date().toLocaleString(),
            text: textContent,
            html: htmlContent
        });

        if (emailResult.success) {
            console.log('   ✅ Email Sent Successfully!');
            console.log('   Recipient:', testEmail);
            console.log('   Message ID:', emailResult.messageId);
        } else {
            console.log('   ❌ Email Failed!');
            console.log('   Error:', emailResult.error);
        }

    } catch (error) {
        console.error('   ❌ Test Failed:', error.message);
        console.error('   Stack:', error.stack);
    }

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 NEXT STEPS:');
    console.log('   1. Check your email inbox for the test email');
    console.log('   2. Verify both QR codes are visible');
    console.log('   3. Try scanning the QR codes with your phone');
    console.log('   4. If external URL fails, check S3 bucket permissions');
    console.log('   5. If base64 works but URL fails, use base64 in production\n');
};

// Run the test
testQREmail()
    .then(() => {
        console.log('✅ Diagnostic test completed');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Diagnostic test failed:', error);
        process.exit(1);
    });
