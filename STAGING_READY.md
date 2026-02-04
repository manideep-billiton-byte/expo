# 🧪 AWS Staging Environment - Ready to Deploy!

## What's Been Prepared

I've created a **complete AWS staging environment** setup for your test engineers. Here's what's ready:

---

## 📁 Created Files

### 1. Setup Scripts (in `infrastructure/`)
- ✅ **`setup-staging-environment.sh`** - Creates all AWS resources
- ✅ **`deploy-staging-backend.sh`** - Deploys backend to staging
- ✅ **`deploy-staging-frontend.sh`** - Deploys frontend to staging

### 2. Documentation
- ✅ **`STAGING_SETUP_GUIDE.md`** - Complete setup & management guide
- ✅ **`ENVIRONMENTS_QUICK_REF.md`** - Quick reference for all environments

---

## 🎯 What You Get

### Separate Staging Infrastructure

```
┌─────────────────────────────────────────────────────────────┐
│                    AWS STAGING ENVIRONMENT                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🗄️  Database: expo-project-staging-db                     │
│      ├─ Completely isolated from production                │
│      ├─ Can reset/clear anytime for testing                │
│      └─ Safe for destructive tests                         │
│                                                             │
│  🚀 Backend: expo-project-staging-env                      │
│      ├─ Elastic Beanstalk environment                      │
│      ├─ Separate from production                           │
│      └─ Public URL for testing                             │
│                                                             │
│  🎨 Frontend: CloudFront + S3                              │
│      ├─ Separate distribution                              │
│      ├─ HTTPS enabled (QR scanner works)                   │
│      └─ Connected to staging backend                       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Environment Comparison

| Feature | Production | **NEW: Staging** | Local (ngrok) |
|---------|-----------|------------------|---------------|
| Database | Production data | **Isolated test data** | ⚠️ Uses production |
| Data safety | Protected | **Safe to break** | ⚠️ Affects production |
| Permanence | Permanent | **Permanent** | Temporary URL |
| Cost | $30-50/mo | **$30-40/mo** | Free |

---

## 🚀 How to Deploy Staging

### Option 1: Full Automatic Setup (Recommended)

```bash
# Run this ONE command to create everything:
cd /home/billiton/Documents/Billiton/Expo_project/infrastructure
./setup-staging-environment.sh
```

**This will create:**
1. ✅ RDS PostgreSQL database (isolated)
2. ✅ S3 bucket for frontend
3. ✅ CloudFront distribution
4. ✅ Elastic Beanstalk application

**Time:** 10-15 minutes (mostly waiting for AWS)

### Then Deploy:
```bash
# Initialize database
psql "[connection-string-from-output]" < ../server/schema.sql

# Deploy backend
./deploy-staging-backend.sh

# Deploy frontend
./deploy-staging-frontend.sh
```

**Done!** Staging environment is live.

---

## 🔗 URLs You'll Get

After deployment:

| Resource | URL Format |
|----------|-----------|
| **Staging Frontend** | `https://[random-id].cloudfront.net` |
| **Staging Backend API** | `http://expo-project-staging-env.[random-id].elasticbeanstalk.com` |
| **Staging Database** | `postgresql://postgres:[pass]@expo-project-staging-db.[id].rds.amazonaws.com:5432/expo_staging_db` |

---

## 📝 For Your QA Engineer

### Share This:

**Staging Environment Access:**

Frontend URL: `https://[will-be-provided-after-deployment].cloudfront.net`

API Base URL: `http://[will-be-provided-after-deployment].elasticbeanstalk.com`

**Testing Credentials:**
- All test data is isolated
- Create test accounts freely
- Safe to test destructive operations
- Database can be reset anytime

**Documentation:**
- API Documentation: `/server/API_DOCUMENTATION.md`
- Database Schema: `/server/DATABASE_SCHEMA.md`
- Testing Guide: `/infrastructure/STAGING_SETUP_GUIDE.md`

---

## 💰 Cost

**Monthly:** ~$30-40

**Breakdown:**
- RDS db.t3.micro: ~$15
- EB t3.small: ~$15
- S3 + CloudFront: ~$1-5

**Save Money:**
```bash
# Stop when not testing (saves $15/month)
eb scale 0

# Restart when needed
eb scale 1
```

---

## ✅ Ready to Deploy?

To start the staging environment setup, run:

```bash
cd /home/billiton/Documents/Billiton/Expo_project/infrastructure
./setup-staging-environment.sh
```

The script will:
1. ✅ Ask for confirmation before creating anything
2. ✅ Show progress for each step
3. ✅ Save all credentials securely
4. ✅ Generate `STAGING_INFO.md` with everything you need

---

## 📞 Need Help?

- **Setup Guide**: `infrastructure/STAGING_SETUP_GUIDE.md`
- **Quick Reference**: `ENVIRONMENTS_QUICK_REF.md`
- **AWS Console**: https://console.aws.amazon.com

---

## Current Testing Options Summary

### 1. ✅ Local Testing (Active Now)
- **URL**: `https://splurgy-ontogenetic-quintin.ngrok-free.dev`
- **Status**: Running
- **Database**: Uses production (⚠️ changes affect production)
- **Best for**: Quick API testing during development
- **File**: `TESTING_SERVER_INFO.md`

### 2. 🆕 AWS Staging (Ready to Create)
- **URL**: Will be generated
- **Status**: Not yet created
- **Database**: Isolated test database
- **Best for**: Full QA testing, safe destructive tests
- **Setup**: Run `infrastructure/setup-staging-environment.sh`

### 3. ✅ Production (Live)
- **Frontend**: `https://d36p7i1koir3da.cloudfront.net`
- **Backend**: `https://d3cgzphanxg4ax.cloudfront.net`
- **Status**: Live and serving users
- **Use for**: Real customer traffic only

---

**Next Step:** Do you want to create the AWS staging environment now?

Run: `cd infrastructure && ./setup-staging-environment.sh`
