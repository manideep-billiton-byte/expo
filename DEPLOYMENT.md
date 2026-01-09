# AWS Deployment Guide - Expo Project

This guide provides step-by-step instructions for deploying the Expo event management platform to AWS.

## Prerequisites

- AWS Account with billing enabled
- AWS CLI installed and configured
- Node.js 18+ and npm installed
- PostgreSQL client (optional, for database verification)

## Architecture Overview

The deployment consists of three main components:

1. **Frontend**: React/Vite → AWS S3 + CloudFront
2. **Backend**: Node.js/Express → AWS Elastic Beanstalk
3. **Database**: PostgreSQL → AWS RDS

## Quick Start (Automated Deployment)

### Step 1: Install AWS CLI

```bash
# On Linux/macOS
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Verify installation
aws --version
```

### Step 2: Configure AWS Credentials

```bash
aws configure
```

Enter your:
- AWS Access Key ID
- AWS Secret Access Key
- Default region (e.g., `ap-south-1`)
- Default output format (use `json`)

### Step 3: Run Infrastructure Setup

```bash
cd infrastructure
./aws-setup.sh
```

This script will:
- Create RDS PostgreSQL database
- Create S3 bucket for frontend
- Create CloudFront distribution
- Initialize Elastic Beanstalk application
- Generate `.env.production` file

**Note**: RDS database creation takes 5-10 minutes.

### Step 4: Configure Environment Variables

Edit the generated `.env.production` file and add your credentials:

```bash
nano .env.production
```

Add:
- SMTP credentials (for email)
- Twilio credentials (for SMS)
- GST API key (for verification)

### Step 5: Deploy Backend

```bash
./backend-deploy.sh
```

This will:
- Initialize Elastic Beanstalk
- Create or update the environment
- Deploy the Node.js application
- Run database migrations automatically

### Step 6: Deploy Frontend

```bash
./frontend-deploy.sh
```

When prompted, enter the backend API URL from the previous step.

This will:
- Build the production frontend
- Upload to S3
- Invalidate CloudFront cache

### Step 7: Verify Deployment

Test the backend:
```bash
curl https://your-backend-url.elasticbeanstalk.com/api/dashboard
```

Test the frontend:
Open the CloudFront URL in your browser.

## Manual Deployment (AWS Console)

### 1. Create RDS Database

