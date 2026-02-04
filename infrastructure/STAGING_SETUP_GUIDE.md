# 🧪 AWS Staging Environment - Complete Guide

## Overview

This guide helps you set up a **completely separate staging environment** on AWS for testing, isolated from production.

---

## 📊 Environment Comparison

| Feature | Production | Staging | Local Testing (ngrok) |
|---------|-----------|---------|---------------------|
| **Database** | expo-project-prod-db | expo-project-staging-db (isolated) | Uses production DB |
| **Backend** | expo-project-prod-env | expo-project-staging-env | Local server on port 5001 |
| **Frontend** | CloudFront (prod) | CloudFront (staging) | N/A |
| **Data Isolation** | ✅ Production data | ✅ Separate test data | ⚠️ Shares production data |
| **Cost** | ~$30-50/month | ~$30-40/month additional | Free (temporary) |
| **Permanence** | Permanent | Permanent | Temporary URL |
| **Best For** | Live users | QA testing | Quick testing |

---

## 🚀 Quick Setup (3 Steps)

### Prerequisites
```bash
# 1. AWS CLI installed and configured
aws --version
aws configure

# 2. Verify AWS access
aws sts get-caller-identity

# 3. Navigate to infrastructure directory
cd /home/billiton/Documents/Billiton/Expo_project/infrastructure
```

### Step 1: Create AWS Infrastructure
```bash
./setup-staging-environment.sh
```

This creates:
- ✅ RDS PostgreSQL database (isolated)
- ✅ S3 bucket for frontend
- ✅ CloudFront distribution
- ✅ Elastic Beanstalk application

**Time:** 10-15 minutes (database creation takes longest)

### Step 2: Initialize Database
```bash
# After step 1 completes, get the database URL from STAGING_INFO.md
psql "postgresql://postgres:PASSWORD@ENDPOINT:5432/expo_staging_db" < ../server/schema.sql
```

### Step 3: Deploy Backend & Frontend
```bash
# Deploy backend
./deploy-staging-backend.sh

# Deploy frontend
./deploy-staging-frontend.sh
```

**Done!** Your staging environment is live.

---

## 📁 Files Created

| File | Purpose |
|------|---------|
| `infrastructure/setup-staging-environment.sh` | Creates AWS infrastructure |
| `infrastructure/deploy-staging-backend.sh` | Deploys backend to EB |
| `infrastructure/deploy-staging-frontend.sh` | Deploys frontend to S3/CloudFront |
| `infrastructure/.env.staging` | Staging environment variables |
| `infrastructure/.env.staging.urls` | Staging URLs (auto-generated) |
| `infrastructure/STAGING_INFO.md` | Complete staging info & credentials |

---

## 🔗 Accessing Staging Environment

After deployment, you'll have:

### Staging Frontend
```
https://xxxxxxxxxx.cloudfront.net
```
- Full React application
- QR scanner works (HTTPS enabled)
- Connected to staging backend

### Staging Backend API
```
http://expo-project-staging-env.xxxxxx.elasticbeanstalk.com
```
- All API endpoints available
- Connected to staging database
- Separate from production

### Staging Database
```
postgresql://postgres:PASSWORD@expo-project-staging-db.xxx.rds.amazonaws.com:5432/expo_staging_db
```
- Completely isolated from production
- Can be reset/cleared anytime for testing

---

## 🧪 Testing Workflow

### For QA Engineers

1. **Access the staging frontend:**
   ```
   https://your-staging-cloudfront-url.cloudfront.net
   ```

2. **Test all features:**
   - User registration
   - Login flows
   - Event creation
   - QR scanning
   - Lead capture
   - All CRUD operations

3. **API testing:**
   ```bash
   # Get the staging backend URL
   STAGING_API="http://your-staging-eb-url.elasticbeanstalk.com"
   
   # Test dashboard
   curl $STAGING_API/api/dashboard
   
   # Test login
   curl -X POST $STAGING_API/api/login \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"pass"}'
   ```

4. **Database queries:**
   ```bash
   psql $STAGING_DATABASE_URL
   ```

---

## 🔄 Deployment Updates

### Update Staging Backend
```bash
cd infrastructure
./deploy-staging-backend.sh
```

### Update Staging Frontend
```bash
cd infrastructure
./deploy-staging-frontend.sh
```

### Update Environment Variables
```bash
cd infrastructure

# Edit .env.staging
nano .env.staging

# Redeploy backend
./deploy-staging-backend.sh
```

---

