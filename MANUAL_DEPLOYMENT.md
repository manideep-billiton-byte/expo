# AWS Deployment - Manual Setup Guide (Simplified)

## Issue Encountered

The automated deployment script encountered an issue creating the RDS database. AWS deployments can fail for various reasons:
- AWS account limits/restrictions
- VPC/Security group issues  
- Region-specific constraints
- IAM permission limitations

## Recommended Approach: Use AWS Console (Manual)

For the most reliable deployment, I recommend using the AWS Console step-by-step:

### Step 1: Create RDS Database (10 min)

1. Go to: https://console.aws.amazon.com/rds
2. Click **"Create database"**
3. Settings:
   - Engine: PostgreSQL 15.4
   - Template: **Free tier** (or Production for production use)
   - DB instance identifier: `expo-project-prod-db`
   - Master username: `postgres`
   - Master password: `ExpoDb2026!Secure#Pass` (or your own secure password)
   - DB instance class: db.t3.micro
   - Storage: 20 GB
   - **Public access: Yes** (for initial setup)
4. Click **"Create database"**
5. **Wait 5-10 minutes** for creation
6. **Copy the endpoint** once available (looks like `expo-project-prod-db.xxx.ap-south-1.rds.amazonaws.com`)

---

### Step 2: Create S3 Bucket (2 min)

1. Go to: https://console.aws.amazon.com/s3
2. Click **"Create bucket"**
3. Settings:
   - Bucket name: `expo-project-prod-frontend` (must be globally unique - add random numbers if needed)
   - Region: **ap-south-1** (Mumbai)
   - **Uncheck** "Block all public access"
   - Acknowledge the warning
4. Click **"Create bucket"**
5.  Configure static hosting:
   - Click on your bucket name
   - Go to **Properties** tab
   - Scroll to **Static website hosting**
   - Click **Edit**
   - Enable: **Enable**
   - Index document: `index.html`
   - Error document: `index.html`
   - Save changes

6. Set bucket policy (Permissions tab):
   - Click **Bucket policy** → Edit
   - Paste this (replace `BUCKET-NAME` with your actual bucket name):
   
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::BUCKET-NAME/*"
    }
  ]
}
```

---

### Step 3: Deploy Backend to Elastic Beanstalk (15 min)

#### 3.1: Prepare backend package

```bash
cd /home/billiton/Documents/Billiton/Expo_project/server
zip -r ../backend.zip . -x "node_modules/*" ".env" "*.log" ".git/*"
```

#### 3.2: Create EB application

1. Go to: https://console.aws.amazon.com/elasticbeanstalk
2. Click **"Create application"**
3. Settings:
   - Application name: `expo-project-prod`
   - Platform: **Node.js**
   - Platform branch: **Node.js 18 running on 64bit Amazon Linux 2**  
   - Platform version: (latest)
   - Application code: **Upload your code**
   - Click **"Choose file"** → select `backend.zip`

#### 3.3: Configure environment

Click **"Configure more options"**:

**Software** → Edit → Environment properties, add:
```
PORT=8080
NODE_ENV=production
DATABASE_URL=postgresql://postgres:ExpoDb2026!Secure#Pass@YOUR-RDS-ENDPOINT:5432/expo_db
PGSSLMODE=require

(Add your SMTP, Twilio, GST credentials if available)
```

**Capacity** → Edit:
- Environment type: Load balanced
- Instances: Min 1, Max 4
- Instance type: t3.small

Click **"Create environment"** → Wait 10 minutes

---

### Step 4: Deploy Frontend (5 min)

#### 4.1: Build frontend

```bash
cd /home/billiton/Documents/Billiton/Expo_project/client

# Create .env.production
cat > .env.production <<EOF
VITE_API_URL=http://YOUR-EB-URL.elasticbeanstalk.com
VITE_ENV=production
EOF

# Build
npm run build
```

#### 4.2: Upload to S3

```bash
aws s3 sync dist/ s3://YOUR-BUCKET-NAME/ --delete
```

---

### Step 5: Access Your Application

- **Frontend**: http://YOUR-BUCKET-NAME.s3-website-ap-south-1.amazonaws.com
- **Backend API**: http://YOUR-EB-URL.elasticbeanstalk.com/api/dashboard

---

## Alternative: Simpler Local/Cloud Hosting

If AWS is too complex, consider:

1. **Heroku** (easier, has free tier)
2. **Railway.app** (simple, good for Node.js + PostgreSQL)
3. **Render.com** (free tier available)
4. **DigitalOcean App Platform** (straightforward)

All of these have simpler deployment processes with better error handling.

---

## What Went Wrong?

The AWS CLI RDS creation likely failed due to:
- Missing default VPC
- Security group configuration  
- IAM permission restrictions
- AWS account verification requirements

AWS deployments often require:
- Verified AWS account with payment method
- Proper IAM permissionsions
- VPC configuration
- Security group setup

Manual deployment via console is more reliable for first-time AWS users.

---

## Need Help?

1. Check AWS Support (if you have a support plan)
2. Try the manual deployment steps above
3. Consider simpler hosting platforms
4. Review AWS documentation for your specific error
