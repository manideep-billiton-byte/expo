# 🧪 EXPO PROJECT - STAGING ENVIRONMENT

## Created: Thu Jan 29 11:02:14 AM IST 2026

---

## 🔗 Staging URLs

| Resource | URL |
|----------|-----|
| **Frontend (CloudFront)** | https://d2mwpnz04jz48g.cloudfront.net |
| **Backend (EB)** | Will be available after deployment |
| **S3 Bucket** | expo-project-staging-frontend-487003520426 |

---

## 🗄️ Database

| Property | Value |
|----------|-------|
| **Identifier** | expo-project-staging-db |
| **Endpoint** | expo-project-staging-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com |
| **Database** | expo_staging_db |
| **Username** | postgres |
| **Password** | StgPasscbf21979! |
| **Connection String** | postgresql://postgres:StgPasscbf21979!@expo-project-staging-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_staging_db |

---

## 📋 AWS Resources

| Resource | Identifier |
|----------|------------|
| **RDS Database** | expo-project-staging-db |
| **S3 Bucket** | expo-project-staging-frontend-487003520426 |
| **CloudFront (Frontend)** | E1T9QM9Y0GHBYT |
| **EB Application** | expo-project-staging |
| **EB Environment** | expo-project-staging-env |

---

## 🚀 Deployment Commands

### Deploy Backend:
```bash
cd infrastructure
./deploy-staging-backend.sh
```

### Deploy Frontend:
```bash
cd infrastructure
./deploy-staging-frontend.sh
```

---

## ⚠️ Important Notes

1. This is a **SEPARATE** environment from production
2. Database is isolated from production data
3. Perfect for QA testing without affecting production
4. Costs approximately $30-40/month additional

---
