# AWS Deployment - Quick Reference

## 🚀 Quick Deploy (3 commands)

```bash
cd infrastructure

# 1. Set up infrastructure (10-15 min)
./aws-setup.sh

# 2. Deploy backend (5-10 min)
./backend-deploy.sh

# 3. Deploy frontend (3-5 min)
./frontend-deploy.sh
```

**Total Time**: ~20-30 minutes

## 📋 Pre-Deployment Checklist

- [ ] AWS account with billing enabled
- [ ] AWS CLI installed (`aws --version`)
- [ ] AWS CLI configured (`aws configure`)
- [ ] Node.js 18+ installed (`node --version`)
- [ ] Dependencies installed (`npm install` in client/ and server/)

## 🔑 Required Credentials

Add to `.env.production` after running `aws-setup.sh`:

```bash
# Email (optional but recommended)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# SMS (optional)
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxx
TWILIO_FROM=+1234567890

# GST Verification (optional)
GST_API_KEY=xxxxx
```

## 📊 Infrastructure Created

| Resource | Type | Purpose | Cost/Month |
|----------|------|---------|------------|
| Database | RDS PostgreSQL | Data storage | ~$15-20 |
| Backend | Elastic Beanstalk | API server | ~$15-20 |
| Load Balancer | ALB | Traffic distribution | ~$16-20 |
| Frontend | S3 + CloudFront | Static hosting + CDN | ~$2-5 |
| **Total** | | | **~$50-65** |

## 🔍 Verify Deployment

```bash
# Check backend
curl https://YOUR-BACKEND-URL.elasticbeanstalk.com/api/dashboard

# Check frontend
# Open CloudFront URL in browser
```

## 🛠️ Common Commands

### View Logs
```bash
cd server
eb logs
# or
eb logs --stream  # real-time
```

### Update Environment Variables
```bash
cd server
eb setenv SMTP_HOST=smtp.gmail.com SMTP_PORT=465
eb restart
```

### Scale Application
```bash
cd server
eb scale 2  # 2 instances
eb scale 1  # back to 1
```

### Deploy Updates
```bash
# Backend
cd infrastructure
./backend-deploy.sh

# Frontend
cd infrastructure
./frontend-deploy.sh
```

## ❌ Troubleshooting Quick Fixes

### Backend Health Degraded
```bash
cd server
eb logs  # Check for errors
eb restart  # Try restart
```

### Frontend Blank Page
```bash
# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### Database Connection Error
```bash
# Verify DATABASE_URL
cd server
eb printenv | grep DATABASE

# Test connection
eb ssh
psql $DATABASE_URL -c "SELECT 1;"
```

## 📚 Full Documentation

- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Complete guide (200+ lines)
- **[AWS_SETUP.md](AWS_SETUP.md)** - Infrastructure details
- **[MAINTENANCE.md](MAINTENANCE.md)** - Troubleshooting & ops

## 💰 Cost Optimization

```bash
# Stop environment when not needed
cd server
eb scale 0  # Stop instances

# Start again
eb scale 1
```

## 🔐 Security Checklist

- [ ] HTTPS enabled (automatic with CloudFront)
- [ ] Database not publicly accessible
- [ ] Strong passwords used
- [ ] Environment variables secured
- [ ] AWS MFA enabled (recommended)
- [ ] Backup enabled (automatic)

## 🎯 Next Steps After Deployment

1. Test all features (login, QR scanning, etc.)
2. Add your SMTP/Twilio credentials
3. Set up monitoring (CloudWatch)
4. Configure custom domain (optional)
5. Enable automated backups
6. Set up CI/CD (optional)

## 📞 Support

- **Deployment Issues**: See DEPLOYMENT.md
- **Operations**: See MAINTENANCE.md
- **AWS Issues**: Check CloudWatch logs
- **Application Issues**: Check EB logs

## 🚨 Emergency Rollback

```bash
# Backend
cd server
eb deploy --version <previous-version>

# Frontend
# S3 has versioning enabled - restore from console
```

---

**Remember**: First deployment takes ~20-30 minutes. Subsequent deployments are faster (3-5 minutes).
