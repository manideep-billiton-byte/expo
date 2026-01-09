---
description: Deploy the Expo project to AWS (both frontend and backend)
---

# Deploy to AWS

This workflow guides you through deploying the complete Expo project to AWS.

## Prerequisites

Before starting, ensure you have:
- AWS account with billing enabled
- AWS CLI installed and configured (`aws configure`)
- Node.js 18+ installed
- Project dependencies installed (`npm install` in both client/ and server/)

## Deployment Steps

### 1. Set up AWS Infrastructure

// turbo
```bash
cd infrastructure
./aws-setup.sh
```

This will create:
- RDS PostgreSQL database
- S3 bucket for frontend
- CloudFront distribution
- Elastic Beanstalk application

**Time**: 10-15 minutes (mostly waiting for RDS)

### 2. Configure Environment Variables

After infrastructure setup, edit `.env.production`:

```bash
nano .env.production
```

Add your:
- SMTP credentials (for email)
- Twilio credentials (for SMS)
- GST API key

### 3. Deploy Backend

// turbo
```bash
./backend-deploy.sh
```

This will:
- Initialize Elastic Beanstalk
- Set environment variables
- Deploy the Node.js application
- Run database migrations

**Time**: 5-10 minutes

### 4. Deploy Frontend

```bash
./frontend-deploy.sh
```

When prompted, enter the backend API URL from step 3.

This will:
- Build production frontend
- Upload to S3
- Invalidate CloudFront cache

**Time**: 3-5 minutes

### 5. Verify Deployment

Test backend:
```bash
curl https://your-backend-url.elasticbeanstalk.com/api/dashboard
```

Test frontend:
Open the CloudFront URL in your browser.

## Manual Deployment Alternative

If you prefer manual deployment or automated scripts fail, see:
- [DEPLOYMENT.md](../DEPLOYMENT.md) - Complete deployment guide
- [AWS_SETUP.md](../AWS_SETUP.md) - Infrastructure details

## Troubleshooting

### Script Permission Denied
```bash
chmod +x infrastructure/*.sh
```

### AWS CLI Not Configured
```bash
aws configure
```

### Database Connection Failed
- Check security groups
- Verify DATABASE_URL in environment variables
- See MAINTENANCE.md troubleshooting section

## Post-Deployment

After successful deployment:

1. **Test all features**:
   - Login (all user types)
   - QR scanning (requires HTTPS ✓)
   - Lead management
   - Email/SMS (if configured)

2. **Set up monitoring**:
   - Configure CloudWatch alarms
   - Set up SNS email notifications
   - Create custom dashboard

3. **Configure backups**:
   - Enable automated RDS backups
   - Enable S3 versioning
   - Document backup procedures

4. **Security**:
   - Review security groups
   - Enable AWS WAF (optional)
   - Set up VPC (recommended)

## Cost Estimate

Expected monthly costs:
- RDS PostgreSQL: ~$15-20
- EC2 (Elastic Beanstalk): ~$15-20
- Load Balancer: ~$16-20
- S3 + CloudFront: ~$2-5
- **Total: ~$50-65/month**

## Support

For deployment issues:
- Check [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed instructions
- Check [MAINTENANCE.md](../MAINTENANCE.md) for troubleshooting
- Review CloudWatch logs
- Check AWS documentation

## Updating Deployment

To deploy updates:

**Backend**:
```bash
cd infrastructure
./backend-deploy.sh
```

**Frontend**:
```bash
cd infrastructure
./frontend-deploy.sh
```

## Rollback

If deployment fails:

**Backend**:
```bash
cd server
eb deploy --version <previous-version>
```

**Frontend**:
- S3 versioning allows easy restore
- Or redeploy previous build
