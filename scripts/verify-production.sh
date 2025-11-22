#!/bin/bash

################################################################################
# Production Verification Script
#
# This script verifies that all production requirements are met before launch.
# Run this script before deploying to production.
#
# Usage: ./scripts/verify-production.sh
################################################################################

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
PASSED=0
FAILED=0
WARNINGS=0

# Functions
print_header() {
    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "$1"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
}

pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASSED++))
}

fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAILED++))
}

warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARNINGS++))
}

check_command() {
    if command -v $1 &> /dev/null; then
        pass "$1 is installed"
        return 0
    else
        fail "$1 is not installed"
        return 1
    fi
}

check_env_var() {
    if [ -z "${!1}" ]; then
        fail "$1 environment variable not set"
        return 1
    else
        pass "$1 environment variable is set"
        return 0
    fi
}

check_file_exists() {
    if [ -f "$1" ]; then
        pass "$1 exists"
        return 0
    else
        fail "$1 does not exist"
        return 1
    fi
}

# Start verification
print_header "🚀 HomeMore Production Verification"

echo "Starting verification at $(date)"
echo ""

################################################################################
# 1. Check Required Tools
################################################################################

print_header "1. Checking Required Tools"

check_command "node"
check_command "npm"
check_command "git"
check_command "docker" || warn "Docker not installed (optional but recommended)"
check_command "psql" || warn "PostgreSQL client not installed (optional)"

# Check Node version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -ge 20 ]; then
    pass "Node.js version is 20+ ($NODE_VERSION)"
else
    fail "Node.js version should be 20+ (current: $NODE_VERSION)"
fi

################################################################################
# 2. Check Repository Status
################################################################################

print_header "2. Checking Repository Status"

# Check if on correct branch
CURRENT_BRANCH=$(git branch --show-current)
if [[ $CURRENT_BRANCH == claude/proceed-roadmap-* ]] || [[ $CURRENT_BRANCH == "main" ]]; then
    pass "On deployment branch ($CURRENT_BRANCH)"
else
    warn "Current branch is $CURRENT_BRANCH"
fi

# Check for uncommitted changes
if [ -z "$(git status --porcelain)" ]; then
    pass "No uncommitted changes"
else
    fail "There are uncommitted changes"
    git status --short
fi

# Check if branch is up to date with remote
git fetch origin &>/dev/null
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "no-remote")
if [ "$LOCAL" = "$REMOTE" ]; then
    pass "Branch is up to date with remote"
elif [ "$REMOTE" = "no-remote" ]; then
    warn "No remote tracking branch found"
else
    fail "Branch is not up to date with remote"
fi

################################################################################
# 3. Check Environment Configuration
################################################################################

print_header "3. Checking Environment Configuration"

# Check for .env files
check_file_exists ".env.production" || warn ".env.production not found (create from .env.example)"
check_file_exists "apps/api/.env" || check_file_exists "apps/api/.env.production"
check_file_exists "apps/web/.env.local" || check_file_exists "apps/web/.env.production"

# Load and check critical environment variables
if [ -f ".env.production" ]; then
    export $(cat .env.production | grep -v '^#' | xargs)
fi

# Critical backend variables
check_env_var "DATABASE_URL" || warn "Database connection string not configured"
check_env_var "REDIS_URL" || warn "Redis connection string not configured"
check_env_var "JWT_SECRET" || fail "JWT secret not configured"
check_env_var "STRIPE_SECRET_KEY" || warn "Stripe API key not configured"

# Check if using default/weak secrets
if [ -n "$JWT_SECRET" ] && [[ "$JWT_SECRET" == *"your-super-secret"* ]]; then
    fail "JWT_SECRET is still using default value - SECURITY RISK!"
fi

################################################################################
# 4. Check Dependencies
################################################################################

print_header "4. Checking Dependencies"

# Check if node_modules exists
if [ -d "node_modules" ]; then
    pass "node_modules directory exists"
else
    fail "node_modules not found - run 'npm install'"
fi

# Check for security vulnerabilities
if npm audit --production --audit-level=high 2>&1 | grep -q "found 0 vulnerabilities"; then
    pass "No high-severity npm vulnerabilities"
else
    warn "High-severity npm vulnerabilities found - run 'npm audit'"
fi

################################################################################
# 5. Check Build Status
################################################################################

print_header "5. Checking Build Status"

# Check if builds exist
if [ -d "apps/web/.next" ]; then
    pass "Frontend build exists"
