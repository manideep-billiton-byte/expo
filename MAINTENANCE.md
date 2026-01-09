# Maintenance and Operations Guide

This guide covers day-to-day maintenance, troubleshooting, and operations for the Expo platform on AWS.

## Table of Contents

1. [Daily Operations](#daily-operations)
2. [Monitoring](#monitoring)
3. [Troubleshooting](#troubleshooting)
4. [Common Tasks](#common-tasks)
5. [Emergency Procedures](#emergency-procedures)
6. [Performance Optimization](#performance-optimization)

## Daily Operations

### Morning Checklist

- [ ] Check application health in EB console
- [ ] Review CloudWatch alarms (should be none)
- [ ] Check RDS performance metrics
- [ ] Review application logs for errors
- [ ] Verify backup completion

### Commands

```bash
# Check backend health
curl https://your-backend-url.elasticbeanstalk.com/api/dashboard

# Check EB environment status
eb status

# Check RDS connection
psql $DATABASE_URL -c "SELECT NOW(), COUNT(*) FROM organizations;"

# View recent logs
eb logs --stream
```

## Monitoring

### Key Metrics to Watch

**Backend (Elastic Beanstalk)**:
- Environment Health: Should be "Ok" (green)
- Response Time: < 500ms for API calls
- 5xx Errors: Should be 0
- CPU Utilization: < 60%
- Memory: < 70%

**Database (RDS)**:
- CPU Utilization: < 70%
- Database Connections: < 80% of max
- Free Storage: > 5GB
- Read/Write Latency: < 50ms

**Frontend (S3/CloudFront)**:
- 4xx Error Rate: < 1%
- Total Error Rate: < 0.1%
- Cache Hit Ratio: > 80%

### CloudWatch Dashboards

Create a custom dashboard with:
```bash
# Create dashboard (AWS Console recommended for visual setup)
# Or use AWS CLI to import dashboard JSON
aws cloudwatch put-dashboard \
  --dashboard-name ExpoProjectMonitoring \
  --dashboard-body file://dashboard-config.json
```

### Setting Up Alerts

**Critical Alerts** (immediate action):
- Application health degraded
- Database CPU > 90%
- 5xx error rate > 5%
- Database storage < 2GB

**Warning Alerts** (monitor):
- CPU > 70% for 10 minutes
- Response time > 1 second
- Cache hit ratio < 70%

**Configure SNS for email alerts**:
```bash
# Create SNS topic
aws sns create-topic --name expo-alerts

# Subscribe your email
aws sns subscribe \
  --topic-arn arn:aws:sns:ap-south-1:123456789:expo-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com
```

## Troubleshooting

### Backend Issues

#### Application Won't Start

**Symptoms**: Environment health is degraded, instances failing

**Steps**:
1. Check EB logs:
   ```bash
   eb logs
   ```

2. Common causes:
   - Missing environment variables
   - Database connection failure
   - Syntax error in code
   - Port mismatch (should be 8080)

3. Fix and redeploy:
   ```bash
   eb deploy
   ```

#### Database Connection Errors

**Symptoms**: "connection refused" or "timeout" errors

**Steps**:
1. Verify DATABASE_URL:
   ```bash
   eb printenv | grep DATABASE
   ```

2. Check RDS status:
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier expo-project-prod-db
   ```

3. Test connection from EB instance:
   ```bash
   eb ssh
   psql $DATABASE_URL -c "SELECT 1;"
   ```

4. Check security groups:
   - RDS security group allows 5432 from EB security group
   - EB can reach RDS (check VPC/subnet routing)

#### High Memory Usage

**Symptoms**: Instances restarting, slow performance

**Steps**:
1. Check memory metrics in CloudWatch

2. SSH into instance and check:
   ```bash
   eb ssh
   top
   free -h
   pm2 logs  # If using PM2
   ```

3. Solutions:
   - Upgrade instance type (t3.small → t3.medium)
   - Optimize database queries (add connection pooling)
   - Fix memory leaks in code

#### Slow API Response

**Symptoms**: API calls taking > 2 seconds

**Steps**:
1. Check database query performance:
   ```sql
   SELECT * FROM pg_stat_statements 
   ORDER BY mean_exec_time DESC 
   LIMIT 10;
   ```

2. Enable slow query logging:
   - RDS Console → Parameter Groups
   - Set `log_min_duration_statement = 1000` (log queries > 1s)

3. Add indexes for frequently queried columns

4. Enable database connection pooling (already configured)

### Frontend Issues

#### Blank Page / 404 Errors

**Symptoms**: Frontend shows blank white page or 404

**Steps**:
1. Check browser console for errors

2. Verify CloudFront error responses:
   - 404 should redirect to `/index.html` with 200 status

3. Check S3 bucket policy allows public read

4. Verify index.html exists:
   ```bash
   aws s3 ls s3://expo-project-prod-frontend/
   ```

5. Clear CloudFront cache:
   ```bash
   aws cloudfront create-invalidation \
     --distribution-id YOUR_DIST_ID \
     --paths "/*"
   ```

#### API Calls Failing (CORS)

**Symptoms**: CORS errors in browser console

**Steps**:
1. Verify backend CORS configuration in `server.js`:
   ```javascript
   app.use(cors({
     origin: 'https://your-cloudfront-domain.cloudfront.net',
     credentials: true
   }));
   ```

2. Check .env.production has correct API URL:
   ```bash
   cat client/.env.production
   ```

3. Rebuild and redeploy frontend

#### QR Scanner Not Working

**Symptoms**: Camera access denied or not loading

**Steps**:
1. Verify HTTPS is enabled (CloudFront provides this)

2. Check browser permissions:
   - Site settings → Camera → Allow

3. Test on different browser/device

4. Check browser console for specific errors

### Database Issues

#### High CPU Usage

**Symptoms**: RDS CPU > 80%, slow queries

**Steps**:
1. Identify slow queries:
   ```sql
   SELECT query, calls, total_time, mean_time
   FROM pg_stat_statements
   ORDER BY mean_time DESC
   LIMIT 20;
   ```

2. Add missing indexes:
   ```sql
   SELECT schemaname, tablename, indexname
   FROM pg_indexes
   WHERE schemaname = 'public';
   ```

3. Optimize queries:
   ```sql
   EXPLAIN ANALYZE SELECT ...;
   ```

4. If needed, upgrade instance:
   - db.t3.micro → db.t3.small

#### Storage Full

**Symptoms**: Database writes failing, "disk full" errors

**Steps**:
1. Check current storage:
   ```bash
   aws rds describe-db-instances \
     --db-instance-identifier expo-project-prod-db \
     --query 'DBInstances[0].[AllocatedStorage,FreeStorageSpace]'
   ```

2. Immediately increase storage:
   ```bash
   aws rds modify-db-instance \
     --db-instance-identifier expo-project-prod-db \
     --allocated-storage 40 \
     --apply-immediately
   ```

3. Enable storage autoscaling:
   - RDS Console → Storage → Enable Storage Autoscaling

4. Clean up old data if needed

#### Connection Limit Reached

**Symptoms**: "too many connections" error

**Steps**:
1. Check current connections:
   ```sql
   SELECT count(*) FROM pg_stat_activity;
   ```

2. Check max connections:
   ```sql
   SHOW max_connections;
   ```

3. Kill idle connections:
   ```sql
   SELECT pg_terminate_backend(pid)
   FROM pg_stat_activity
   WHERE state = 'idle'
   AND state_change < NOW() - INTERVAL '10 minutes';
   ```

4. Check application connection pooling is working

5. If needed, modify parameter group to increase max_connections

## Common Tasks

### Deploy New Version

#### Backend
```bash
cd infrastructure
./backend-deploy.sh
```

Or manually:
```bash
cd server
eb deploy
```

#### Frontend
```bash
cd infrastructure
./frontend-deploy.sh
```

Or manually:
```bash
cd client
npm run build
aws s3 sync dist/ s3://expo-project-prod-frontend --delete
aws cloudfront create-invalidation --distribution-id ID --paths "/*"
```

### Update Environment Variables

```bash
# Set single variable
eb setenv API_KEY=new_value

# Set multiple variables
eb setenv VAR1=value1 VAR2=value2 VAR3=value3

# Restart to apply
eb restart
```

### Scale Application

```bash
# Scale to specific number of instances
eb scale 2

# Configure auto-scaling (EB Console)
# Environment → Configuration → Capacity
# Min: 1, Max: 4
# Scaling triggers: CPU > 70%
```

### Database Maintenance

#### Run Migrations
```bash
# Migrations run automatically on deploy
# To run manually:
eb ssh
cd /var/app/current
psql $DATABASE_URL < migrations/new_migration.sql
```

#### Create Backup
```bash
aws rds create-db-snapshot \
  --db-instance-identifier expo-project-prod-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d-%H%M)
```

#### Restore from Backup
```bash
# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier expo-project-prod-db

# Restore
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier expo-project-prod-db-restored \
  --db-snapshot-identifier snapshot-name

# Update DATABASE_URL to new endpoint
```

### View Logs

```bash
# Real-time logs
eb logs --stream

# Download recent logs
eb logs

# CloudWatch Logs
aws logs tail /aws/elasticbeanstalk/expo-project-prod-env/var/log/nodejs/nodejs.log --follow
```

### SSH into Instance

```bash
# Connect to running instance
eb ssh

# Once connected, useful commands:
pm2 logs        # If using PM2
journalctl -u web.service -f
top
df -h
```

## Emergency Procedures

### Application Down - Complete Outage

**Steps**:
1. Check EB environment status:
   ```bash
   eb status
   ```

2. Check recent deployments:
   ```bash
   eb history
   ```

3. If recent deployment caused it, rollback:
   ```bash
   eb deploy --version <previous-version>
   ```

4. If database issue, check RDS status:
   ```bash
   aws rds describe-db-instances --db-instance-identifier expo-project-prod-db
   ```

5. Check CloudWatch logs for errors

6. If all else fails, rebuild environment:
   ```bash
   eb rebuild
   ```

### Database Corruption

**Steps**:
1. Stop application writes:
   ```bash
   eb scale 0
   ```

2. Create snapshot immediately:
   ```bash
   aws rds create-db-snapshot \
     --db-instance-identifier expo-project-prod-db \
     --db-snapshot-identifier emergency-backup-$(date +%Y%m%d-%H%M)
   ```

3. Restore from latest good snapshot

4. Verify data integrity

5. Resume application:
   ```bash
   eb scale 1
   ```

### Security Breach

**Steps**:
1. Immediately revoke compromised credentials

2. Change all passwords:
   - Database master password
   - Application secrets
   - API keys

3. Review CloudTrail logs for unauthorized actions

4. Check application logs for suspicious activity

5. Update security groups to block attacker

6. Enable AWS WAF if not already enabled

7. Notify stakeholders

8. Conduct post-incident review

### High Bill Alert

**Steps**:
1. Check AWS Cost Explorer for source:
   ```bash
   aws ce get-cost-and-usage --time-period Start=2026-01-01,End=2026-01-31 --granularity MONTHLY --metrics BlendedCost
   ```

2. Common causes:
   - Data transfer (CloudFront)
   - Running unnecessary resources
   - RDS instance running 24/7
   - EB auto-scaling triggered excessively

3. Immediate actions:
   - Scale down EB instances
   - Stop dev/staging environments
   - Review and optimize CloudFront usage

## Performance Optimization

### Database Performance

```sql
-- Create indexes
CREATE INDEX idx_organizations_email ON organizations(email);
CREATE INDEX idx_exhibitors_event ON exhibitors(event_id);
CREATE INDEX idx_leads_created ON leads(created_at DESC);

-- Analyze tables
ANALYZE organizations;
ANALYZE exhibitors;
ANALYZE visitors;
ANALYZE leads;

-- Vacuum to reclaim space
VACUUM ANALYZE;
```

### Application Performance

```javascript
// Enable compression
const compression = require('compression');
app.use(compression());

// Cache static responses
app.use(express.static('public', {
  maxAge: '1d',
  etag: true
}));

// Connection pooling (already configured)
const pool = new Pool({ max: 20 });
```

### CloudFront Optimization

```bash
# Set cache headers in S3
aws s3 cp dist/ s3://bucket/ \
  --recursive \
  --cache-control "public, max-age=31536000" \
  --exclude "index.html"

# index.html with no cache
aws s3 cp dist/index.html s3://bucket/index.html \
  --cache-control "no-cache,no-store,must-revalidate"
```

## Regular Maintenance Schedule

| Frequency | Task |
|-----------|------|
| Daily | Check dashboards, review logs |
| Weekly | Review costs, backup verification |
| Monthly | Update dependencies, security patches |
| Quarterly | Disaster recovery test, security audit |
| Annually | Review architecture, cost optimization |

## Useful Resources

- [AWS Status Page](https://status.aws.amazon.com/)
- [EB Troubleshooting Guide](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/troubleshooting.html)
- [RDS Best Practices](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/CHAP_BestPractices.html)
- [CloudFront Troubleshooting](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/troubleshooting.html)

## Contact Information

**AWS Support Tiers**:
- Basic (Free): Forums, documentation
- Developer ($29/month): Email support, 12-24h response
- Business ($100+/month): 24/7 phone/chat, <1h for urgent issues

**Emergency Contacts**:
- AWS Support: https://console.aws.amazon.com/support/
- On-call Engineer: [Your contact]
- Team Lead: [Your contact]
