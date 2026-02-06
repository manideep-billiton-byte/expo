# 🚀 One-Command Production Deployment

A fully automated deployment script that deploys both backend and frontend to AWS production in a single command.

## Quick Start

```bash
# Navigate to project root
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project

# Make script executable
chmod +x deploy-to-production.sh

# Run deployment
bash deploy-to-production.sh
```

That's it! The script will:

1. ✅ Verify all prerequisites (git, AWS CLI, credentials, Node.js)
2. ✅ Deploy backend to Elastic Beanstalk
3. ✅ Deploy frontend to S3 + CloudFront
4. ✅ Invalidate CloudFront cache
5. ✅ Verify both are responding
6. ✅ Show you the production URLs

## What It Does

### Pre-Flight Checks
- Confirms you're in the project root directory
- Checks that git working directory is clean
- Verifies AWS CLI and EB CLI are installed
- Confirms AWS credentials are configured
- Validates Node.js is installed

### Backend Deployment
- Initializes Elastic Beanstalk (if needed)
- Creates EB environment (if needed)
- Loads environment variables from `.env.production`
- Deploys Node.js/Express backend
- Outputs backend API URL

### Frontend Deployment
- Creates production `.env.production` file
- Installs npm dependencies
- Builds React/Vite production bundle
- Uploads optimized files to S3
- Invalidates CloudFront cache
- Outputs frontend URL

### Verification
- Tests backend API endpoint
- Tests frontend loads
- Displays all production URLs

## Requirements

Before running the script, ensure you have:

```bash
# 1. AWS CLI installed
aws --version

# 2. AWS credentials configured
aws sts get-caller-identity

# 3. EB CLI (will auto-install if missing)
eb --version

# 4. Node.js installed
node --version

# 5. Git repository initialized
git status

# 6. Clean working directory (no uncommitted changes)
git status
```

## Troubleshooting

### Script fails: "AWS credentials not configured"

```bash
aws configure
# Enter your AWS Access Key ID and Secret Access Key
```

### Script fails: "Not in project root directory"

```bash
cd /home/billiton/Documents/event_management_hub/all_work/Expo_project
bash deploy-to-production.sh
```

### Script fails: "Working directory is not clean"

```bash
# Commit your changes
git add .
git commit -m "Your commit message"

# Or stash them
git stash

# Then run deployment again
bash deploy-to-production.sh
```

### Backend deployment takes too long

This is normal for the first deployment (5-10 minutes). Be patient and don't cancel the script.

### Frontend shows old content after deployment

Wait 2-3 minutes for CloudFront to fully propagate, or do a hard refresh:
- **Windows/Linux:** Ctrl + Shift + R
- **Mac:** Cmd + Shift + R

## Production URLs After Deployment

```
Frontend:  https://d36p7i1koir3da.cloudfront.net
Backend:   https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com
Dashboard: https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com/api/dashboard
```

## Monitoring After Deployment

```bash
# View backend logs in real-time
cd server
eb logs --stream

# Check environment health
eb health

# SSH into the instance
eb ssh
```

## Rollback (if something goes wrong)

```bash
# Revert to previous backend version
cd server
eb appversion list
eb deploy expo-project-prod-env --version <previous-version-id>

# Invalidate CloudFront for fresh frontend
aws cloudfront create-invalidation --distribution-id E1U3WEIJ9OZDTY --paths "/*"
```

## Full Documentation

For detailed information, see: [PRODUCTION_DEPLOYMENT_GUIDE.md](PRODUCTION_DEPLOYMENT_GUIDE.md)
