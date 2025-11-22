#!/bin/bash

# GitHub Secrets Setup Script
# Automatically adds all required secrets to GitHub Actions

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
ENV_FILE="${1:-.env.production}"

# Helper functions
print_header() {
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

success() {
    echo -e "${GREEN}✓${NC} $1"
}

error() {
    echo -e "${RED}✗${NC} $1"
}

warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# Start
clear
echo -e "${BLUE}"
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                                                              ║"
echo "║         GitHub Actions Secrets Setup                        ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# 1. Check prerequisites
print_header "1. Checking Prerequisites"

# Check if gh CLI is installed
if command -v gh &> /dev/null; then
    success "GitHub CLI is installed"
else
    error "GitHub CLI is not installed"
    echo ""
    echo "Install GitHub CLI:"
    echo "  macOS:   brew install gh"
    echo "  Linux:   https://github.com/cli/cli/blob/trunk/docs/install_linux.md"
    echo "  Windows: https://github.com/cli/cli/releases"
    echo ""
    exit 1
fi

# Check if authenticated
if gh auth status &> /dev/null 2>&1; then
    success "GitHub CLI is authenticated"
else
    error "GitHub CLI is not authenticated"
    echo ""
    echo "Run: gh auth login"
    exit 1
fi

# Check if .env.production exists
if [ -f "$ENV_FILE" ]; then
    success "Environment file found: $ENV_FILE"
else
    error "Environment file not found: $ENV_FILE"
    echo ""
    echo "Create it by running:"
    echo "  cp .env.production.template .env.production"
    echo "  ./scripts/setup-production-env.sh"
    echo ""
    exit 1
fi

# 2. Load environment variables
print_header "2. Loading Environment Variables"

# Load .env file
set -a
source "$ENV_FILE"
set +a

success "Environment variables loaded from $ENV_FILE"

# 3. Verify required variables
print_header "3. Verifying Required Variables"

MISSING_VARS=()
SECRETS_TO_ADD=()

check_var() {
    local var_name=$1
    local var_value=${!var_name}

    if [ -z "$var_value" ] || [[ "$var_value" == *"REPLACE_WITH"* ]] || [[ "$var_value" == *"your-"* ]]; then
        warning "$var_name is not configured (will skip)"
        MISSING_VARS+=("$var_name")
        return 1
    else
        success "$var_name is set"
        SECRETS_TO_ADD+=("$var_name")
        return 0
    fi
}

# Database secrets
check_var "DATABASE_URL"
check_var "DATABASE_URL_UNPOOLED"

# Hosting secrets (need to be obtained separately)
info "RAILWAY_TOKEN - Obtain by running: railway whoami --token"
info "VERCEL_TOKEN - Obtain by running: vercel token create"
info "VERCEL_ORG_ID - Found in .vercel/project.json after running: vercel link"
info "VERCEL_PROJECT_ID - Found in .vercel/project.json after running: vercel link"

# API URL
check_var "API_URL" || API_URL="https://api.homemore.pl"
check_var "NEXT_PUBLIC_API_URL" || NEXT_PUBLIC_API_URL="$API_URL"

# Third-party services
check_var "AWS_S3_ACCESS_KEY_ID"
check_var "AWS_S3_SECRET_ACCESS_KEY"
check_var "SENDGRID_API_KEY"
check_var "STRIPE_SECRET_KEY"
check_var "SENTRY_DSN"

# Security secrets
check_var "JWT_SECRET"
check_var "JWT_REFRESH_SECRET"
check_var "SESSION_SECRET"

echo ""

# 4. Prompt for missing hosting tokens
print_header "4. Collecting Hosting Platform Tokens"

# Railway token
if [ -z "$RAILWAY_TOKEN" ]; then
    echo ""
    echo "To get your RAILWAY_TOKEN:"
    echo "  1. Run: railway login"
    echo "  2. Run: railway whoami --token"
    echo "  3. Copy the token"
    echo ""
    read -p "Enter RAILWAY_TOKEN (or press Enter to skip): " RAILWAY_TOKEN
    if [ ! -z "$RAILWAY_TOKEN" ]; then
        SECRETS_TO_ADD+=("RAILWAY_TOKEN")
        success "RAILWAY_TOKEN entered"
    fi
else
    success "RAILWAY_TOKEN is already set"
    SECRETS_TO_ADD+=("RAILWAY_TOKEN")
fi

# Vercel token
if [ -z "$VERCEL_TOKEN" ]; then
    echo ""
    echo "To get your VERCEL_TOKEN:"
    echo "  1. Run: vercel login"
    echo "  2. Run: vercel token create \"GitHub Actions\""
    echo "  3. Copy the token"
    echo ""
    read -p "Enter VERCEL_TOKEN (or press Enter to skip): " VERCEL_TOKEN
    if [ ! -z "$VERCEL_TOKEN" ]; then
        SECRETS_TO_ADD+=("VERCEL_TOKEN")
        success "VERCEL_TOKEN entered"
    fi
else
    success "VERCEL_TOKEN is already set"
    SECRETS_TO_ADD+=("VERCEL_TOKEN")
fi

# Vercel Org ID
if [ -z "$VERCEL_ORG_ID" ]; then
    echo ""
    echo "To get your VERCEL_ORG_ID:"
    echo "  1. Run: cd apps/web && vercel link"
    echo "  2. Run: cat .vercel/project.json"
    echo "  3. Copy the 'orgId' value"
    echo ""
    read -p "Enter VERCEL_ORG_ID (or press Enter to skip): " VERCEL_ORG_ID
    if [ ! -z "$VERCEL_ORG_ID" ]; then
        SECRETS_TO_ADD+=("VERCEL_ORG_ID")
        success "VERCEL_ORG_ID entered"
    fi
else
    success "VERCEL_ORG_ID is already set"
    SECRETS_TO_ADD+=("VERCEL_ORG_ID")
fi

# Vercel Project ID
if [ -z "$VERCEL_PROJECT_ID" ]; then
    echo ""
    echo "To get your VERCEL_PROJECT_ID:"
    echo "  1. Same file: cat .vercel/project.json"
    echo "  2. Copy the 'projectId' value"
    echo ""
    read -p "Enter VERCEL_PROJECT_ID (or press Enter to skip): " VERCEL_PROJECT_ID
    if [ ! -z "$VERCEL_PROJECT_ID" ]; then
        SECRETS_TO_ADD+=("VERCEL_PROJECT_ID")
        success "VERCEL_PROJECT_ID entered"
    fi
else
    success "VERCEL_PROJECT_ID is already set"
    SECRETS_TO_ADD+=("VERCEL_PROJECT_ID")
fi

# 5. Summary
print_header "5. Summary"

echo "Secrets to add: ${#SECRETS_TO_ADD[@]}"
echo "Missing/skipped: ${#MISSING_VARS[@]}"
echo ""

if [ ${#SECRETS_TO_ADD[@]} -eq 0 ]; then
    error "No secrets to add. Please configure your environment first."
    exit 1
fi

# List secrets
echo "Will add these secrets:"
for secret in "${SECRETS_TO_ADD[@]}"; do
    echo "  - $secret"
done

echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "Will skip these (not configured):"
    for var in "${MISSING_VARS[@]}"; do
        echo "  - $var"
    done
    echo ""
fi

# Confirm
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 1
fi

# 6. Add secrets to GitHub
print_header "6. Adding Secrets to GitHub"

ADDED=0
FAILED=0

for secret_name in "${SECRETS_TO_ADD[@]}"; do
    secret_value="${!secret_name}"

    if [ ! -z "$secret_value" ]; then
        echo -n "Adding $secret_name... "

        if gh secret set "$secret_name" --body "$secret_value" &> /dev/null; then
            echo -e "${GREEN}✓${NC}"
            ((ADDED++))
        else
            echo -e "${RED}✗${NC}"
            ((FAILED++))
        fi
    fi
done

echo ""

# 7. Final summary
print_header "7. Results"

echo ""
echo -e "${GREEN}✓ Added:  ${ADDED}${NC}"
echo -e "${RED}✗ Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}║  ✓ All secrets added successfully!                   ║${NC}"
    echo -e "${GREEN}║                                                       ║${NC}"
    echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Next steps:"
    echo "  1. Verify secrets: gh secret list"
    echo "  2. Test deployment workflow"
    echo "  3. Push to main branch to trigger deployment"
    echo ""
    exit 0
else
    echo -e "${RED}╔═══════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}║  ✗ Some secrets failed to add.                       ║${NC}"
    echo -e "${RED}║                                                       ║${NC}"
    echo -e "${RED}╚═══════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo "Check errors above and try again."
    echo ""
    exit 1
fi
