#!/bin/bash

################################################################################
# Quick MVP Deployment Script
#
# This script automates the deployment of HomeMore to production using:
# - Vercel (Frontend)
# - Railway (Backend)
# - Supabase (Database)
#
# Prerequisites:
# - Vercel CLI installed (npm install -g vercel)
# - Railway CLI installed (npm install -g @railway/cli)
# - All services set up (see docs/QUICK_MVP_DEPLOYMENT.md)
# - .env.production file configured
#
# Usage: ./scripts/deploy-quick-mvp.sh
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

# Check prerequisites
print_header "🚀 HomeMore Quick MVP Deployment"

echo "Checking prerequisites..."

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    print_error "Vercel CLI not found. Install with: npm install -g vercel"
    exit 1
else
    print_success "Vercel CLI installed"
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    print_error "Railway CLI not found. Install with: npm install -g @railway/cli"
    exit 1
else
    print_success "Railway CLI installed"
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    print_warning ".env.production not found"
    echo "Please create .env.production from .env.production.template"
    echo "See docs/QUICK_MVP_DEPLOYMENT.md for instructions"
    exit 1
else
    print_success ".env.production found"
fi

# Confirm deployment
echo ""
echo -e "${YELLOW}This will deploy HomeMore to production.${NC}"
echo "Backend: Railway"
echo "Frontend: Vercel"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

# Load environment variables
print_header "📋 Loading Environment Configuration"
export $(cat .env.production | grep -v '^#' | xargs)
print_success "Environment variables loaded"

# Check database connection
print_header "🗄️  Database Migration"
echo "Checking database connection..."

if [ -z "$DATABASE_URL" ]; then
    print_error "DATABASE_URL not set in .env.production"
    exit 1
fi

cd apps/api

# Generate Prisma Client
echo "Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1
print_success "Prisma Client generated"

# Run migrations
echo "Running database migrations..."
if npx prisma migrate deploy; then
    print_success "Database migrations successful"
else
    print_error "Database migration failed"
    exit 1
fi

cd ../..

# Deploy Backend to Railway
print_header "🚂 Deploying Backend to Railway"

echo "Logging in to Railway..."
railway login

echo "Deploying backend..."
if railway up --service homemore-api; then
    print_success "Backend deployed to Railway"
else
    print_error "Backend deployment failed"
    exit 1
fi

# Get Railway URL
RAILWAY_URL=$(railway domain)
print_success "Backend URL: $RAILWAY_URL"

# Deploy Frontend to Vercel
print_header "▲ Deploying Frontend to Vercel"

cd apps/web

echo "Logging in to Vercel..."
vercel login

echo "Deploying frontend..."
if vercel --prod --yes; then
    print_success "Frontend deployed to Vercel"
else
    print_error "Frontend deployment failed"
    exit 1
fi

# Get Vercel URL
VERCEL_URL=$(vercel inspect --scope $(vercel whoami) --token $(vercel token) | grep -oP 'https://[^\s]+' | head -1)
print_success "Frontend URL: $VERCEL_URL"

cd ../..

# Run post-deployment checks
print_header "✅ Post-Deployment Verification"

echo "Waiting for services to be ready (30s)..."
sleep 30

# Health check backend
echo "Checking backend health..."
if curl -f -s "$RAILWAY_URL/health" > /dev/null; then
    print_success "Backend health check passed"
else
    print_warning "Backend health check failed (may need more time to start)"
fi

# Check frontend
echo "Checking frontend..."
if curl -f -s "$VERCEL_URL" > /dev/null; then
    print_success "Frontend is accessible"
else
    print_warning "Frontend check failed (may need more time to propagate)"
fi

# Summary
print_header "🎉 Deployment Complete!"

echo ""
echo "Backend:"
echo "  URL: $RAILWAY_URL"
echo "  Health: $RAILWAY_URL/health"
echo "  Logs: railway logs"
echo ""
echo "Frontend:"
echo "  URL: $VERCEL_URL"
echo "  Dashboard: https://vercel.com/dashboard"
echo ""
echo "Next steps:"
echo "  1. Configure custom domain (homemore.pl)"
echo "  2. Set up Stripe webhook"
echo "  3. Configure CloudFlare CDN"
echo "  4. Run smoke tests"
echo "  5. Invite beta testers"
echo ""
echo "See docs/QUICK_MVP_DEPLOYMENT.md for details"
echo ""

print_success "Deployment successful! 🚀"
