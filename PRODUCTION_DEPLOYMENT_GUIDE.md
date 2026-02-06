# 🚀 Production Deployment Guide

**Last Updated:** February 6, 2026  
**Status:** ✅ Ready for Production  
**Environment:** AWS (Elastic Beanstalk + S3 + CloudFront + RDS)

---

## 📋 Table of Contents

1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Step-by-Step Deployment](#step-by-step-deployment)
3. [Full Deployment Sequence](#full-deployment-sequence)
4. [Post-Deployment Verification](#post-deployment-verification)
5. [Rollback Procedures](#rollback-procedures)
6. [Monitoring & Logs](#monitoring--logs)
7. [Production URLs & Credentials](#production-urls--credentials)
8. [Troubleshooting](#troubleshooting)

---

## Pre-Deployment Checklist

Before deploying to production, verify the following:

### 1. Verify Staging is Working

```bash
# Check staging frontend
curl -s https://d2mwpnz04jz48g.cloudfront.net/ | head -c 100

# Check staging backend API
curl -s https://expo-project-staging-env.eba-msq3qh3p.ap-south-1.elasticbeanstalk.com/api/dashboard | jq .
```

**Expected:** Both should return valid responses (200 status, HTML content, or JSON data).

---

### 2. Check Git Status

```bash
# Verify you're on the main/production branch
git branch -v

# View recent commits
git log --oneline -5

# Ensure working directory is clean
git status
```

**Expected:** Output should show main branch and clean status (no uncommitted changes).

---

### 3. Verify AWS Credentials

```bash
# Check AWS CLI is installed and configured
aws sts get-caller-identity
```

**Expected Output:**
```json
{
    "UserId": "...",
    "Account": "487003520426",
    "Arn": "arn:aws:iam::..."
}
```

---

### 4. Check Configuration Files

```bash
# Verify production environment configuration exists
cat server/.env.production
```

**Expected:** Should show:
```
DATABASE_URL=postgresql://postgres:EventPass123!@expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_db
CLOUDFRONT_DOMAIN=d36p7i1koir3da.cloudfront.net
NODE_ENV=production
S3_QR_BUCKET=expo-project-prod-frontend
```

---

## Step-by-Step Deployment

### Step 1: Navigate to Project Directory

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project
```

---

### Step 2: Deploy Backend to Production (Elastic Beanstalk)

```bash
cd infrastructure
bash backend-deploy.sh
```

**Interactive Prompts:**
```
Enter AWS Region (default: ap-south-1): 
→ Press Enter (or type ap-south-1)

Enter Project Name (default: expo-project): 
→ Press Enter (or type expo-project)

Enter Environment (dev/staging/prod) (default: prod): 
→ Type: prod
```

**What Happens:**
1. Checks for AWS CLI and EB CLI (installs if missing)
2. Initializes Elastic Beanstalk application
3. Creates/updates production EB environment
4. Reads environment variables from `server/.env.production`
5. Deploys backend code via EB
6. Outputs backend URL

**Expected Output:**
```
✅ Backend Deployment Complete!
🌐 Backend URL: http://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
🔍 Health Check: http://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/dashboard
📝 To view logs: eb logs
```

**⏱️ Duration:** 5-10 minutes (waits for EB environment to stabilize)

---

### Step 3: Deploy Frontend to Production (S3 + CloudFront)

```bash
bash frontend-deploy.sh
```

**Interactive Prompts:**
```
Enter AWS Region (default: ap-south-1): 
→ Press Enter

Enter Project Name (default: expo-project): 
→ Press Enter

Enter Environment (dev/staging/prod) (default: prod): 
→ Type: prod

Enter Backend API URL: 
→ Paste the backend URL from Step 2
   Example: https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
```

**What Happens:**
1. Creates production environment configuration
2. Installs npm dependencies
3. Builds React/Vite frontend with production optimizations
4. Uploads built files to S3 bucket (`expo-project-prod-frontend`)
5. Invalidates CloudFront cache (users get latest version)
6. Outputs CloudFront and S3 URLs

**Expected Output:**
```
✅ Frontend Deployment Complete!
🌐 S3 Website URL: http://expo-project-prod-frontend.s3-website-ap-south-1.amazonaws.com
🌐 CloudFront URL: https://d36p7i1koir3da.cloudfront.net
```

**⏱️ Duration:** 3-5 minutes (build + upload + invalidation)

---

## Full Deployment Sequence

To deploy everything at once, create and run this script:

**File:** `deploy-prod.sh`

```bash
#!/bin/bash

# Full Production Deployment Script
# Run from project root: bash deploy-prod.sh

set -e  # Exit on any error

echo "🚀 PRODUCTION DEPLOYMENT STARTED"
echo "=================================="
echo ""

# Pre-flight checks
echo "📋 Running pre-flight checks..."

# Check git status
if [[ $(git status --porcelain) ]]; then
    echo "❌ Working directory is not clean. Commit or stash changes first."
    exit 1
fi

echo "✅ Git status OK"

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi

echo "✅ AWS credentials OK"

# Navigate to project root
cd "$(dirname "$0")"

# Deploy backend
echo ""
echo "=================================="
echo "📤 Step 1: Deploying Backend"
echo "=================================="
cd infrastructure
bash backend-deploy.sh << EOF
ap-south-1
expo-project
prod
EOF

# Extract backend URL from output (or ask user)
read -p "Enter the Backend URL from above (or press Enter to continue): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-"https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com"}

# Deploy frontend
echo ""
echo "=================================="
echo "📤 Step 2: Deploying Frontend"
echo "=================================="
bash frontend-deploy.sh << EOF
ap-south-1
expo-project
prod
${BACKEND_URL}
EOF

echo ""
echo "=================================="
echo "✅ PRODUCTION DEPLOYMENT COMPLETE!"
echo "=================================="
echo ""
echo "🌐 Production URLs:"
echo "   Frontend: https://d36p7i1koir3da.cloudfront.net"
echo "   Backend:  https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com"
echo ""
echo "⏱️  Wait 2-3 minutes for CloudFront to fully cache content."
echo ""
```

**How to Use:**

```bash
# Make script executable
chmod +x deploy-prod.sh

# Run the deployment
bash deploy-prod.sh
```

---

## Post-Deployment Verification

### 1. Verify Backend API

```bash
# Test dashboard API
curl -s https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/dashboard | jq .

# Check response includes stats
# Expected: JSON with "stats" array containing dashboard data
```

### 2. Verify Frontend

```bash
# Test frontend loads
curl -s https://d36p7i1koir3da.cloudfront.net/ | head -c 500

# Should return HTML content starting with <!DOCTYPE html> or <html>
```

### 3. Test Core Features (via Browser)

1. **Open:** https://d36p7i1koir3da.cloudfront.net
2. **Verify:**
   - ✅ Page loads completely
   - ✅ CSS/styling looks correct
   - ✅ No console errors (press F12 → Console)
   - ✅ API calls are working

3. **Test Organization Login:**
   - Email: `alupulamanideep@gmail.com`
   - Password: (use your configured password)

4. **Test Event Creation:**
   - Create a test event
   - Verify QR code is generated
   - Check that data is saved in production DB

### 4. Check EB Logs

```bash
cd server

# View latest logs
eb logs

# Stream logs in real-time
eb logs --stream
```

### 5. Check EB Environment Health

```bash
# View environment status
eb status

# View detailed health information
eb health

# SSH into production instance (if needed)
eb ssh
```

---

## Rollback Procedures

### Rollback Backend

If the backend deployment has issues:

```bash
cd infrastructure

# List available application versions
eb appversion list --region ap-south-1

# Deploy to a previous version (replace with actual version ID)
eb deploy expo-project-prod-env --version app-230206-120000

# OR revert to the previous commit and redeploy
git revert HEAD
bash backend-deploy.sh
```

### Rollback Frontend

If the frontend deployment has issues:

```bash
# Invalidate CloudFront to force cache refresh (if files were uploaded)
aws cloudfront create-invalidation \
  --distribution-id E1U3WEIJ9OZDTY \
  --paths "/*" \
  --region ap-south-1

# OR restore from previous S3 version
aws s3 cp s3://expo-project-prod-frontend-backup dist/ --recursive
aws s3 sync dist/ s3://expo-project-prod-frontend --delete

# Then invalidate CloudFront again
aws cloudfront create-invalidation \
  --distribution-id E1U3WEIJ9OZDTY \
  --paths "/*"
```

---

## Monitoring & Logs

### View Backend Logs

```bash
cd server

# Real-time log streaming
eb logs --stream

# One-time log dump
eb logs

# SSH into instance and check app-specific logs
eb ssh
tail -f /var/log/eb-engine.log
pm2 logs
```

### View CloudFront Activity

```bash
# Check CloudFront invalidation status
aws cloudfront list-invalidations \
  --distribution-id E1U3WEIJ9OZDTY \
  --region ap-south-1

# Monitor S3 uploads
aws s3 ls s3://expo-project-prod-frontend --recursive --summarize
```

### View Database Queries

```bash
# SSH into RDS (if you have access)
psql "postgresql://postgres:EventPass123!@expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_db?sslmode=require"

# View recent events
SELECT id, name, created_at FROM events ORDER BY created_at DESC LIMIT 10;
```

---

## Production URLs & Credentials

### Frontend

| Component | URL |
|-----------|-----|
| **CloudFront CDN** | https://d36p7i1koir3da.cloudfront.net |
| **S3 Origin** | http://expo-project-prod-frontend.s3-website-ap-south-1.amazonaws.com |

### Backend

| Component | URL |
|-----------|-----|
| **Elastic Beanstalk** | https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com |
| **Health Check** | https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/dashboard |

### Database

| Component | Details |
|-----------|---------|
| **RDS Instance** | expo-project-prod-db |
| **Host** | expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com |
| **Port** | 5432 |
| **Database** | expo_db |
| **Master User** | postgres |
| **Password** | ⚠️ Stored in AWS Secrets Manager |

### CloudFront

| Component | Value |
|-----------|-------|
| **Distribution ID** | E1U3WEIJ9OZDTY |
| **Domain** | d36p7i1koir3da.cloudfront.net |
| **Origin** | expo-project-prod-frontend (S3) |

---

## Troubleshooting

### Frontend Not Updating After Deploy

**Problem:** CloudFront is serving stale content

**Solution:**
```bash
# Check if invalidation completed
aws cloudfront list-invalidations --distribution-id E1U3WEIJ9OZDTY --region ap-south-1

# Create new invalidation if needed
aws cloudfront create-invalidation --distribution-id E1U3WEIJ9OZDTY --paths "/*"

# Clear browser cache
# Or use hard refresh: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)
```

---

### Backend API Returning 502 Bad Gateway

**Problem:** Elastic Beanstalk instance is not healthy

**Solution:**
```bash
cd server

# Check EB health
eb health

# Check logs
eb logs --stream

# SSH and check PM2 status
eb ssh
pm2 status
pm2 logs

# Restart if needed
pm2 restart all
```

---

### Database Connection Error

**Problem:** Backend cannot connect to production RDS

**Solution:**
```bash
# Verify security group allows access
aws ec2 describe-security-groups --region ap-south-1 | grep -A 5 "expo-project"

# Test database connectivity
PGPASSWORD='EventPass123!' psql \
  -h expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com \
  -U postgres \
  -d expo_db \
  -c "SELECT 1"

# Check EB environment DATABASE_URL
eb printenv --environment expo-project-prod-env
```

---

### High Traffic / Performance Issues

**Solution:**
```bash
# Scale up EB instance (increase number of instances)
aws autoscaling update-auto-scaling-group \
  --auto-scaling-group-name "elasticbeanstalk-expo-project-prod-env-asg" \
  --min-size 2 \
  --desired-capacity 2 \
  --region ap-south-1

# Increase instance type (t3.small → t3.medium)
eb scale 2 --instance-type t3.medium

# Check CloudFront cache hit ratio
# (CloudFront > Distributions > Details tab)
```

---

## Emergency Contacts & Resources

| Item | Contact/Link |
|------|---|
| **AWS Account** | 487003520426 |
| **EB App Name** | expo-project-prod |
| **EB Environment** | expo-project-prod-env |
| **AWS Region** | ap-south-1 (Mumbai) |
| **Support** | See AWS documentation or contact your DevOps team |

---

## Deployment Checklist Template

Use this checklist before each production deployment:

- [ ] Staging is fully tested and verified working
- [ ] All commits are merged to main branch
- [ ] Git working directory is clean (`git status`)
- [ ] AWS credentials are configured (`aws sts get-caller-identity`)
- [ ] `.env.production` is up to date
- [ ] Backend deployment script exists and is executable
- [ ] Frontend deployment script exists and is executable
- [ ] No critical bugs in recent code review
- [ ] Database backups are current
- [ ] Team is notified of deployment
- [ ] Post-deployment verification plan is ready

---

## Additional Resources

- [AWS Elastic Beanstalk Documentation](https://docs.aws.amazon.com/elasticbeanstalk/)
- [CloudFront Invalidation Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/Invalidation.html)
- [RDS Database Backups](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/USER_BackupRestore.html)
- [Project README](README.md)
- [Deployment Summary](DEPLOYMENT_SUMMARY.md)

---

**Last Deployment:** February 5, 2026  
**Deployed By:** DevOps Team  
**Status:** ✅ All Systems Operational

---

*This document is maintained as the single source of truth for production deployments. Update this file after each deployment.*
