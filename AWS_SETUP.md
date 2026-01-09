# AWS Infrastructure Setup Guide

This document provides detailed information about the AWS infrastructure components and their configuration.

## Infrastructure Components

### 1. RDS PostgreSQL Database

**Purpose**: Stores all application data (organizations, events, exhibitors, visitors, leads)

**Configuration**:
- Instance class: `db.t3.micro` (1 vCPU, 1GB RAM)
- Engine: PostgreSQL 15.4
- Storage: 20GB GP2 SSD (can auto-scale to 1TB)
- Multi-AZ: Disabled (enable for production HA)
- Backup retention: 7 days
- Encryption: At rest (recommended)

**Security**:
- Security group: Allow port 5432 from EB security group only
- Public access: No (access via VPC only in production)
- SSL: Required (`PGSSLMODE=require`)

**Monitoring**:
- CloudWatch metrics: CPU, connections, storage, IOPS
- Enhanced monitoring: Enable for detailed OS metrics

### 2. Elastic Beanstalk (Backend)

**Purpose**: Hosts the Node.js/Express API server

**Configuration**:
- Platform: Node.js 18 running on Amazon Linux 2
- Instance type: `t3.small` (2 vCPU, 2GB RAM)
- Load balancer: Application Load Balancer (ALB)
- Auto scaling: 1-4 instances based on CPU usage
- Deployment policy: Rolling with batch size of 1

**Components**:
- EC2 instances running Node.js
- Application Load Balancer (distributes traffic)
- Auto Scaling Group (scales based on demand)
- CloudWatch Logs (application logs)
- S3 bucket (application versions)

**Health Checks**:
- Path: `/api/dashboard`
- Interval: 30 seconds
- Healthy threshold: 2
- Unhealthy threshold: 3

### 3. S3 Bucket (Frontend Storage)

**Purpose**: Hosts static frontend files (HTML, CSS, JS, images)

**Configuration**:
- Bucket name: `${PROJECT_NAME}-${ENVIRONMENT}-frontend`
- Region: Same as other resources
- Versioning: Enabled (recommended)
- Static website hosting: Enabled
- Index document: `index.html`
- Error document: `index.html` (for SPA routing)