else
    fail "Frontend not built - run 'npm run build' in apps/web"
fi

if [ -d "apps/api/dist" ]; then
    pass "Backend build exists"
else
    fail "Backend not built - run 'npm run build' in apps/api"
fi

# Try to build if not exists
if [ ! -d "apps/web/.next" ] || [ ! -d "apps/api/dist" ]; then
    echo ""
    echo "Attempting to build..."
    npm run build 2>&1 | tail -n 5
    if [ $? -eq 0 ]; then
        pass "Build successful"
    else
        fail "Build failed"
    fi
fi

################################################################################
# 6. Check Database Configuration
################################################################################

print_header "6. Checking Database Configuration"

# Check Prisma schema
check_file_exists "apps/api/prisma/schema.prisma"

# Check if migrations are generated
if [ -d "apps/api/prisma/migrations" ] && [ "$(ls -A apps/api/prisma/migrations)" ]; then
    pass "Database migrations exist"
else
    warn "No database migrations found"
fi

# Try to connect to database (if credentials available)
if [ -n "$DATABASE_URL" ]; then
    if cd apps/api && npx prisma db execute --stdin <<< "SELECT 1" &>/dev/null; then
        pass "Database connection successful"
    else
        fail "Cannot connect to database"
    fi
    cd ../..
fi

################################################################################
# 7. Check Test Status
################################################################################

print_header "7. Checking Test Status"

# Check if test files exist
TEST_FILES=$(find apps -name "*.test.ts" -o -name "*.test.tsx" -o -name "*.spec.ts" -o -name "*.e2e-spec.ts" | wc -l)
if [ "$TEST_FILES" -gt 0 ]; then
    pass "Found $TEST_FILES test files"
else
    warn "No test files found"
fi

# Check for E2E tests
if [ -d "apps/web/e2e" ] && [ "$(ls -A apps/web/e2e)" ]; then
    pass "E2E tests exist"
else
    warn "No E2E tests found"
fi

################################################################################
# 8. Check Documentation
################################################################################

print_header "8. Checking Documentation"

check_file_exists "README.md"
check_file_exists "docs/PRODUCTION_DEPLOYMENT.md"
check_file_exists "docs/PERFORMANCE.md"
check_file_exists "docs/TESTING.md"
check_file_exists "docs/ACCESSIBILITY.md"
check_file_exists "docs/ANALYTICS.md"
check_file_exists "docs/LAUNCH_CHECKLIST.md"

################################################################################
# 9. Check Security Configuration
################################################################################

print_header "9. Checking Security Configuration"

# Check for exposed secrets in code
if grep -r -i "password.*=.*['\"]" --include="*.ts" --include="*.tsx" --exclude-dir=node_modules apps/ 2>/dev/null | grep -v "type.*password" | grep -q .; then
    fail "Potential hardcoded passwords found in code"
else
    pass "No obvious hardcoded passwords in code"
fi

# Check next.config.js for security headers
if grep -q "Strict-Transport-Security" apps/web/next.config.js; then
    pass "Security headers configured in Next.js"
else
    fail "Security headers not configured in next.config.js"
fi

# Check for .env files in .gitignore
if grep -q ".env" .gitignore; then
    pass ".env files are gitignored"
else
    fail ".env files might not be gitignored - SECURITY RISK!"
fi

################################################################################
# 10. Check Production Readiness Files
################################################################################

print_header "10. Checking Production Readiness Files"

check_file_exists "apps/web/public/robots.txt"
check_file_exists "apps/web/app/sitemap.ts"
check_file_exists "apps/web/src/app/faq/page.tsx"
check_file_exists "apps/api/src/health/health.controller.ts" || warn "Health check endpoint not found"

################################################################################
# Summary
################################################################################

print_header "📊 Verification Summary"

echo ""
echo "Results:"
echo -e "  ${GREEN}✓ Passed:${NC}   $PASSED"
echo -e "  ${YELLOW}⚠ Warnings:${NC} $WARNINGS"
echo -e "  ${RED}✗ Failed:${NC}   $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    if [ $WARNINGS -eq 0 ]; then
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${GREEN}🎉 All checks passed! Ready for production deployment.${NC}"
        echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    else
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${YELLOW}⚠️  Passed with warnings. Review warnings before deploying.${NC}"
        echo -e "${YELLOW}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        exit 0
    fi
else
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${RED}❌ $FAILED checks failed. Fix issues before deploying.${NC}"
    echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    exit 1
fi
