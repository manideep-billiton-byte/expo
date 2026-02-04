# 🎯 Quick Reference - Staging vs Production

## URLs Comparison

| Environment | Resource | URL |
|-------------|----------|-----|
| **PRODUCTION** | Frontend | https://d36p7i1koir3da.cloudfront.net |
| **PRODUCTION** | Backend | https://d3cgzphanxg4ax.cloudfront.net |
| **PRODUCTION** | Database | expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com |
| | | |
| **STAGING** | Frontend | https://[will-be-generated].cloudfront.net |
| **STAGING** | Backend | http://expo-project-staging-env.[id].elasticbeanstalk.com |
| **STAGING** | Database | expo-project-staging-db.[id].ap-south-1.rds.amazonaws.com |
| | | |
| **LOCAL TEST** | Frontend | http://localhost:5173 |
| **LOCAL TEST** | Backend | https://splurgy-ontogenetic-quintin.ngrok-free.dev |
| **LOCAL TEST** | Database | Uses production DB ⚠️ |

---

## Command Reference

### Setup Staging Environment
```bash
cd infrastructure
./setup-staging-environment.sh
```

### Deploy Staging Backend
```bash
cd infrastructure
./deploy-staging-backend.sh
```

### Deploy Staging Frontend
```bash
cd infrastructure
./deploy-staging-frontend.sh
```

### View Staging Logs
```bash
cd infrastructure/server
eb logs
```

### SSH to Staging Backend
```bash
cd infrastructure/server
eb ssh
```

---

## Database Commands

### Production Database
```bash
psql "postgresql://postgres:EventPass123!@expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_db"
```

### Staging Database
```bash
# After setup, get URL from STAGING_INFO.md
psql "postgresql://postgres:[PASSWORD]@expo-project-staging-db.[ID].ap-south-1.rds.amazonaws.com:5432/expo_staging_db"
```

---

## Testing Endpoints

### Production API
```bash
curl https://d3cgzphanxg4ax.cloudfront.net/api/dashboard
curl https://d3cgzphanxg4ax.cloudfront.net/api/events
```

### Staging API
```bash
# Get URL from deployment output
curl http://expo-project-staging-env.[ID].elasticbeanstalk.com/api/dashboard
curl http://expo-project-staging-env.[ID].elasticbeanstalk.com/api/events
```

### Local Testing API
```bash
curl https://splurgy-ontogenetic-quintin.ngrok-free.dev/api/dashboard
curl http://localhost:5001/api/dashboard
```

---

## Which Environment to Use?

| Scenario | Use Environment |
|----------|----------------|
| Live customer traffic | ✅ Production |
| QA testing of new features | ✅ Staging |
| Quick API test during development | ✅ Local Testing (ngrok) |
| Running automated test suites | ✅ Staging |
| Demonstrating to stakeholders | ✅ Staging |
| Load testing | ✅ Staging |
| Breaking changes testing | ✅ Staging |
| Frontend development | ✅ Local |

---

## Cost Summary

| Environment | Monthly Cost |
|-------------|--------------|
| Production | $30-50 |
| Staging | $30-40 |
| Local Testing | Free |

---

## Important Notes

⚠️ **Local Testing (ngrok)**: Uses production database - changes affect real data
✅ **Staging**: Completely isolated - safe for any testing
✅ **Production**: Only deploy tested & approved changes

---

*Quick Reference - Last Updated: 2026-01-28*
