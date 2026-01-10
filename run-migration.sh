#!/bin/bash

# Migration execution script for Elastic Beanstalk
# This script will be run directly on the EB instance

echo "=== Starting Database Migration ==="

# Set environment variables
export DATABASE_URL="postgresql://postgres:EventPass123!@expo-project-prod-db.cvmk8awyksm7.ap-south-1.rds.amazonaws.com:5432/expo_db"
export PGSSLMODE="require"

# Download migration package from S3
echo "Downloading migration package..."
aws s3 cp s3://expo-project-prod-frontend/scripts/migration-package.zip /tmp/migration.zip

# Extract
echo "Extracting..."
cd /tmp
unzip -o migration.zip

# Run migration
echo "Running migration..."
node run-migration.js

echo "=== Migration Complete ===" 
