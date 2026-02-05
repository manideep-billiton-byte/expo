/**
 * Test actual event creation with email
 * This simulates creating a real event and sending the email
 */

require('dotenv').config();
const pool = require('./db');
const { v4: uuidv4 } = require('uuid');
const { generateAndStoreQR } = require('./services/qrStorageService');
const { sendEmail } = require('./services/notificationService');

const testRealEventCreation = async () => {
    console.log('\n🧪 TESTING REAL EVENT CREATION WITH QR EMAIL\n');
    console.log('='.repeat(60));

    try {
        // 1. Create test event data
        const testEventData = {
            organizationId: 1,
            eventName: 'QR Test Event ' + Date.now(),
            description: 'Testing QR code in email',
            startDate: '2026-03-15',
            endDate: '2026-03-17',
            venue: 'Test Venue',
            city: 'Mumbai',
            organizerEmail: process.env.SES_FROM_EMAIL || 'deepak@btsind.com',
            organizerName: 'Test Organizer'
        };

        console.log('\n1️⃣ EVENT DATA:');
        console.log('   Event Name:', testEventData.eventName);
        console.log('   Organizer Email:', testEventData.organizerEmail);

        // 2. Generate token and registration link
        const token = uuidv4();
        const base = process.env.INVITE_LINK_BASE || 'https://d2ux36xl31uki3.cloudfront.net';
        const registration_link = `${base}/register?eventId=${encodeURIComponent(testEventData.eventName)}&token=${token}`;

        console.log('\n2️⃣ REGISTRATION LINK:');
        console.log('   Token:', token);
        console.log('   Link:', registration_link);

        // 3. Insert event into database
        const insertSql = `INSERT INTO events(
            organization_id, name, event_name, description, start_date, end_date,
            venue, city, organizer_email, organizer_name, qr_token, registration_link, status
        ) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING *`;

        const values = [
            testEventData.organizationId,
            testEventData.eventName,
            testEventData.eventName,
            testEventData.description,
            testEventData.startDate,
            testEventData.endDate,
            testEventData.venue,
            testEventData.city,
            testEventData.organizerEmail,
            testEventData.organizerName,
            token,
            registration_link,
            'Draft'
        ];

        const result = await pool.query(insertSql, values);
        const created = result.rows[0];

        console.log('\n3️⃣ EVENT CREATED:');
        console.log('   Event ID:', created.id);
        console.log('   Database Insert: ✅');

        // 4. Generate and store QR code
        console.log('\n4️⃣ GENERATING QR CODE:');
        const qrResult = await generateAndStoreQR(registration_link, created.id);

        console.log('   QR Path:', qrResult.path);
        console.log('   QR URL:', qrResult.fullUrl);
        console.log('   Base64 Length:', qrResult.base64 ? qrResult.base64.length : 0);
        console.log('   Base64 Available:', qrResult.base64 ? '✅ YES' : '❌ NO');

        // 5. Update event with QR path
        await pool.query(
            'UPDATE events SET qr_image_path = $1 WHERE id = $2',
            [qrResult.path, created.id]
        );

        console.log('   Database Update: ✅');

        // 6. Create email HTML (EXACT same as eventController.js)
        const qrBase64 = qrResult.base64;
        const qrImageUrl = qrResult.fullUrl;

        // This is the CRITICAL line - check if base64 is being used
        const qrSrc = qrBase64 ? `data:image/png;base64,${qrBase64}` : qrImageUrl;

        console.log('\n5️⃣ EMAIL QR SOURCE:');
        if (qrSrc.startsWith('data:image/png;base64,')) {
            console.log('   Method: ✅ BASE64 INLINE');
            console.log('   First 50 chars:', qrSrc.substring(0, 50) + '...');
        } else {
            console.log('   Method: ⚠️  EXTERNAL URL');
            console.log('   URL:', qrSrc);
        }

        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 20px auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; padding: 40px 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 28px; font-weight: 700; }
        .content { padding: 40px 30px; }
        .qr-section { background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border: 2px solid #10b981; padding: 30px; border-radius: 12px; margin: 30px 0; text-align: center; }
        .qr-section h3 { color: #065f46; margin: 0 0 10px 0; font-size: 20px; }
        .qr-code-img { background: white; padding: 20px; border-radius: 12px; display: inline-block; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .qr-code-img img { display: block; margin: 0 auto; }
        .info { background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎉 Event Created Successfully!</h1>
            <p>Your event registration is now live</p>
        </div>
        <div class="content">
            <p>Hello ${testEventData.organizerName || 'Organizer'},</p>
            <p>Your event <strong>${testEventData.eventName}</strong> has been successfully created.</p>
            
            <div class="info">
                <h3>Event Details</h3>
                <p><strong>Event:</strong> ${testEventData.eventName}</p>
                <p><strong>Date:</strong> ${testEventData.startDate} to ${testEventData.endDate}</p>
                <p><strong>Venue:</strong> ${testEventData.venue}, ${testEventData.city}</p>
            </div>
            
            ${qrSrc ? `
            <div class="qr-section">
                <h3>📱 Scan to Register</h3>
                <p>Share this QR code with your attendees for quick registration</p>
                <div class="qr-code-img">
                    <img src="${qrSrc}" alt="Event Registration QR Code" width="200">
                </div>
                <p style="margin-top: 15px; font-size: 12px; color: #047857;">
                    Attendees can scan this code with their phone camera to access the registration page instantly.
                </p>
            </div>
            ` : '<p style="color: red;">⚠️ QR Code not available</p>'}
            
            <div class="info">
                <h3>Registration Link</h3>
                <p style="word-break: break-all;">${registration_link}</p>
            </div>
        </div>
    </div>
</body>
</html>
        `;

        const textContent = `
Event Created Successfully!

Your event "${testEventData.eventName}" has been successfully created.

Event Details:
- Event: ${testEventData.eventName}
- Date: ${testEventData.startDate} to ${testEventData.endDate}
- Venue: ${testEventData.venue}, ${testEventData.city}

Registration Link:
${registration_link}

${qrBase64 ? 'QR Code: Included in HTML email' : 'QR Code: Not available'}
        `;

        // 7. Send email
        console.log('\n6️⃣ SENDING EMAIL:');
        console.log('   To:', testEventData.organizerEmail);
        console.log('   Subject: Event Created: ' + testEventData.eventName);

        const emailResult = await sendEmail({
            to: testEventData.organizerEmail,
            subject: `🎉 Event Created: ${testEventData.eventName}`,
            text: textContent,
            html: htmlContent
        });

        if (emailResult.success) {
            console.log('   Status: ✅ EMAIL SENT');
            console.log('   Message ID:', emailResult.messageId);
        } else {
            console.log('   Status: ❌ EMAIL FAILED');
            console.log('   Error:', emailResult.error);
        }

        console.log('\n' + '='.repeat(60));
        console.log('\n✅ TEST COMPLETE!');
        console.log('\n📧 CHECK YOUR EMAIL:');
        console.log('   Email: ' + testEventData.organizerEmail);
        console.log('   Subject: 🎉 Event Created: ' + testEventData.eventName);
        console.log('\n🔍 WHAT TO CHECK:');
        console.log('   1. Did you receive the email?');
        console.log('   2. Can you see the QR code in the email?');
        console.log('   3. Is the QR code section visible or blank?');
        console.log('   4. Try viewing email in different clients (Gmail web, mobile, etc.)');
        console.log('\n💡 IF QR CODE IS MISSING:');
        console.log('   - Check if email client blocks images');
        console.log('   - View email source (Show Original in Gmail)');
        console.log('   - Look for: <img src="data:image/png;base64,..."');
        console.log('   - Try opening email in browser');
        console.log('\n');

        // Cleanup - delete test event
        console.log('🧹 Cleaning up test event...');
        await pool.query('DELETE FROM events WHERE id = $1', [created.id]);
        console.log('   Test event deleted ✅\n');

    } catch (error) {
        console.error('\n❌ TEST FAILED:', error.message);
        console.error('Stack:', error.stack);
    } finally {
        await pool.end();
    }
};

testRealEventCreation();
