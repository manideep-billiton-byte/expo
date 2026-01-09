# 🔄 Dual Environment Setup Guide

Quick reference for local development and AWS production environments.

---

## 📍 Environment URLs

### Local Development
| Component | URL | Use For |
|-----------|-----|---------|
| **Frontend** | http://localhost:5173 | Testing UI changes |
| **Backend API** | http://localhost:5000 | Testing API endpoints |
| **Database** | localhost:5432 | Local PostgreSQL |

### AWS Production  
| Component | URL | Use For |
|-----------|-----|---------|
| **Frontend** | https://d2ux36xl31uki3.cloudfront.net | Live application |
| **Backend API** | https://d3cgzphanxg4ax.cloudfront.net | Live API |
| **Database** | expo-project-prod-db.cvmk8awyksm7....com | Production data |

---

## 🚀 Quick Start Commands

### Start Local Development

```bash
# Terminal 1 - Backend
cd ~/Documents/Billiton/Expo_project/server
npm start

# Terminal 2 - Frontend
cd ~/Documents/Billiton/Expo_project/client
npm run dev
```

**Access:** http://localhost:5173

### Deploy to AWS (After Testing Locally)

```bash
# 1. Deploy Backend
cd ~/Documents/Billiton/Expo_project
cd server && zip -r ../expo-backend-latest.zip . -x "*.git*" "node_modules/*" "*.log" ".env"
cd ..
aws s3 cp expo-backend-latest.zip s3://expo-project-prod-frontend/backend-deployments/
aws elasticbeanstalk create-application-version \
  --application-name expo-project-prod \
  --version-label v-$(date +%s) \
  --source-bundle S3Bucket="expo-project-prod-frontend",S3Key="backend-deployments/expo-backend-latest.zip" \
  --region ap-south-1
# Note the version label, then:
aws elasticbeanstalk update-environment \
  --environment-name expo-project-prod-env \
  --version-label v-TIMESTAMP \
  --region ap-south-1

# 2. Deploy Frontend
cd infrastructure
./frontend-deploy.sh
# Enter backend URL: https://d3cgzphanxg4ax.cloudfront.net
```

---

## 🔧 Environment Configuration

### Local `.env` Files

**Backend** (`server/.env`):
```env
PORT=5000
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=password
PGDATABASE=expo_db
PGSSLMODE=disable

# Use production credentials for real SMS/Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key_here
SMTP_FROM=no-reply@yourdomain.com

TWILIO_ACCOUNT_SID=your_twilio_account_sid_here
TWILIO_AUTH_TOKEN=your_twilio_auth_token_here
TWILIO_FROM=+1234567890

GST_API_KEY=your_gst_api_key_here
```

**Frontend** (`client/.env.local`):
```env
VITE_API_URL=http://localhost:5000
VITE_ENV=development
```

### Production Configuration

Already configured in AWS:
- Backend environment variables set in Elastic Beanstalk
- Frontend builds with `client/.env.production`

---

## 🧪 Testing Workflow

### 1. Test Locally First
```bash
# Start local servers (see Quick Start above)
# Open http://localhost:5173
# Test the feature (create org, create event, etc.)
# Check for errors in:
#   - Browser console (F12)
#   - Backend terminal
```

### 2. Fix Issues Locally
```bash
# Make code changes
# Server auto-restarts (nodemon)
# Frontend auto-reloads (Vite HMR)
# Test again until it works
```

### 3. Deploy to AWS
```bash
# Use deployment commands above
# Wait 5-10 minutes for deployment
# Test at https://d2ux36xl31uki3.cloudfront.net
```

---

## 🐛 Common Issues

### Issue: Email/SMS not sending locally
**Solution:** Add SMTP/Twilio credentials to `server/.env` (see configuration above)

### Issue: Database connection error
```bash
# Check PostgreSQL is running
sudo systemctl status postgresql
sudo systemctl start postgresql

# Create database if needed
sudo -u postgres psql -c "CREATE DATABASE expo_db;"
```

### Issue: Frontend can't connect to backend
**Check:** `client/.env.local` has `VITE_API_URL=http://localhost:5000`

### Issue: Changes not reflecting
```bash
# Restart backend (Ctrl+C then npm start)
# Clear browser cache (Ctrl+Shift+R)
```

---

## 📋 Development Checklist

Before deploying to AWS:

- [ ] Feature works in local environment
- [ ] No errors in browser console
- [ ] No errors in backend terminal
- [ ] Database changes tested
- [ ] Email/SMS sending works (if applicable)
- [ ] Commit changes to git
- [ ] Test one more time locally
- [ ] Deploy to AWS
- [ ] Verify in production

---

## 🔄 Switching Between Environments

### Test in Local
1. Access http://localhost:5173
2. Data stored in local database
3. Can reset/test without affecting production

### Test in AWS Production
1. Access https://d2ux36xl31uki3.cloudfront.net
2. Data stored in AWS RDS
3. Real users will see these changes

---

## 💡 Pro Tips

1. **Always test locally first** - faster iteration, no deployment wait
2. **Use git** - commit working code before deploying
3. **Check logs** - Terminal (local) or CloudWatch (AWS)
4. **Database backups** - Before major changes, backup production DB
5. **Twilio trial** - Remember to verify phone numbers first

---

## 📞 Quick Reference

| Need | Local | AWS |
|------|-------|-----|
| View app | http://localhost:5173 | https://d2ux36xl31uki3.cloudfront.net |
| API test | http://localhost:5000/api/dashboard | https://d3cgzphanxg4ax.cloudfront.net/api/dashboard |
| Logs | Terminal output | AWS CloudWatch |
| Database | Local PostgreSQL | AWS RDS |
| Deploy | N/A (instant changes) | Run deployment script |