## 🗄️ Database Management

### Reset Staging Database
```bash
# Drop all tables and recreate
psql $STAGING_DATABASE_URL <<EOF
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
EOF

# Re-run schema
psql $STAGING_DATABASE_URL < ../server/schema.sql
```

### Copy Production Data to Staging (for testing)
```bash
# Dump production database
pg_dump $PRODUCTION_DATABASE_URL > prod_dump.sql

# Restore to staging
psql $STAGING_DATABASE_URL < prod_dump.sql
```

### View Staging Data
```bash
psql $STAGING_DATABASE_URL

# List tables
\dt

# Query data
SELECT * FROM organizations LIMIT 5;
SELECT * FROM events LIMIT 5;
```

---

## 💰 Cost Management

### Monthly Costs (Estimate)

| Resource | Type | Cost/Month |
|----------|------|------------|
| RDS db.t3.micro | Database | ~$15 |
| EC2 t3.small (EB) | Backend | ~$15 |
| S3 + CloudFront | Frontend | ~$1-5 |
| **TOTAL** | | **~$30-40/month** |

### Cost Reduction Tips

1. **Stop when not in use:**
   ```bash
   # Stop EB environment (saves ~$15/month)
   cd infrastructure
   eb scale 0
   
   # Restart when needed
   eb scale 1
   ```

2. **Delete RDS when not testing:**
   ```bash
   # Create snapshot first
   aws rds create-db-snapshot \
     --db-instance-identifier expo-project-staging-db \
     --db-snapshot-identifier staging-backup-$(date +%Y%m%d)
   
   # Delete database
   aws rds delete-db-instance \
     --db-instance-identifier expo-project-staging-db \
     --skip-final-snapshot
   
   # Restore later from snapshot
   aws rds restore-db-instance-from-db-snapshot \
     --db-instance-identifier expo-project-staging-db \
     --db-snapshot-identifier staging-backup-20260128
   ```

3. **Use smaller instances:**
   - RDS: Use db.t3.micro (free tier eligible)
   - EB: Use t3.micro if load is low

---

## 🛡️ Security

### Staging-Specific Security Settings

1. **Less strict than production** (for easier testing)
2. **Database is publicly accessible** (for easy access)
3. **No custom domain needed** (use CloudFront URL)
4. **Can use test credentials** (not real SMTP/Twilio)

### Recommended Security

```bash
# Restrict database access to specific IPs
aws rds modify-db-instance \
  --db-instance-identifier expo-project-staging-db \
  --vpc-security-group-ids sg-xxxxxxxx
```

---

## 🔧 Troubleshooting

### Backend Health Check Fails
```bash
# View logs
cd infrastructure
eb logs

# SSH into instance
eb ssh

# Check if server is running
curl localhost:8080/api/dashboard
```

### Frontend Shows Blank Page
```bash
# Check CloudFront distribution status
aws cloudfront list-distributions

# Invalidate cache
aws cloudfront create-invalidation \
  --distribution-id EXXXXXXXXXX \
  --paths "/*"

# Check S3 bucket contents
aws s3 ls s3://expo-project-staging-frontend-xxxxx/
```

### Database Connection Issues
```bash
# Test connection
psql $STAGING_DATABASE_URL -c "SELECT version();"

# Check security group
aws rds describe-db-instances \
  --db-instance-identifier expo-project-staging-db \
  --query 'DBInstances[0].VpcSecurityGroups'
```

---

## 🗑️ Destroying Staging Environment

When you no longer need staging:

```bash
# Delete EB environment
eb terminate expo-project-staging-env

# Delete RDS database
aws rds delete-db-instance \
  --db-instance-identifier expo-project-staging-db \
  --skip-final-snapshot

# Delete S3 bucket
aws s3 rb s3://expo-project-staging-frontend-xxxxx --force

# Delete CloudFront distribution
aws cloudfront delete-distribution \
  --id EXXXXXXXXXX \
  --if-match ETAG
```

---

## 📞 Support

If you encounter issues:

1. Check `STAGING_INFO.md` for all credentials
2. Review AWS CloudWatch logs
3. Use `eb logs` for backend logs
4. Check this guide's troubleshooting section

---

## 🎯 Next Steps

After setup:
- [ ] Test all API endpoints
- [ ] Verify QR scanning works
- [ ] Test visitor registration flow
- [ ] Test exhibitor login and lead capture
- [ ] Run full QA test suite
- [ ] Share staging URL with team

---

*Last Updated: 2026-01-28*
