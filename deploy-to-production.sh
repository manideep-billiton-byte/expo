#!/bin/bash

################################################################################
# AUTOMATED PRODUCTION DEPLOYMENT SCRIPT
# =====================================
# Deploys both backend and frontend to AWS production in one command
# 
# Usage: bash deploy-to-production.sh
# 
# This script will:
# 1. Verify prerequisites (git, AWS CLI, AWS credentials)
# 2. Deploy backend to Elastic Beanstalk
# 3. Deploy frontend to S3 + CloudFront
# 4. Verify deployment
################################################################################

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration (change these if needed)
AWS_REGION="ap-south-1"
PROJECT_NAME="expo-project"
ENVIRONMENT="prod"
EB_APP_NAME="${PROJECT_NAME}-${ENVIRONMENT}"
EB_ENV_NAME="${PROJECT_NAME}-${ENVIRONMENT}-env"
BACKEND_URL="https://expo-project-prod-env.eba-i8rfmfk2.ap-south-1.elasticbeanstalk.com"
FRONTEND_URL="https://d36p7i1koir3da.cloudfront.net"

# Print header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║          🚀 AUTOMATED PRODUCTION DEPLOYMENT                   ║"
echo "║                                                                ║"
echo "║  Frontend: ${FRONTEND_URL}  ║"
echo "║  Backend:  ${BACKEND_URL}  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Function to print section headers
print_section() {
    echo -e "\n${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# ============================================================================
# STEP 1: PRE-FLIGHT CHECKS
# ============================================================================

print_section "STEP 1: PRE-FLIGHT CHECKS"

# Check if in correct directory
if [ ! -f "package.json" ] || [ ! -d "server" ] || [ ! -d "client" ]; then
    print_error "Not in project root directory!"
    echo "Please run from: /home/billiton/Documents/event_management_hub/all_work/Expo_project"
    exit 1
fi
print_success "In correct project directory"

# Check git status
if [[ $(git status --porcelain) ]]; then
    print_error "Working directory is not clean!"
    echo "Uncommitted changes found:"
    git status --porcelain
    echo ""
    echo "Please commit or stash changes before deploying."
    exit 1
fi
print_success "Git status is clean"

# Check git branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$CURRENT_BRANCH" != "main" ] && [ "$CURRENT_BRANCH" != "master" ] && [ "$CURRENT_BRANCH" != "production" ]; then
    print_warning "You are on branch: $CURRENT_BRANCH (expected: main, master, or production)"
    read -p "Continue anyway? (yes/no): " -r CONTINUE
    if [ "$CONTINUE" != "yes" ]; then
        echo "Deployment cancelled."
        exit 1
    fi
fi
print_success "Git branch is acceptable"

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    print_error "AWS CLI not found. Please install it first."
    exit 1
fi
print_success "AWS CLI is installed"

# Check AWS credentials
if ! aws sts get-caller-identity > /dev/null 2>&1; then
    print_error "AWS credentials not configured."
    echo "Run: aws configure"
    exit 1
fi
print_success "AWS credentials are configured"

# Check EB CLI
if ! command -v eb &> /dev/null; then
    print_warning "EB CLI not found. Installing..."
    pip install awsebcli --upgrade --user
fi
print_success "EB CLI is available"

# Check Node.js
if ! command -v node &> /dev/null; then
    print_error "Node.js not found. Please install it first."
    exit 1
fi
print_success "Node.js is installed"

# ============================================================================
# STEP 2: DEPLOY BACKEND
# ============================================================================

print_section "STEP 2: DEPLOYING BACKEND TO ELASTIC BEANSTALK"

cd server

echo "📋 Configuration:"
echo "   Application: $EB_APP_NAME"
echo "   Environment: $EB_ENV_NAME"
echo "   Region: $AWS_REGION"
echo ""

# Initialize EB if not already done
if [ ! -d ".elasticbeanstalk" ]; then
    print_warning "Initializing Elastic Beanstalk..."
    eb init -p node.js -r "$AWS_REGION" "$EB_APP_NAME" --quiet
fi

# Check if environment exists
ENV_STATUS=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].Status' \
    --output text 2>/dev/null || echo "None")

if [ "$ENV_STATUS" = "None" ]; then
    print_warning "Creating Elastic Beanstalk environment... (this takes 5-10 minutes)"
    eb create "$EB_ENV_NAME" \
        --instance-type t3.small \
        --region "$AWS_REGION" \
        --envvars PORT=8080,NODE_ENV=production \
        --quiet
    
    echo "⏳ Waiting for environment to be ready..."
    aws elasticbeanstalk wait environment-ready \
        --application-name "$EB_APP_NAME" \
        --environment-names "$EB_ENV_NAME" \
        --region "$AWS_REGION"
else
    print_success "Environment already exists: $EB_ENV_NAME"
fi

