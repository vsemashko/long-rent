#!/bin/bash

# Pre-Deployment Verification Script
# Checks all prerequisites before deploying to production

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Counters
CHECKS_PASSED=0
CHECKS_FAILED=0
CHECKS_WARNING=0
TOTAL_CHECKS=0

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((CHECKS_PASSED++))
    ((TOTAL_CHECKS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((CHECKS_FAILED++))
    ((TOTAL_CHECKS++))
}

check_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((CHECKS_WARNING++))
    ((TOTAL_CHECKS++))
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Start verification
clear
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║        HomeMore Production Deployment Verification          ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "This script will verify all prerequisites for production deployment."
echo ""

# 1. Environment Files
print_header "1. Environment Configuration"

if [ -f ".env.production" ]; then
    check_pass "Found .env.production file"

    # Check for required variables
    REQUIRED_VARS=(
        "DATABASE_URL"
        "DATABASE_URL_UNPOOLED"
        "REDIS_URL"
        "JWT_SECRET"
        "JWT_REFRESH_SECRET"
        "SESSION_SECRET"
        "AWS_S3_REGION"
        "AWS_S3_BUCKET"
        "AWS_S3_ACCESS_KEY_ID"
        "AWS_S3_SECRET_ACCESS_KEY"
        "STRIPE_PUBLIC_KEY"
        "STRIPE_SECRET_KEY"
        "SENDGRID_API_KEY"
        "EMAIL_FROM"
        "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
        "NEXT_PUBLIC_API_URL"
    )

    MISSING_VARS=()
    for var in "${REQUIRED_VARS[@]}"; do
        if grep -q "^${var}=" .env.production && ! grep -q "^${var}=\"\"" .env.production && ! grep -q "^${var}=$" .env.production; then
            value=$(grep "^${var}=" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
            if [[ ! -z "$value" ]] && [[ "$value" != "REPLACE_WITH"* ]] && [[ "$value" != "your-"* ]] && [[ "$value" != "xxx"* ]]; then
                check_pass "${var} is set"
            else
                check_fail "${var} is not configured (contains placeholder)"
                MISSING_VARS+=("$var")
            fi
        else
            check_fail "${var} is missing or empty"
            MISSING_VARS+=("$var")
        fi
    done

    # Check JWT secret strength
    if grep -q "^JWT_SECRET=" .env.production; then
        JWT_SECRET=$(grep "^JWT_SECRET=" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [ ${#JWT_SECRET} -ge 64 ]; then
            check_pass "JWT_SECRET is strong (${#JWT_SECRET} characters)"
        else
            check_warning "JWT_SECRET is weak (${#JWT_SECRET} characters, should be 64+)"
        fi
    fi

else
    check_fail ".env.production file not found"
    check_info "Run: cp .env.production.template .env.production"
    check_info "Then run: ./scripts/setup-production-env.sh"
fi

# 2. Node.js and Dependencies
print_header "2. Node.js Environment"

if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js installed: ${NODE_VERSION}"

    # Check if version is 18 or higher
    NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1 | tr -d 'v')
    if [ "$NODE_MAJOR" -ge 18 ]; then
        check_pass "Node.js version is compatible (18+)"
    else
        check_fail "Node.js version too old (need 18+, have ${NODE_VERSION})"
    fi
else
    check_fail "Node.js is not installed"
fi

if [ -f "package-lock.json" ]; then
    check_pass "package-lock.json exists"
else
    check_warning "package-lock.json not found (run npm install)"
fi

if [ -d "node_modules" ]; then
    check_pass "node_modules directory exists"
else
    check_fail "node_modules not found - run: npm install"
fi

# 3. Database Configuration
print_header "3. Database Setup"

if [ -f "apps/api/prisma/schema.prisma" ]; then
    check_pass "Prisma schema found"
else
    check_fail "Prisma schema not found"
fi

if [ -d "apps/api/prisma/migrations" ]; then
    MIGRATION_COUNT=$(find apps/api/prisma/migrations -type d -mindepth 1 | wc -l)
    check_pass "Found ${MIGRATION_COUNT} Prisma migrations"
else
    check_warning "No Prisma migrations found"
fi

# Check if prisma client is generated
if [ -d "node_modules/.prisma" ] || [ -d "apps/api/node_modules/.prisma" ]; then
    check_pass "Prisma Client is generated"
else
    check_warning "Prisma Client not generated - run: npx prisma generate"
fi

# Test database connection if DATABASE_URL is set
if [ -f ".env.production" ] && grep -q "^DATABASE_URL=" .env.production; then
    export $(cat .env.production | grep DATABASE_URL | xargs)
    if [ ! -z "$DATABASE_URL_UNPOOLED" ]; then
        check_info "Testing database connection..."
        if command -v psql &> /dev/null; then
            if timeout 5 psql "$DATABASE_URL_UNPOOLED" -c "SELECT 1;" &> /dev/null; then
                check_pass "Database connection successful"

                # Check if PostGIS is installed
                if psql "$DATABASE_URL_UNPOOLED" -c "SELECT PostGIS_Version();" &> /dev/null 2>&1; then
                    check_pass "PostGIS extension is enabled"
                else
                    check_fail "PostGIS extension not enabled in database"
                    check_info "Enable it in Supabase: Database → Extensions → Enable PostGIS"
                fi
            else
                check_fail "Cannot connect to database"
            fi
        else
            check_warning "psql not installed, skipping database connection test"
        fi
    fi
fi

# 4. CLI Tools
print_header "4. Deployment CLI Tools"

if command -v railway &> /dev/null; then
    RAILWAY_VERSION=$(railway --version 2>&1 | head -n1)
    check_pass "Railway CLI installed: ${RAILWAY_VERSION}"

    # Check if logged in
    if railway whoami &> /dev/null 2>&1; then
        RAILWAY_USER=$(railway whoami 2>&1 | grep -v "token" | head -n1)
        check_pass "Railway CLI authenticated: ${RAILWAY_USER}"
    else
        check_fail "Railway CLI not authenticated - run: railway login"
    fi
else
    check_fail "Railway CLI not installed"
    check_info "Install: npm install -g @railway/cli"
fi

if command -v vercel &> /dev/null; then
    VERCEL_VERSION=$(vercel --version)
    check_pass "Vercel CLI installed: ${VERCEL_VERSION}"

    # Check if logged in
    if vercel whoami &> /dev/null 2>&1; then
        VERCEL_USER=$(vercel whoami 2>&1)
        check_pass "Vercel CLI authenticated: ${VERCEL_USER}"
    else
        check_fail "Vercel CLI not authenticated - run: vercel login"
    fi
else
    check_fail "Vercel CLI not installed"
    check_info "Install: npm install -g vercel"
fi

# 5. Docker (for Railway deployment)
print_header "5. Docker Configuration"

if command -v docker &> /dev/null; then
    DOCKER_VERSION=$(docker --version)
    check_pass "Docker installed: ${DOCKER_VERSION}"

    # Check if Docker daemon is running
    if docker info &> /dev/null; then
        check_pass "Docker daemon is running"
    else
        check_warning "Docker daemon is not running"
    fi
else
    check_warning "Docker not installed (Railway will handle builds)"
fi

if [ -f "apps/api/Dockerfile" ]; then
    check_pass "API Dockerfile exists"
else
    check_fail "API Dockerfile not found"
fi

if [ -f "apps/api/.dockerignore" ]; then
    check_pass "API .dockerignore exists"
else
    check_warning "API .dockerignore not found"
fi

# 6. Build System
print_header "6. Build Configuration"

# Check if build scripts exist
if grep -q '"build"' package.json; then
    check_pass "Build script exists in package.json"
else
    check_fail "Build script missing in package.json"
fi

# Check Turbo config
if [ -f "turbo.json" ]; then
    check_pass "Turbo configuration exists"
else
    check_warning "turbo.json not found"
fi

# Check TypeScript
if command -v tsc &> /dev/null; then
    TSC_VERSION=$(tsc --version)
    check_pass "TypeScript installed: ${TSC_VERSION}"
else
    check_warning "TypeScript not found globally"
fi

# 7. Git Configuration
print_header "7. Git Status"

if git rev-parse --git-dir > /dev/null 2>&1; then
    check_pass "Git repository detected"

    # Check current branch
    CURRENT_BRANCH=$(git branch --show-current)
    check_info "Current branch: ${CURRENT_BRANCH}"

    # Check for uncommitted changes
    if [ -z "$(git status --porcelain)" ]; then
        check_pass "Working directory is clean"
    else
        check_warning "Uncommitted changes detected"
        check_info "Run 'git status' to see changes"
    fi

    # Check if branch is up to date with remote
    git fetch &> /dev/null
    if [ "$(git rev-parse HEAD)" = "$(git rev-parse @{u} 2>/dev/null)" ]; then
        check_pass "Branch is up to date with remote"
    else
        check_warning "Branch is not in sync with remote"
    fi
else
    check_fail "Not a git repository"
fi

# 8. GitHub Actions
print_header "8. CI/CD Configuration"

if [ -f ".github/workflows/deploy-production.yml" ]; then
    check_pass "GitHub Actions workflow exists"
else
    check_fail "GitHub Actions workflow not found"
fi

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    check_pass "GitHub CLI installed"

    if gh auth status &> /dev/null 2>&1; then
        check_pass "GitHub CLI authenticated"

        # Check if secrets are set
        check_info "Checking GitHub Secrets..."
        REQUIRED_SECRETS=(
            "DATABASE_URL"
            "RAILWAY_TOKEN"
            "VERCEL_TOKEN"
            "VERCEL_ORG_ID"
            "VERCEL_PROJECT_ID"
        )

        for secret in "${REQUIRED_SECRETS[@]}"; do
            if gh secret list | grep -q "^${secret}"; then
                check_pass "GitHub Secret '${secret}' is set"
            else
                check_fail "GitHub Secret '${secret}' is missing"
                check_info "See: docs/GITHUB_SECRETS_SETUP.md"
            fi
        done
    else
        check_warning "GitHub CLI not authenticated"
        check_info "Run: gh auth login"
    fi
else
    check_warning "GitHub CLI not installed (optional)"
    check_info "Install from: https://cli.github.com/"
fi

# 9. Service Credentials Check
print_header "9. Third-Party Services"

if [ -f ".env.production" ]; then
    # Check Stripe keys format
    if grep -q "^STRIPE_SECRET_KEY=" .env.production; then
        STRIPE_KEY=$(grep "^STRIPE_SECRET_KEY=" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [[ $STRIPE_KEY == sk_test_* ]]; then
            check_warning "Using Stripe TEST keys (expected for initial deployment)"
        elif [[ $STRIPE_KEY == sk_live_* ]]; then
            check_pass "Using Stripe LIVE keys"
        else
            check_fail "Stripe secret key format invalid"
        fi
    fi

    # Check SendGrid key format
    if grep -q "^SENDGRID_API_KEY=" .env.production; then
        SENDGRID_KEY=$(grep "^SENDGRID_API_KEY=" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [[ $SENDGRID_KEY == SG.* ]]; then
            check_pass "SendGrid API key format is correct"
        else
            check_fail "SendGrid API key format invalid (should start with 'SG.')"
        fi
    fi

    # Check AWS keys format
    if grep -q "^AWS_S3_ACCESS_KEY_ID=" .env.production; then
        AWS_KEY=$(grep "^AWS_S3_ACCESS_KEY_ID=" .env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
        if [[ $AWS_KEY == AKIA* ]]; then
            check_pass "AWS access key format is correct"
        else
            check_fail "AWS access key format invalid (should start with 'AKIA')"
        fi
    fi
fi

# 10. Security Checks
print_header "10. Security Configuration"

# Check if .env files are in .gitignore
if [ -f ".gitignore" ]; then
    if grep -q ".env.production" .gitignore; then
        check_pass ".env.production is in .gitignore"
    else
        check_fail ".env.production is NOT in .gitignore (CRITICAL)"
    fi

    if grep -q ".env.local" .gitignore; then
        check_pass ".env.local is in .gitignore"
    else
        check_warning ".env.local should be in .gitignore"
    fi
fi

# Check for accidentally committed secrets
if git rev-parse --git-dir > /dev/null 2>&1; then
    if git log --all --full-history --source --oneline -- .env.production .env.local &> /dev/null; then
        if [ $(git log --all --full-history --source --oneline -- .env.production .env.local 2>/dev/null | wc -l) -gt 0 ]; then
            check_fail "CRITICAL: .env files found in git history!"
            check_info "You may need to remove sensitive data from git history"
        else
            check_pass "No .env files found in git history"
        fi
    else
        check_pass "No .env files found in git history"
    fi
fi

# Check for common security issues
if [ -f ".env.production" ]; then
    if grep -q "password123\|admin123\|test123" .env.production; then
        check_fail "Weak passwords detected in .env.production"
    fi
fi

# Summary
print_header "Verification Summary"

echo ""
echo -e "${GREEN}✓ Passed:  ${CHECKS_PASSED}${NC}"
echo -e "${YELLOW}⚠ Warnings: ${CHECKS_WARNING}${NC}"
echo -e "${RED}✗ Failed:  ${CHECKS_FAILED}${NC}"
echo -e "─────────────────"
echo -e "Total:     ${TOTAL_CHECKS}"
echo ""

# Determine overall status
if [ $CHECKS_FAILED -eq 0 ]; then
    if [ $CHECKS_WARNING -eq 0 ]; then
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}║  ✓ All checks passed! Ready for deployment.          ║${NC}"
        echo -e "${GREEN}║                                                       ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "Next steps:"
        echo "  1. Run database migrations: cd apps/api && npx prisma migrate deploy"
        echo "  2. Deploy backend: railway up --service homemore-api"
        echo "  3. Deploy frontend: cd apps/web && vercel --prod"
        echo ""
        echo "Or use the automated script:"
        echo "  ./scripts/deploy-quick-mvp.sh"
        echo ""
        exit 0
    else
        echo -e "${YELLOW}╔═══════════════════════════════════════════════════════╗${NC}"
        echo -e "${YELLOW}║                                                       ║${NC}"
        echo -e "${YELLOW}║  ⚠ Warnings detected. Review before deploying.       ║${NC}"
        echo -e "${YELLOW}║                                                       ║${NC}"
        echo -e "${YELLOW}╚═══════════════════════════════════════════════════════╝${NC}"
        echo ""
        echo "You can proceed with deployment, but review warnings above."
        echo ""
        exit 0
    fi
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║  ✗ Critical issues found. Fix before deploying.      ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Please fix the failed checks above before deploying."
    echo ""

    if [ ${#MISSING_VARS[@]} -gt 0 ]; then
        echo "Missing environment variables:"
        for var in "${MISSING_VARS[@]}"; do
            echo "  - $var"
        done
        echo ""
        echo "Run: ./scripts/setup-production-env.sh"
        echo "Or see: docs/SERVICE_SIGNUP_GUIDE.md"
        echo ""
    fi

    exit 1
fi