1. Go to [AWS RDS Console](https://console.aws.amazon.com/rds)
2. Click "Create database"
3. Choose:
   - Engine: PostgreSQL 15.4
   - Template: Free tier (or Production for production)
   - DB instance identifier: `expo-project-prod-db`
   - Master username: `postgres`
   - Master password: (choose a strong password)
   - DB instance class: `db.t3.micro`
   - Storage: 20 GB
   - Public access: Yes (for initial setup)
4. Click "Create database"
5. Wait 5-10 minutes for creation
6. Note the endpoint URL

### 2. Create S3 Bucket

1. Go to [AWS S3 Console](https://console.aws.amazon.com/s3)
2. Click "Create bucket"
3. Bucket name: `expo-project-prod-frontend`
4. Region: (same as your RDS)
5. **Uncheck** "Block all public access"
6. Click "Create bucket"
7. Go to bucket → Properties → Static website hosting
8. Enable static website hosting
9. Index document: `index.html`
10. Error document: `index.html`

### 3. Set Bucket Policy

1. Go to bucket → Permissions → Bucket policy
2. Add this policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::expo-project-prod-frontend/*"
    }
  ]
}
```

### 4. Create CloudFront Distribution

1. Go to [AWS CloudFront Console](https://console.aws.amazon.com/cloudfront)
2. Click "Create distribution"
3. Origin domain: (select your S3 bucket website endpoint)
4. Viewer protocol policy: Redirect HTTP to HTTPS
5. Default root object: `index.html`
6. Custom error responses:
   - Error code: 404
   - Response page path: `/index.html`
   - Response code: 200
7. Click "Create distribution"
8. Wait 10-15 minutes for deployment
9. Note the distribution domain name

### 5. Deploy Backend to Elastic Beanstalk

1. Go to [AWS Elastic Beanstalk Console](https://console.aws.amazon.com/elasticbeanstalk)
2. Click "Create application"
3. Application name: `expo-project-prod`
4. Platform: Node.js
5. Platform branch: Node.js 18
6. Upload your code:
   ```bash
   cd server
   zip -r ../backend.zip . -x "node_modules/*" ".env" "*.log"
   ```
7. Upload `backend.zip`
8. Click "Configure more options"
9. Software → Edit → Environment properties:
   - Add all variables from `.env.production`
10. Click "Create environment"

### 6. Build and Deploy Frontend

```bash
cd client

# Create production environment file
cat > .env.production <<EOF
VITE_API_URL=https://your-backend-url.elasticbeanstalk.com
VITE_ENV=production
EOF

# Install and build
npm install
npm run build

# Upload to S3
aws s3 sync dist/ s3://expo-project-prod-frontend --delete
```

## Environment Variables Reference

### Backend (.env.production)

```bash
# Server
PORT=8080
NODE_ENV=production
INVITE_LINK_BASE=https://your-cloudfront-url.cloudfront.net

# Database (from RDS)
DATABASE_URL=postgresql://postgres:password@your-rds-endpoint:5432/expo_db
PGSSLMODE=require

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="Expo Platform <noreply@yourcompany.com>"

# SMS (Twilio)
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your-auth-token
TWILIO_FROM=+1234567890

# GST Verification
GST_API_KEY=your-gst-api-key
```

### Frontend (.env.production)

```bash
VITE_API_URL=https://your-backend-url.elasticbeanstalk.com
VITE_ENV=production
```

## Database Migrations

Migrations run automatically on backend deployment. To run manually:

```bash
# Connect to database
psql $DATABASE_URL

# Or use the schema file
psql $DATABASE_URL < server/schema.sql
```

## Monitoring and Logs

### Backend Logs
```bash
# EB CLI
eb logs

# Or AWS Console
# Elastic Beanstalk → Environment → Logs → Request Logs
```

### Frontend Logs
CloudFront logs can be enabled in the distribution settings.

### Database Monitoring
RDS Console → Monitoring tab shows CPU, connections, storage.

## Troubleshooting

### Backend Health Check Fails

1. Check environment variables are set correctly
2. Check database connection:
   ```bash
   eb ssh
   curl localhost:8080/api/dashboard
   ```
3. Check logs: `eb logs`

### Frontend Shows Blank Page

1. Check browser console for errors
2. Verify API URL in `.env.production`
3. Check CloudFront invalidation completed
4. Check S3 bucket policy allows public read

### Database Connection Timeout

1. Check security group allows inbound on port 5432
2. Verify `DATABASE_URL` is correct
3. Check RDS is publicly accessible (or use VPC if configured)

### QR Scanner Not Working

1. Ensure HTTPS is enabled (CloudFront provides this)
2. Check camera permissions in browser
3. Test on mobile device

## Cost Optimization

### Free Tier Eligible
- RDS db.t3.micro: 750 hours/month
- EC2 t2.micro (EB): 750 hours/month
- S3: 5GB storage, 20,000 GET requests
- CloudFront: 50GB data transfer out

### Estimated Costs (After Free Tier)
- RDS db.t3.micro: ~$15/month
- EB EC2 t3.small: ~$15/month
- S3 + CloudFront: ~$1-5/month
- **Total: ~$30-50/month**

### Cost Saving Tips
1. Stop environments when not in use:
   ```bash
   eb scale 0  # Stop instances
   eb scale 1  # Start instances
   ```
2. Use RDS snapshots and delete database when not needed
3. Set up CloudWatch alarms for unexpected usage

## Scaling

### Backend Scaling
```bash
# Scale to multiple instances
eb scale 2

# Configure auto-scaling in EB console
# Environment → Configuration → Capacity → Auto Scaling
```

### Database Scaling
- Vertical: Change instance class in RDS console
- Horizontal: Set up read replicas for read-heavy workloads

## Security Best Practices

1. **Enable MFA** on AWS account
2. **Use IAM roles** instead of access keys where possible
3. **Rotate credentials** regularly
4. **Enable RDS encryption** at rest
5. **Use AWS Secrets Manager** for sensitive data
6. **Set up VPC** for production (database not publicly accessible)
7. **Enable CloudTrail** for audit logging
8. **Configure security groups** to allow only necessary traffic
9. **Enable HTTPS** only (CloudFront does this automatically)
10. **Regular backups** - enable automated RDS backups

## Backup and Disaster Recovery

### Database Backups
```bash
# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier expo-project-prod-db \
  --db-snapshot-identifier expo-backup-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier expo-project-prod-db-restored \
  --db-snapshot-identifier expo-backup-20260108
```

### Application Backups
EB automatically versions your application. To rollback:
```bash
eb deploy --version <version-label>
```

### Frontend Backups
S3 versioning can be enabled:
```bash
aws s3api put-bucket-versioning \
  --bucket expo-project-prod-frontend \
  --versioning-configuration Status=Enabled
```

## CI/CD Integration

For automated deployments, consider:

### GitHub Actions Example

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to EB
        run: |
          cd infrastructure
          ./backend-deploy.sh
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to S3
        run: |
          cd infrastructure
          ./frontend-deploy.sh
```

## Custom Domain Setup

### 1. Register Domain
Use Route 53 or external registrar.

### 2. SSL Certificate
```bash
# Request certificate in ACM (must be in us-east-1 for CloudFront)
aws acm request-certificate \
  --domain-name yourdomain.com \
  --validation-method DNS \
  --region us-east-1
```

### 3. Update CloudFront
- Add alternate domain name (CNAME)
- Select SSL certificate

### 4. Update Route 53
- Create A record pointing to CloudFront distribution

## Support and Resources

- [AWS Documentation](https://docs.aws.amazon.com/)
- [Elastic Beanstalk Node.js Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-nodejs.html)
- [RDS PostgreSQL Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_PostgreSQL.html)
- [CloudFront Guide](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)

## Next Steps

After successful deployment:

1. ✅ Test all application features
2. ✅ Set up monitoring and alerts
3. ✅ Configure custom domain
4. ✅ Set up CI/CD pipeline
5. ✅ Enable automated backups
6. ✅ Document your specific configuration
7. ✅ Train team on deployment process
