# Testing Email & SMS

## Configuration Updated ✅

Your `server/.env` now has:
- **SMTP_FROM**: projects@btsind.com
- **SendGrid** credentials configured
- **Twilio** credentials configured

## Next Steps

### 1. Restart the Server

The server needs to reload the new environment variables:

**In the server terminal:**
- Press `Ctrl+C` to stop
- Run `npm start` to restart

You should see confirmation that schema and migrations loaded.

### 2. Test Email Sending

**Create an organization with your email:**
1. Go to http://localhost:5173
2. Create organization
3. Use **your actual email address**
4. Submit the form

**Check:**
- ✅ Server terminal shows: `Email sent: <messageId>`
- ✅ Check your email inbox (and spam folder!)
- ✅ Email should come from: projects@btsind.com

### 3. Test SMS Sending

**Important:** Twilio trial accounts can ONLY send to verified numbers!

**First, verify your phone number:**
1. Go to: https://console.twilio.com/us1/develop/phone-numbers/manage/verified
2. Click "Add a new number"
3. Enter your phone number (with country code, e.g., +919876543210)
4. Verify via SMS code

**Then test:**
1. Create organization with your **verified phone number**
2. Format: +[country code][number] (e.g., +919876543210 for India)

**Check:**
- ✅ Server terminal shows: `SMS sent: <sid>`
- ✅ Check your phone for SMS

### 4. Troubleshooting

**Email not received:**
- Check spam/junk folder
- Verify SendGrid API key is active
- Check server terminal for errors
- Verify projects@btsind.com is verified in SendGrid

**SMS not received:**
```
Error: The number [xxx] is unverified
```
**Fix:** Add your number to verified numbers in Twilio console

**Check SendGrid Dashboard:**
https://app.sendgrid.com/email_activity

**Check Twilio Logs:**
https://console.twilio.com/us1/monitor/logs/sms

## Expected Output in Terminal

**Success:**
```
Mock sending email to: your@email.com
Email sent: <1234567890@smtp.sendgrid.net>
SMS sent: SM1234567890abcdef
```

**If still in mock mode:**
```
Mock sending email to: your@email.com
Mock sending SMS to: +919876543210
```
**Fix:** Restart server after adding credentials

## Test Checklist

- [ ] Server restarted with new credentials
- [ ] Email sent successfully
- [ ] Email received in inbox
- [ ] Phone number verified in Twilio
- [ ] SMS sent successfully  
- [ ] SMS received on phone
- [ ] Both email and SMS working together
