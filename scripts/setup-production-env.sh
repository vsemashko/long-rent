#!/bin/bash

################################################################################
# Production Environment Setup Script
#
# This script helps you interactively set up your production environment
# by generating secrets and guiding you through service configuration.
#
# Usage: ./scripts/setup-production-env.sh
################################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${GREEN}$1${NC}"
    echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo ""
}

print_step() {
    echo -e "${BLUE}▶${NC} $1"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

prompt_value() {
    local var_name=$1
    local description=$2
    local current_value=$3

    if [ -n "$current_value" ]; then
        echo -e "${BLUE}$var_name${NC} ($description)"
        echo "  Current: $current_value"
        read -p "  Keep this value? (Y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Nn]$ ]]; then
            read -p "  New value: " new_value
            echo "$new_value"
        else
            echo "$current_value"
        fi
    else
        echo -e "${BLUE}$var_name${NC} ($description)"
        read -p "  Value: " new_value
        echo "$new_value"
    fi
}

# Start
print_header "🔧 HomeMore Production Environment Setup"

echo "This script will help you set up your production environment."
echo "You'll need credentials from the following services:"
echo "  • Supabase (Database)"
echo "  • Upstash (Redis)"
echo "  • AWS S3 (File Storage)"
echo "  • Stripe (Payments)"
echo "  • SendGrid (Email)"
echo "  • Google Cloud (Maps & Analytics)"
echo "  • Sentry (Error Tracking)"
echo "  • Mixpanel (Analytics)"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Setup cancelled"
    exit 1
fi

# Check if .env.production already exists
if [ -f ".env.production" ]; then
    print_warning ".env.production already exists"
    read -p "Do you want to update it? (y/N) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "Setup cancelled"
        exit 1
    fi
    # Load existing values
    export $(cat .env.production | grep -v '^#' | xargs) 2>/dev/null || true
else
    # Copy template
    cp .env.production.template .env.production
    print_success "Created .env.production from template"
fi

# Generate secrets
print_header "🔐 Generating Secure Secrets"

print_step "Generating JWT_SECRET..."
JWT_SECRET=$(openssl rand -hex 64)
print_success "Generated 64-character random secret"

print_step "Generating JWT_REFRESH_SECRET..."
JWT_REFRESH_SECRET=$(openssl rand -hex 64)
print_success "Generated 64-character random secret"

print_step "Generating SESSION_SECRET..."
SESSION_SECRET=$(openssl rand -hex 64)
print_success "Generated 64-character random secret"

# Update .env.production with secrets
sed -i "s/JWT_SECRET=\".*\"/JWT_SECRET=\"$JWT_SECRET\"/" .env.production
sed -i "s/JWT_REFRESH_SECRET=\".*\"/JWT_REFRESH_SECRET=\"$JWT_REFRESH_SECRET\"/" .env.production
sed -i "s/SESSION_SECRET=\".*\"/SESSION_SECRET=\"$SESSION_SECRET\"/" .env.production

print_success "Secrets saved to .env.production"

# Collect service credentials
print_header "📝 Service Configuration"

echo ""
echo "Now let's configure your third-party services."
echo "You can skip any service and fill it in manually later."
echo ""

# Supabase
print_header "1. Supabase (Database)"
echo "Get these from: Supabase Dashboard > Project Settings > Database"
echo ""
DATABASE_URL=$(prompt_value "DATABASE_URL" "Connection pooling URL" "$DATABASE_URL")
if [ -n "$DATABASE_URL" ]; then
    sed -i "s|DATABASE_URL=\".*\"|DATABASE_URL=\"$DATABASE_URL\"|" .env.production
    print_success "Supabase URL saved"
fi

# Upstash
print_header "2. Upstash (Redis Cache)"
echo "Get this from: Upstash Dashboard > Your Database > Details"
echo ""
REDIS_URL=$(prompt_value "REDIS_URL" "Redis connection URL" "$REDIS_URL")
if [ -n "$REDIS_URL" ]; then
    sed -i "s|REDIS_URL=\".*\"|REDIS_URL=\"$REDIS_URL\"|" .env.production
    print_success "Redis URL saved"
fi

# AWS S3
print_header "3. AWS S3 (File Storage)"
echo "Get these from: AWS IAM > Users > Security Credentials"
echo ""
AWS_S3_ACCESS_KEY_ID=$(prompt_value "AWS_S3_ACCESS_KEY_ID" "AWS Access Key ID" "$AWS_S3_ACCESS_KEY_ID")
if [ -n "$AWS_S3_ACCESS_KEY_ID" ]; then
    sed -i "s|AWS_S3_ACCESS_KEY_ID=\".*\"|AWS_S3_ACCESS_KEY_ID=\"$AWS_S3_ACCESS_KEY_ID\"|" .env.production
fi

AWS_S3_SECRET_ACCESS_KEY=$(prompt_value "AWS_S3_SECRET_ACCESS_KEY" "AWS Secret Access Key" "$AWS_S3_SECRET_ACCESS_KEY")
if [ -n "$AWS_S3_SECRET_ACCESS_KEY" ]; then
    sed -i "s|AWS_S3_SECRET_ACCESS_KEY=\".*\"|AWS_S3_SECRET_ACCESS_KEY=\"$AWS_S3_SECRET_ACCESS_KEY\"|" .env.production
    print_success "AWS credentials saved"
fi

# Stripe
print_header "4. Stripe (Payment Processing)"
echo "Get these from: Stripe Dashboard > Developers > API Keys"
echo ""
STRIPE_SECRET_KEY=$(prompt_value "STRIPE_SECRET_KEY" "Secret key (sk_live_...)" "$STRIPE_SECRET_KEY")
if [ -n "$STRIPE_SECRET_KEY" ]; then
    sed -i "s|STRIPE_SECRET_KEY=\".*\"|STRIPE_SECRET_KEY=\"$STRIPE_SECRET_KEY\"|" .env.production
    print_success "Stripe key saved"
fi

# SendGrid
print_header "5. SendGrid (Email Service)"
echo "Get this from: SendGrid Dashboard > Settings > API Keys"
echo ""
SENDGRID_API_KEY=$(prompt_value "SENDGRID_API_KEY" "API Key (SG.xxx)" "$SENDGRID_API_KEY")
if [ -n "$SENDGRID_API_KEY" ]; then
    sed -i "s|SENDGRID_API_KEY=\".*\"|SENDGRID_API_KEY=\"$SENDGRID_API_KEY\"|" .env.production
    print_success "SendGrid API key saved"
fi

# Google Maps
print_header "6. Google Maps API"
echo "Get this from: Google Cloud Console > APIs & Services > Credentials"
echo ""
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$(prompt_value "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" "Maps API Key" "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY")
if [ -n "$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY" ]; then
    sed -i "s|NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=\".*\"|NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=\"$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY\"|" .env.production
    print_success "Google Maps API key saved"
fi

# Google Analytics
print_header "7. Google Analytics 4"
echo "Get this from: Google Analytics > Admin > Data Streams"
echo ""
NEXT_PUBLIC_GA_MEASUREMENT_ID=$(prompt_value "NEXT_PUBLIC_GA_MEASUREMENT_ID" "Measurement ID (G-xxx)" "$NEXT_PUBLIC_GA_MEASUREMENT_ID")
if [ -n "$NEXT_PUBLIC_GA_MEASUREMENT_ID" ]; then
    sed -i "s|NEXT_PUBLIC_GA_MEASUREMENT_ID=\".*\"|NEXT_PUBLIC_GA_MEASUREMENT_ID=\"$NEXT_PUBLIC_GA_MEASUREMENT_ID\"|" .env.production
    print_success "GA4 measurement ID saved"
fi

# Sentry
print_header "8. Sentry (Error Tracking)"
echo "Get this from: Sentry Project > Settings > Client Keys (DSN)"
echo ""
SENTRY_DSN=$(prompt_value "SENTRY_DSN" "Sentry DSN" "$SENTRY_DSN")
if [ -n "$SENTRY_DSN" ]; then
    sed -i "s|SENTRY_DSN=\".*\"|SENTRY_DSN=\"$SENTRY_DSN\"|" .env.production
    sed -i "s|NEXT_PUBLIC_SENTRY_DSN=\".*\"|NEXT_PUBLIC_SENTRY_DSN=\"$SENTRY_DSN\"|" .env.production
    print_success "Sentry DSN saved"
fi

# Mixpanel
print_header "9. Mixpanel (Analytics)"
echo "Get this from: Mixpanel Project > Settings > Project Token"
echo ""
NEXT_PUBLIC_MIXPANEL_TOKEN=$(prompt_value "NEXT_PUBLIC_MIXPANEL_TOKEN" "Project Token" "$NEXT_PUBLIC_MIXPANEL_TOKEN")
if [ -n "$NEXT_PUBLIC_MIXPANEL_TOKEN" ]; then
    sed -i "s|NEXT_PUBLIC_MIXPANEL_TOKEN=\".*\"|NEXT_PUBLIC_MIXPANEL_TOKEN=\"$NEXT_PUBLIC_MIXPANEL_TOKEN\"|" .env.production
    print_success "Mixpanel token saved"
fi

# Summary
print_header "✅ Configuration Complete"

echo ""
echo "Your production environment is configured in:"
echo "  .env.production"
echo ""
echo "Next steps:"
echo "  1. Review .env.production and fill in any missing values"
echo "  2. Deploy to Railway: railway up"
echo "  3. Deploy to Vercel: vercel --prod"
echo ""
echo "See docs/QUICK_MVP_DEPLOYMENT.md for detailed deployment instructions"
echo ""

print_success "Setup complete! 🎉"