# Set environment variables from .env.production
if [ -f "../server/.env.production" ]; then
    print_warning "Setting environment variables from .env.production..."
    
    # Read .env.production and build array of KEY=VALUE pairs
    declare -a ENV_PAIRS
    while IFS='=' read -r key value; do
        # Skip comments and empty lines
        [[ $key =~ ^#.*$ ]] && continue
        [[ -z $key ]] && continue
        
        # Remove quotes and whitespace
        value=$(echo "$value" | sed 's/^"//;s/"$//;s/^'\''//;s/'\''$//')
        
        if [ -n "$value" ]; then
            ENV_PAIRS+=("${key}=${value}")
        fi
    done < "../server/.env.production"
    
    if [ ${#ENV_PAIRS[@]} -gt 0 ]; then
        eb setenv "${ENV_PAIRS[@]}"
        echo "⏳ Waiting for environment to update..."
        sleep 10
    fi
else
    print_warning ".env.production not found. Skipping environment variables."
fi

# Deploy backend
echo "📤 Deploying backend code..."
eb deploy "$EB_ENV_NAME" --quiet --message "Production deployment $(date +%Y%m%d-%H%M%S)"

echo "⏳ Waiting for deployment to complete..."
sleep 30

# Get backend URL
BACKEND_URL=$(aws elasticbeanstalk describe-environments \
    --application-name "$EB_APP_NAME" \
    --environment-names "$EB_ENV_NAME" \
    --region "$AWS_REGION" \
    --query 'Environments[0].CNAME' \
    --output text)

print_success "Backend deployed successfully!"
echo "🌐 Backend URL: https://${BACKEND_URL}"

cd ..

# ============================================================================
# STEP 3: DEPLOY FRONTEND
# ============================================================================

print_section "STEP 3: DEPLOYING FRONTEND TO S3 + CLOUDFRONT"

cd client

echo "📋 Configuration:"
echo "   Backend API URL: https://${BACKEND_URL}"
echo "   S3 Bucket: ${PROJECT_NAME}-${ENVIRONMENT}-frontend"
echo ""

# Create production environment file
echo "📝 Creating production environment configuration..."
cat > .env.production <<EOF
VITE_API_URL=https://${BACKEND_URL}
VITE_ENV=production
EOF
print_success ".env.production created"

# Install dependencies
echo "📦 Installing dependencies..."
npm install --silent --no-fund

# Build the application
echo "🔨 Building production bundle..."
npm run build --silent

# Sync to S3
BUCKET_NAME="${PROJECT_NAME}-${ENVIRONMENT}-frontend"
echo "📤 Uploading to S3..."
aws s3 sync dist/ "s3://${BUCKET_NAME}" \
    --delete \
    --cache-control "public, max-age=31536000" \
    --exclude "index.html" \
    --quiet

# Upload index.html with no cache
aws s3 cp dist/index.html "s3://${BUCKET_NAME}/index.html" \
    --cache-control "no-cache, no-store, must-revalidate" \
    --quiet

print_success "Files uploaded to S3"

# Invalidate CloudFront
echo "🔄 Invalidating CloudFront cache..."
CF_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Origins.Items[?DomainName.contains(@, '${BUCKET_NAME}')]].Id | [0]" \
    --output text)

if [ "$CF_ID" != "None" ] && [ -n "$CF_ID" ]; then
    INVALIDATION_ID=$(aws cloudfront create-invalidation \
        --distribution-id "$CF_ID" \
        --paths "/*" \
        --query 'Invalidation.Id' \
        --output text)
    
    print_success "CloudFront invalidation created: $INVALIDATION_ID"
    
    # Get CloudFront domain
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id "$CF_ID" \
        --query 'Distribution.DomainName' \
        --output text)
    
    FRONTEND_URL="https://${CF_DOMAIN}"
else
    print_warning "CloudFront distribution not found."
fi

cd ..

# ============================================================================
# STEP 4: VERIFICATION
# ============================================================================

print_section "STEP 4: VERIFYING DEPLOYMENT"

echo "⏳ Waiting for services to stabilize... (30 seconds)"
sleep 30

echo "🧪 Testing backend API..."
if curl -s "https://${BACKEND_URL}/api/dashboard" > /dev/null 2>&1; then
    print_success "Backend API is responding"
else
    print_warning "Backend API did not respond immediately. May still be starting up."
fi

echo "🧪 Testing frontend..."
if curl -s "${FRONTEND_URL}/" | grep -q "html\|HTML" > /dev/null 2>&1; then
    print_success "Frontend is responding"
else
    print_warning "Frontend did not respond immediately. May still be caching."
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_section "✅ DEPLOYMENT COMPLETE!"

echo ""
echo "🌐 Production URLs:"
echo "   Frontend:  ${FRONTEND_URL}"
echo "   Backend:   https://${BACKEND_URL}"
echo "   Dashboard: https://${BACKEND_URL}/api/dashboard"
echo ""
echo "📝 Next Steps:"
echo "   1. Open ${FRONTEND_URL} in your browser"
echo "   2. Test login with your credentials"
echo "   3. Create a test event to verify end-to-end functionality"
echo "   4. Monitor logs: cd server && eb logs --stream"
echo ""
echo "⏱️  Note: CloudFront may take 2-3 minutes to fully propagate."
echo ""
echo "📚 Full documentation: PRODUCTION_DEPLOYMENT_GUIDE.md"
echo ""