**Bucket Policy**:
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::bucket-name/*"
    }
  ]
}
```

### 4. CloudFront Distribution

**Purpose**: CDN for fast global delivery of frontend with HTTPS

**Configuration**:
- Origin: S3 bucket website endpoint
- Price class: Use all edge locations (or customize)
- Viewer protocol policy: Redirect HTTP to HTTPS
- Allowed HTTP methods: GET, HEAD
- Compress objects: Yes
- Default TTL: 86400 seconds (24 hours)
- Custom error responses:
  - 403 → 200 → `/index.html`
  - 404 → 200 → `/index.html`

**SSL/HTTPS**:
- Certificate: AWS default or custom ACM certificate
- Minimum SSL version: TLSv1.2
- Security policy: Recommended

**Cache Behavior**:
- `index.html`: No cache (`no-cache, no-store, must-revalidate`)
- Other files: Long cache (1 year)

## Network Architecture

### Production VPC Setup (Recommended)

```
VPC (10.0.0.0/16)
├── Public Subnet 1 (10.0.1.0/24) - AZ1
│   └── NAT Gateway 1
├── Public Subnet 2 (10.0.2.0/24) - AZ2
│   └── NAT Gateway 2
├── Private Subnet 1 (10.0.10.0/24) - AZ1
│   ├── EB EC2 Instances
│   └── RDS Primary
└── Private Subnet 2 (10.0.11.0/24) - AZ2
    ├── EB EC2 Instances
    └── RDS Standby (if Multi-AZ)
```

### Security Groups

**ALB Security Group**:
- Inbound: 443 (HTTPS) from 0.0.0.0/0
- Inbound: 80 (HTTP) from 0.0.0.0/0
- Outbound: All to EC2 security group

**EC2 Security Group**:
- Inbound: 8080 from ALB security group
- Outbound: 5432 to RDS security group
- Outbound: 443 to 0.0.0.0/0 (for external APIs)

**RDS Security Group**:
- Inbound: 5432 from EC2 security group
- Outbound: None required

## IAM Roles and Permissions

### EB Service Role
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "elasticbeanstalk:*",
        "ec2:*",
        "elasticloadbalancing:*",
        "autoscaling:*",
        "cloudwatch:*",
        "s3:*",
        "rds:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### EC2 Instance Profile
```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "logs:CreateLogGroup",
        "logs:CreateLogStream",
        "logs:PutLogEvents",
        "s3:GetObject",
        "s3:PutObject"
      ],
      "Resource": "*"
    }
  ]
}
```

## Monitoring and Alerting

### CloudWatch Alarms

**RDS Alarms**:
- CPU > 80% for 5 minutes
- Free storage < 2GB
- Database connections > 80% of max
- Read/Write latency > 100ms

**EB Alarms**:
- Application health degraded
- CPU > 75% for 10 minutes
- 5xx errors > 10 in 5 minutes
- Request latency > 2 seconds

**S3 Alarms**:
- 4xx error rate > 5%
- Total request > expected threshold

### CloudWatch Logs

**Log Groups**:
- `/aws/elasticbeanstalk/expo-project-prod-env/var/log/nodejs/nodejs.log`
- `/aws/elasticbeanstalk/expo-project-prod-env/var/log/eb-engine.log`

**Log Retention**: 30 days (configurable)

## Backup and Disaster Recovery

### RDS Backups

**Automated Backups**:
- Frequency: Daily
- Retention: 7 days (configurable up to 35 days)
- Backup window: 03:00-04:00 UTC (configurable)
- Maintenance window: Sun 04:00-05:00 UTC

**Manual Snapshots**:
```bash
aws rds create-db-snapshot \
  --db-instance-identifier expo-project-prod-db \
  --db-snapshot-identifier manual-backup-$(date +%Y%m%d-%H%M)
```

**Point-in-Time Recovery**:
- Enabled by default
- Can restore to any point within retention period

### Application Backups

**EB Application Versions**:
- Automatic versioning of each deployment
- Stored in S3
- Retention: 200 versions by default

**Frontend Backups**:
- Enable S3 versioning
- All file versions retained
- Can restore previous version easily

### Disaster Recovery Plan

**RPO (Recovery Point Objective)**: 5 minutes
- Database: Point-in-time recovery
- Application: Latest deployment version
- Frontend: S3 versioning

**RTO (Recovery Time Objective)**: 30-60 minutes
1. Restore RDS from snapshot (10-20 min)
2. Update EB environment variables (5 min)
3. Deploy application (5-10 min)
4. Restore frontend from S3 version (2 min)
5. Testing and verification (10-15 min)

## Cost Analysis

### Monthly Costs (ap-south-1 region)

| Service | Configuration | Cost (USD) |
|---------|--------------|------------|
| RDS PostgreSQL | db.t3.micro, 20GB storage | $15-20 |
| EC2 (EB) | t3.small, 1 instance | $15-20 |
| Application Load Balancer | Standard | $16-20 |
| S3 | 5GB storage, 100K requests | $1-2 |
| CloudFront | 10GB transfer | $1-2 |
| Data Transfer | 10GB out | $1-2 |
| **Total** | | **$49-66** |

### Cost Optimization Strategies

1. **Use Reserved Instances**:
   - 1-year RI: ~40% savings
   - 3-year RI: ~60% savings

2. **Right-sizing**:
   - Monitor actual usage
   - Downgrade if underutilized
   - RDS: db.t3.micro → db.t4g.micro (ARM)

3. **Auto Scaling**:
   - Scale down during off-hours
   - Scale to zero for dev/staging environments

4. **S3 Lifecycle Policies**:
   - Move old logs to Glacier after 90 days
   - Delete after 1 year

5. **CloudFront Caching**:
   - Optimize cache hit ratio
   - Reduces origin requests

6. **Database Query Optimization**:
   - Use connection pooling
   - Optimize slow queries
   - Add proper indexes

## Performance Tuning

### Database Optimization

**Connection Pooling** (already configured in `db.js`):
```javascript
const pool = new Pool({
  max: 20,              // Maximum connections
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

**Indexes** (add to schema.sql):
```sql
CREATE INDEX idx_organizations_email ON organizations(email);
CREATE INDEX idx_exhibitors_org_id ON exhibitors(organization_id);
CREATE INDEX idx_visitors_event_id ON visitors(event_id);
CREATE INDEX idx_leads_exhibitor_id ON leads(exhibitor_id);
```

**Query Optimization**:
- Use EXPLAIN ANALYZE for slow queries
- Add indexes on frequently queried columns
- Use pagination for large result sets

### Application Optimization

**Node.js**:
- Enable compression middleware
- Use PM2 for clustering in production
- Set `NODE_ENV=production`
- Optimize bundle size

**EB Configuration**:
```yaml
# .ebextensions/performance.config
option_settings:
  aws:elasticbeanstalk:container:nodejs:
    NodeCommand: "node --max-old-space-size=1536 server.js"
```

### CloudFront Optimization

- Enable compression
- Set appropriate cache headers
- Use query string forwarding selectively
- Enable HTTP/2

## Security Hardening

### Network Security

1. **Use VPC** (not public deployment)
2. **Enable AWS WAF** on CloudFront/ALB
3. **Use Security Groups** restrictively
4. **Enable VPC Flow Logs**

### Application Security

1. **Environment Variables**: Use AWS Secrets Manager
2. **HTTPS Only**: Redirect all HTTP to HTTPS
3. **CORS**: Configure properly in Express
4. **Rate Limiting**: Add rate limiting middleware
5. **SQL Injection**: Use parameterized queries (already done)
6. **XSS Protection**: Sanitize user inputs

### Database Security

1. **Encryption at Rest**: Enable RDS encryption
2. **Encryption in Transit**: Force SSL connections
3. **Least Privilege**: Create app-specific DB user
4. **Audit Logging**: Enable PostgreSQL audit logs
5. **Backup Encryption**: Encrypted snapshots

### Compliance

- **GDPR**: Data encryption, access controls, audit logs
- **PCI DSS**: If processing payments, use AWS-compliant services
- **HIPAA**: Enable HIPAA-eligible services if needed

## Terraform Configuration (Optional)

For Infrastructure as Code:

```hcl
# main.tf
provider "aws" {
  region = "ap-south-1"
}

module "rds" {
  source = "./modules/rds"
  # ...
}

module "elastic_beanstalk" {
  source = "./modules/eb"
  # ...
}

module "cloudfront" {
  source = "./modules/cloudfront"
  # ...
}
```

See `infrastructure/terraform/` directory for complete configuration.

## Maintenance Tasks

### Daily
- Check CloudWatch dashboards
- Review application logs
- Monitor error rates

### Weekly
- Review costs in AWS Cost Explorer
- Check security group rules
- Review RDS slow query logs

### Monthly
- Update dependencies
- Review and rotate access keys
- Test disaster recovery procedures
- Review and optimize costs

### Quarterly
- Review and update IAM policies
- Conduct security audit
- Review backup retention policies
- Update SSL certificates (if custom)

## Useful AWS CLI Commands

```bash
# RDS
aws rds describe-db-instances --db-instance-identifier expo-project-prod-db
aws rds create-db-snapshot --db-instance-identifier expo-project-prod-db --db-snapshot-identifier backup-$(date +%Y%m%d)

# Elastic Beanstalk
aws elasticbeanstalk describe-environments --application-name expo-project-prod
aws elasticbeanstalk update-environment --environment-name expo-project-prod-env --option-settings ...

# S3
aws s3 ls s3://expo-project-prod-frontend
aws s3 sync dist/ s3://expo-project-prod-frontend --delete

# CloudFront
aws cloudfront create-invalidation --distribution-id EXAMPLEID --paths "/*"
aws cloudfront list-distributions --query "DistributionList.Items[*].[Id,DomainName]"

# CloudWatch Logs
aws logs tail /aws/elasticbeanstalk/expo-project-prod-env/var/log/nodejs/nodejs.log --follow
```

## Support Contacts

- **AWS Support**: https://console.aws.amazon.com/support/
- **RDS Documentation**: https://docs.aws.amazon.com/rds/
- **EB Documentation**: https://docs.aws.amazon.com/elasticbeanstalk/
- **CloudFront Documentation**: https://docs.aws.amazon.com/cloudfront/
